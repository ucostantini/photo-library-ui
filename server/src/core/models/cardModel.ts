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
                .finalize().get('SELECT last_insert_rowid() AS id', (_res: RunResult, row: { 'id': number }) => {
                db.prepare('INSERT INTO card_fts VALUES(?,?,?,?)')
                    .run(row.id, this.card.title, this.card.source.website, this.card.source.username)
                    .finalize();
                resolve(row.id);
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
        // TODO revamp this function, absolutely disgusting
        // TODO full text search not done yet
        // TODO do something with the return object types
        return new Promise<Card[]>((resolve, reject) => {
            db.prepare('SELECT cardId FROM card_fts')
                .all((_res: RunResult, cardIds: { 'cardId': number }[]) => {
                    if (cardIds !== undefined && cardIds.length !== 0) {
                        let prep = ' IN (' + '?,'.repeat(cardIds.length)
                        prep = prep.slice(0, prep.length - 1) + ') ';

                        const select = "json_array(json_object(\n" +
                            "               'cardId', cards.cardId,\n" +
                            "               'title', cards.title,\n" +
                            "               'tags', (SELECT json_group_array(tag) FROM tags WHERE cardId" + prep + "),\n" +
                            "               'files', (SELECT json_group_array(fileId) FROM files WHERE cardId" + prep + "),\n" +
                            "               'source', json_object(\n" +
                            "                       'website', cards.website,\n" +
                            "                       'username', cards.username\n" +
                            "                   ),\n" +
                            "               'created', cards.created,\n" +
                            "               'modified', cards.modified\n" +
                            "\n" +
                            "           ))";
                        const cardIdsNumber = cardIds.map((object: { 'cardId': number }) => object.cardId);

                        db.prepare('SELECT ' + select + ' AS cards FROM cards WHERE cardId' + prep + 'ORDER BY ? ' + query._order + ' LIMIT ? OFFSET ?')
                            .get(...(cardIdsNumber), ...cardIdsNumber, ...cardIdsNumber, query._sort, Number(query._limit), Number(query._page) - 1, (_res2: RunResult, cards: { 'cards': Card[] }) => {
                                resolve(cards.cards);
                            }).finalize();
                    } else {
                        resolve([]);
                    }
                }).finalize();
        });
    }
}
