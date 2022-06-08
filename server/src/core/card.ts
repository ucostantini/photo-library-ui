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

    public async create(card: Card, db: Database): Promise<RunResult> {
        return new Promise((resolve, reject) => {
            db.prepare('INSERT INTO cards VALUES(?,?,?,?)')
                .run(card.title.trim(), card.source.website.trim(), card.source.username.trim())
                .finalize().run('SELECT last_insert_rowid()');
        });
    }
}
