import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as cron from 'node-cron';
import * as fs from 'fs';
// @ts-ignore
import * as Vibrant from 'node-vibrant';
import {Database} from './common/database';
import {paramsDB, photoDir, timer} from './common/environment';
import {PhotoModel, PhotoService} from './service/photo.service';

const app = express();
const database = new Database(paramsDB);
database.connect();

const photoService = new PhotoService(database);

function getPallet(folder): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        Vibrant.from(folder).getPalette().then((palette) => {
            resolve(palette);
        }).catch(e => {
            reject(e);
        })
    });
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function RGBToHSL(r, g, b){
    r /= 255;
    g /= 255;
    b /= 255;

    let min = Math.min(r, g, b),
        max = Math.max(r, g, b),
        delta = max - min,
        h = 0,
        s = 0,
        l = 0;

    if(delta === 0){
        h = 0;
    }else if(max === r){
        h = ((g - b) / delta) % 6;
    }else if(max === g){
        h = (b - r) / delta + 2;
    }else{
        h = (r - g) / delta + 4;
    }

    h = Math.round(h * 60);
    if(h < 0){
        h += 360;
    }

    l = (max + min) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return [h, s, l];
}

function distance(color1, color2) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);

    const rmean = (c1.r + c2.r ) / 2;
    const r = c1.r - c2.r;
    const g = c1.g - c2.g;
    const b = c1.b - c2.b;
    return Math.sqrt((((512+rmean)*r*r)>>8) + 4*g*g + (((767-rmean)*b*b)>>8));
}

async function processCron() {
    const files = fs.readdirSync(photoDir);

    let promises: any;

    promises = files.map(async (file) => {
        if (file.indexOf('.jpeg')) {
            const image = fs.readFileSync(`${photoDir}/${file}`);

            const pallet = await getPallet(`${photoDir}/${file}`);

            let photo: PhotoModel = new PhotoModel();
            photo.photo = new Buffer(image).toString('base64');
            photo.vibrant = pallet.Vibrant.hex;
            photo.darkVibrant = pallet.DarkVibrant.hex;
            photo.lightVibrant = pallet.LightVibrant.hex;
            photo.muted = pallet.Muted.hex;
            photo.darkMuted = pallet.DarkMuted.hex;

            photo = await photoService.save(photo);

            console.log(`Added image "${file}" in database with id=${photo.id}`);

            fs.unlinkSync(`${photoDir}/${file}`);
        }
    });
    await Promise.all(promises);
}

cron.schedule(timer, () => {
    processCron();
});


app.use('/assets', express.static(`${__dirname}/../views/assets`));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/../views'));

app.get('/', async  (req, res) => {
    const photos: PhotoModel[] = await photoService.findAll();
    res.render('index.ejs', {
        photos: photos,
        req: null
    });
});

app.post('/', async (req, res) => {
    const photos: PhotoModel[] = await photoService.findAll();

    const result: PhotoModel[] = [];
    photos.forEach(photo => {
        if (distance(photo.vibrant, req.body.color) <= parseInt(req.body.distance) ||
            distance(photo.muted, req.body.color) <= parseInt(req.body.distance)
        ) {
            result.push(photo)
        }
    })

    res.render('index.ejs', {
        photos: result,
        req: req
    });
});

app.listen(3000, () => {
    console.log('App running on port 3000')
});