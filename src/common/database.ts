const {Pool} = require('pg');

export type DatabaseConnectionParams = {
    username: string,
    password: string,
    host: string,
    port: number,
    database: string,
}

export class Database {
    private connectionString: string;
    private pool: any;

    constructor(params: DatabaseConnectionParams) {
        this.connectionString = `postgres://${params.username}:${params.password}@${params.host}:${params.port.toString()}/${params.database}`;
        this.pool = new Pool({
            connectionString: this.connectionString
        });
    }

    public connect() {
        this.pool.connect((err, client, release) => {
            if (err) {
                return console.error('Error acquiring client', err.stack)
            }
            client.query('SELECT NOW()', (err, result) => {
                release()
                if (err) {
                    return console.error('Error executing query', err.stack)
                }
            })
        })
    }

    public getPool(): any {
        return this.pool;
    }
}

