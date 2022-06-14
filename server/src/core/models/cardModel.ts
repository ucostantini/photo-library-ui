import { RunResult } from 'sqlite3';
import { Card, Pagination } from "../../types/card";
import { db } from "../../app";

export class CardModel {

    constructor(private card: Card) {
    }

    public insert(): Promise<number> {
        return new Promise((resolve, reject) => {
            db.prepare('INSERT INTO cards(title,website,username) VALUES(?,?,?)')
                .run(this.card.title, this.card.source.website, this.card.source.username)
                .finalize().run('SELECT last_insert_rowid()', (res: RunResult, err: Error) => {
                if (err) {
                    reject(err);
                } else {
                    db.prepare('INSERT INTO card_fts VALUES(?,?,?,?)')
                        .run(res.lastID, this.card.title, this.card.source.website, this.card.source.username)
                        .finalize();
                    resolve(res.lastID)
                }
            });
        });
    }

    public update(): void {
        db.prepare('UPDATE cards SET title = ?, website = ?, username = ? WHERE cardId = ?')
            .run(this.card.title, this.card.source.website, this.card.source.username)
            .finalize();
        db.prepare('UPDATE card_fts SET title = ?, website = ?, username = ? WHERE cardId = ?')
            .run(this.card.title, this.card.source.website, this.card.source.username, this.card.cardId)
            .finalize();
        db.close();
    }

    public delete(): void {
        db.prepare('DELETE FROM cards WHERE cardId = ?').run(this.card.cardId).finalize();
        db.prepare('DELETE FROM card_fts WHERE cardId = ?').run(this.card.cardId).finalize();
        db.close();
    }

    public exists(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let prep = '?,'.repeat(this.card.files.length - 1);
            db.prepare('SELECT EXISTS (SELECT 1 FROM files WHERE fileId IN (' + prep.slice(0, prep.length - 1) + '))')
                .get(this.card.files, (_res: RunResult, err: Error, row: number) => {
                    if (err)
                        reject(err);
                    if (row === 1)
                        resolve(true);
                    else
                        resolve(false);
                }).finalize();
        });
    }

    public get(query: Pagination): Promise<Card[]> {
        // TODO revamp this, not great.. promise in promise
        return new Promise<Card[]>((resolve, reject) => {
            db.prepare('SELECT cardId FROM card_fts WHERE card_fts MATCH ?')
                .all('', (_res: RunResult, err: Error, cardIds: number[]) => {
                    if (err)
                        reject(err);
                    else if (cardIds !== undefined && cardIds.length !== 0) {
                        let prep = '?,'.repeat(cardIds.length - 1);
                        db.prepare('SELECT * FROM cards WHERE cardId IN (' + prep.slice(0, prep.length - 1) + ') LIMIT ? OFFSET ? ORDER BY ? ?')
                            .all(cardIds, query._limit, query._page, query._sort, query._order, (_res2: RunResult, err2: Error, cards: Card[]) => {
                                if (err2)
                                    reject(err);
                                else
                                    resolve(cards);
                            }).finalize();
                    } else {
                        resolve([]);
                    }
                }).finalize();
        });
    }
}
