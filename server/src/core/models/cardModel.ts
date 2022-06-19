import { RunResult } from 'sqlite3';
import { Card, Pagination } from "../../types/card";
import { db } from "../../app";

export class CardModel {

    constructor(private card: Card) {
    }

    private static getPaginationOffset(query: Pagination): string {
        const l = Number(query._limit);
        const p = Number(query._page);
        return '' + ((l * p) - l);
    }

    public get(query: Pagination): Promise<Card[]> {
        return new Promise<Card[]>((resolve, reject) => {
            if (Object.keys(this.card).length === 0) {
                db.prepare("SELECT DISTINCT cards.cardId, title, json_group_array(DISTINCT fileId) AS files, group_concat(DISTINCT tag) AS tags, website, username, created, modified FROM cards\n" +
                    '    INNER JOIN tags t1 on cards.cardId = t1.cardId\n' +
                    '    INNER JOIN files f on cards.cardId = f.cardId\n' +
                    '    GROUP BY cards.cardId, title, website, username, created, modified\n' +
                    '    ORDER BY cards.' + query._sort + ' ' + query._order + ' LIMIT ? OFFSET ?')
                    .all(query._limit, CardModel.getPaginationOffset(query), (_res: RunResult, err: Error, cards: Card[]) => {
                        if (err) reject(err);
                        resolve(cards);
                    }).finalize();
            } else {
                // TODO tags not included in MATCH, not included in table
                db.prepare("SELECT DISTINCT c.cardId, c.title,\n" +
                    "                json_group_array(DISTINCT fileId) AS files,\n" +
                    "                group_concat(DISTINCT tag) AS tags, c.website, c.username, created, modified\n" +
                    "FROM card_fts\n" +
                    "         INNER JOIN cards c on card_fts.cardId = c.cardId\n" +
                    "                        INNER JOIN tags t1 on c.cardId = t1.cardId\n" +
                    "                        INNER JOIN files f on c.cardId = f.cardId\n" +
                    "WHERE card_fts MATCH ?\n" +
                    "                        GROUP BY c.cardId, c.title, c.website, c.username, created, modified\n" +
                    "                        ORDER BY c." + query._sort + " " + query._order + " LIMIT ? OFFSET ?")
                    .all(this.card.title + ' ' + this.card.website + ' ' + this.card.username, query._limit, CardModel.getPaginationOffset(query), (_res: RunResult, err: Error, cards: Card[]) => {
                        if (err) reject(err);
                        resolve(cards);
                    }).finalize();
            }
        });
    }

    public getTotalCount(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            if (Object.keys(this.card).length === 0) {
                db.get('SELECT COUNT(cardId) AS count FROM cards', (_res: RunResult, err: Error, row: { count: number }) => {
                    if (err) reject(err);
                    resolve(row.count);
                });
            } else {
                db.prepare("SELECT COUNT(cardId) FROM card_fts WHERE card_fts MATCH ?")
                    .get(this.card.title + ' ' + this.card.website + ' ' + this.card.username, (_res: RunResult, err: Error, row: { count: number }) => {
                        if (err) reject(err);
                        resolve(row.count);
                    }).finalize();
            }
        });
    }

    public exists(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let prep = '?,'.repeat(this.card.files.length - 1);
            db.prepare('SELECT EXISTS (SELECT 1 FROM files WHERE fileId IN (' + prep.slice(0, prep.length - 1) + '))')
                .get(this.card.files, (_res: RunResult, err: Error, row: number) => {
                    if (err) reject(err);
                    if (row === 1) resolve(true);
                    else resolve(false);
                }).finalize();
        });
    }

    public create(): Promise<number> {
        return new Promise((resolve, reject) => {
            db.prepare('INSERT INTO cards(title,website,username) VALUES(?,?,?)')
                .run(this.card.title, this.card.website, this.card.username)
                .finalize()
                .get('SELECT last_insert_rowid() AS id', (_res: RunResult, err: Error, row: { 'id': number }) => {
                    if (err) reject(err);
                    db.prepare('INSERT INTO card_fts VALUES(?,?,?,?)')
                        .run(row.id, this.card.title, this.card.website, this.card.username)
                        .finalize();
                    resolve(row.id);
                });
        });
    }

    public update(): void {
        db.prepare('UPDATE cards SET title = ?, website = ?, username = ? WHERE cardId = ?')
            .run(this.card.title, this.card.website, this.card.username)
            .finalize().prepare('UPDATE card_fts SET title = ?, website = ?, username = ? WHERE cardId = ?')
            .run(this.card.title, this.card.website, this.card.username, this.card.cardId)
            .finalize().close();
    }

    public delete(): void {
        db.prepare('DELETE FROM cards WHERE cardId = ?').run(this.card.cardId).finalize()
            .prepare('DELETE FROM card_fts WHERE cardId = ?').run(this.card.cardId).finalize().close();
    }
}
