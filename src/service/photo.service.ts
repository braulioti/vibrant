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

}