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

            const photo: PhotoModel = new PhotoModel();
            photo.photo = new Buffer(image).toString('base64');
            photo.vibrant = pallet.Vibrant.hex;
            photo.darkVibrant = pallet.DarkVibrant.hex;
            photo.lightVibrant = pallet.LightVibrant.hex;
            photo.muted = pallet.Muted.hex;
            photo.darkMuted = pallet.DarkMuted.hex;

            console.log(photo);
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

app.get('/', (req, res) => {
    res.render('index.ejs', {});
});

app.post('/', (req, res) => {
    res.render('index.ejs', {});
});

app.listen(3000, () => {
    console.log('App running on port 3000')
});