import {Database} from './database';

export class Service {
    protected database: Database;

    constructor(database: Database) {
        this.database = database;
    }
}