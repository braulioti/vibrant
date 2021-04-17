import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as cron from 'node-cron';
import * as fs from 'fs';
import {Database} from './common/database';
import {paramsDB, photoDir, timer} from './common/environment';
import {PhotoModel, PhotoService} from './service/photo.service';

const app = express();
const database = new Database(paramsDB);
database.connect();

const photoService = new PhotoService(database);

function processCron() {

    const files = fs.readdirSync(photoDir);
    files.forEach(file => {
        console.log(file);
        if (file.indexOf('.jpeg')) {
            const image = fs.readFileSync(`${photoDir}/${file}`);

            const photo: PhotoModel = new PhotoModel();
            photo.photo = new Buffer(image).toString('base64');

            fs.unlinkSync(`${photoDir}/${file}`);
        }
    });
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