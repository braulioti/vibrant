import {Database} from './database';

export class Service {
    private database: Database;

    constructor(database: Database) {
        this.database = database;
    }
}