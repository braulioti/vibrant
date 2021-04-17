import {Service} from '../common/service';

export class PhotoModel {
    constructor(
        public id?: number,
        public photo?: string,
        public vibrant?: string,
        public muted?: string,
        public darkVibrant?: string,
        public darkMuted?: string,
        public lightVibrant?: string
    ) {
    }
}

export class PhotoService extends Service {
    save(photo: PhotoModel): Promise<PhotoModel> {
        return new Promise<PhotoModel>(async (resolve, reject) => {
            const client = await this.database.getPool().connect();

            client.query(
                'INSERT INTO photo (photo, vibrant, muted, dark_vibrant, dark_muted, light_vibrant) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [photo.photo, photo.vibrant, photo.muted, photo.darkVibrant, photo.darkMuted, photo.lightVibrant], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        photo.id = result.rows[0].id;

                        resolve(photo);
                    }
                });
            });
    }

    findAll(): Promise<PhotoModel[]> {
        return new Promise<PhotoModel[]>(async (resolve, reject) => {
            const client = await this.database.getPool().connect();

            client.query(
                'SELECT photo, vibrant, muted, dark_vibrant, dark_muted, light_vibrant FROM photo'
                , (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        const photos = [];
                        result.rows.forEach(row => {
                            const photo = new PhotoModel();

                            photo.id = row.id;
                            photo.photo = row.photo;
                            photo.vibrant = row.vibrant;
                            photo.muted = row.muted;
                            photo.darkVibrant = row.dark_vibrant;
                            photo.darkMuted = row.dark_muted;
                            photo.lightVibrant = row.light_vibrant;

                            photos.push(photo);
                        });

                        resolve(photos);
                    }
                });
        });
    }
}