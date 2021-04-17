import {DatabaseConnectionParams} from './database';

export const paramsDB: DatabaseConnectionParams = {
    database: 'vibrant',
    username: 'postgres',
    password: 'postgres',
    host: '127.0.0.1',
    port: 5432
}

export const timer = '*/1 * * * *';