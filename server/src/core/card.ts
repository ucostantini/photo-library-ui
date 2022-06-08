import { Source } from '../types/card';
import { Database, RunResult } from 'sqlite3';

export class Card {
    cardId?: number;
    title: string;
    files: number[];
    tags: string;
    source: Source;
    created?: Date;
    modified?: Date;

    constructor() {
    }

    public create(db: Database): Promise<number> {
        return new Promise((resolve, reject) => {
            db.prepare('INSERT INTO cards VALUES(?,?,?,?)')
                .run(this.title, this.source.website, this.source.username)
                .finalize().run('SELECT last_insert_rowid()', (res: RunResult, err: Error) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res.lastID)
                }
            });
        });
    }
}
