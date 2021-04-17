import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as express from 'express';

const app = express();

app.use('/assets', express.static(`${__dirname}/../views/assets`));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/../views'));

app.get('/', (req, res) => {
    res.render('index.ejs', {});
})

app.listen(3000, () => {
    console.log('App running on port 3000')
});