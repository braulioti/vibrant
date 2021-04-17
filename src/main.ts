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
        if (photo.vibrant === req.body.color ||
            photo.lightVibrant === req.body.color ||
            photo.darkVibrant === req.body.color ||
            photo.muted === req.body.color ||
            photo.darkMuted === req.body.color
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