import { Source } from '../../types/card';
import { Database, RunResult } from 'sqlite3';

export class CardModel {
    cardId?: number;
    title?: string;
    files?: number[];
    tags?: string;
    source?: Source;

    constructor() {
    }

    public insert(db: Database): Promise<number> {
        return new Promise((resolve, reject) => {
            db.prepare('INSERT INTO cards(title,website,username) VALUES(?,?,?)')
                .run(this.title, this.source.website, this.source.username)
                .finalize().run('SELECT last_insert_rowid()', (res: RunResult, err: Error) => {
                if (err) {
                    reject(err);
                } else {
                    db.prepare('INSERT INTO card_fts VALUES(?,?,?,?)')
                        .run(res.lastID, this.title, this.source.website, this.source.username)
                        .finalize();
                    resolve(res.lastID)
                }
            });
        });
    }

    public update(db: Database) {
        db.prepare('UPDATE cards SET title = ?, website = ?, username = ? WHERE cardId = ?')
            .run(this.title, this.source.website, this.source.username)
            .finalize();
        db.prepare('UPDATE card_fts SET title = ?, website = ?, username = ? WHERE cardId = ?')
            .run(this.title, this.source.website, this.source.username, this.cardId)
            .finalize();
        db.close();
    }

    public delete(db: Database): void {
        db.prepare('DELETE FROM cards WHERE cardId = ?').run(this.cardId).finalize();
        db.prepare('DELETE FROM card_fts WHERE cardId = ?').run(this.cardId).finalize();
        db.close();
    }

    public exists(db: Database): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let prep = '?,'.repeat(this.files.length - 1);
            db.prepare('SELECT EXISTS (SELECT 1 FROM files WHERE fileId IN (' + prep.slice(0, prep.length - 1) + '))')
                .get(this.files, (_res: RunResult, err: Error, row: number) => {
                    if (err)
                        reject(err);
                    if (row === 1)
                        resolve(true);
                    else
                        resolve(false);
                }).finalize();
        });
    }
}
