import { IDBStrategy } from "./dbStrategy";
import { Card, CardFile, CardResult, Pagination } from "../../types/card";
import { Database, Statement } from "sqlite3";

export class SqliteStrategy implements IDBStrategy {
    private db: Database = new Database(process.env.DB_PATH);

    fileCreate(cardId: number): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.db.prepare('INSERT INTO files (cardId) VALUES(?)')
                .run(cardId)
                .finalize()
                .get('SELECT last_insert_rowid() AS id', (err: Error, row: { 'id': number }) => {
                    if (err) reject(err)
                    else resolve(row.id)
                });
        });
    }

    fileLink(cardId: number, files: CardFile[]): void {
        let statement: Statement = this.db.prepare('INSERT INTO files (cardId, fileId) VALUES(?,?)');
        files.forEach((file: CardFile) => {
            statement.run(cardId, file.fileId);
        });
        statement.finalize()
            .run('DELETE FROM files WHERE cardId IS NULL AND fileId IS NULL');
    }

    fileDelete(files: CardFile[]) {
        const statement: Statement = this.db.prepare('DELETE FROM files WHERE fileId = ?');
        files.forEach((file: CardFile) => statement.run(file.fileId));
    }

    tagCreate(cardId: number, tags: string[]): void {
        const statement: Statement = this.db.prepare('INSERT OR IGNORE INTO tags VALUES(?,?)');
        tags.forEach((tag: string) => statement.run(cardId, tag.trim()))
        statement.finalize();
    }

    tagUpdate(cardId: number): void {
        this.db.prepare('DELETE FROM tags WHERE cardId = ?').run(cardId).finalize();
    }

    cardGetFilesById(cardId: number): Promise<CardFile[]> {
        return new Promise<CardFile[]>((resolve, reject) => {
            this.db.prepare("SELECT fileId FROM files WHERE cardId = ?")
                .get(cardId, (err: Error, rows: CardFile[]) => {
                    if (err) reject(err);
                    resolve(rows);
                }).finalize();
        });
    }

    cardGetAll(query: Pagination): Promise<CardResult> {
        return new Promise<CardResult>((resolve, reject) => {
            this.db.prepare(`SELECT DISTINCT cards.cardId,
                                                title,
                                                json_group_array(DISTINCT json_object('fileId',fileId, 'fileName',fileName)) AS files,
                                                group_concat(DISTINCT tag)                                                   AS tags,
                                                website,
                                                username,
                                                created,
                                                modified
                                FROM cards
                                         INNER JOIN tags t1 on cards.cardId = t1.cardId
                                         INNER JOIN files f on cards.cardId = f.cardId
                                GROUP BY cards.cardId, title, website, username, created, modified` +
                '               ORDER BY cards.' + query._sort + ' ' + query._order + ' LIMIT ? OFFSET ?')
                .all([query._limit, query._page], (err: Error, cards: Card[]) => {
                    if (err) reject(err);
                    this.db.get('SELECT COUNT(cardId) AS count FROM cards', (err2: Error, row: { count: number }) => {
                        if (err2) reject(err2);
                        resolve({cards: cards, count: row.count});
                    });
                }).finalize();
        });
    }

    cardSearch(card: Card, query: Pagination): Promise<CardResult> {
        // TODO tags not included in MATCH, not included in table
        return new Promise<CardResult>((resolve, reject) => {
            this.db.prepare(`SELECT DISTINCT c.cardId,
                                            c.title,
                                            json_group_array(DISTINCT fileId) AS files,
                                            group_concat(DISTINCT tag)        AS tags,
                                            c.website,
                                            c.username,
                                            created,
                                            modified
                            FROM cards_fts
                                     INNER JOIN cards c on cards_fts.cardId = c.cardId
                                     INNER JOIN tags t1 on c.cardId = t1.cardId
                                     INNER JOIN files f on c.cardId = f.cardId
                            WHERE cards_fts MATCH ?
                            GROUP BY c.cardId, c.title, c.website, c.username, created, modified` +
                '           ORDER BY c.' + query._sort + ' ' + query._order + ' LIMIT ? OFFSET ?')
                .all(card.title + ' ' + card.website + ' ' + card.username, query._limit, query._page, (err: Error, cards: Card[]) => {
                    if (err) reject(err);
                    this.db.prepare("SELECT COUNT(cardId) FROM cards_fts WHERE cards_fts MATCH ?")
                        .get(card.title + ' ' + card.website + ' ' + card.username, (err2: Error, row: { count: number }) => {
                            if (err2) reject(err2);
                            resolve({cards: cards, count: row.count});
                        }).finalize();
                }).finalize();
        });
    }

    cardExists(files: CardFile[]): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let prep = '?,'.repeat(files.length - 1);
            this.db.prepare('SELECT EXISTS (SELECT 1 FROM files WHERE fileId IN (' + prep.slice(0, prep.length - 1) + '))')
                .get(files.map(file => file.fileId), (err: Error, row: number) => {
                    if (err) reject(err);
                    if (row === 1) resolve(true);
                    else resolve(false);
                }).finalize();
        });
    }

    cardCreate(card: Card): Promise<number> {
        return new Promise((resolve, reject) => {
            this.db.prepare('INSERT INTO cards(title,website,username) VALUES(?,?,?)')
                .run(card.title, card.website, card.username)
                .finalize()
                .get('SELECT last_insert_rowid() AS id', (err: Error, row: { 'id': number }) => {
                    if (err) reject(err);
                    this.db.prepare('INSERT INTO cards_fts VALUES(?,?,?,?)')
                        .run(row.id, card.title, card.website, card.username)
                        .finalize();
                    resolve(row.id);
                });
        });
    }

    cardUpdate(card: Card): void {
        this.db.prepare('UPDATE cards SET title = ?, website = ?, username = ? WHERE cardId = ?')
            .run(card.title, card.website, card.username)
            .finalize().prepare('UPDATE cards_fts SET title = ?, website = ?, username = ? WHERE cardId = ?')
            .run(card.title, card.website, card.username, card.cardId)
            .finalize().close();
    }

    cardDelete(cardId: number): void {
        this.db.prepare('DELETE FROM cards WHERE cardId = ?').run(cardId).finalize()
            .prepare('DELETE FROM cards_fts WHERE cardId = ?').run(cardId).finalize();
    }
}
