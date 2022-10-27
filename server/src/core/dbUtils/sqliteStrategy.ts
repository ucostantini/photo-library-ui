import { IDBStrategy } from "./dbStrategy";
import { Card, CardFile, CardResult, Pagination } from "../../types/card";
import { Database, Statement, verbose } from "sqlite3";
import { log } from "../../app";

export class SqliteStrategy implements IDBStrategy {
    private db: Database = new Database(process.env.DB_PATH);

    constructor() {
        if (process.env.LOG_LEVEL === 'debug') {
            verbose();
            this.db.on('trace', (stmt: string) => log.debug(stmt));
        }
    }

    fileCreate(extension: string): Promise<CardFile> {
        return new Promise<CardFile>((resolve, reject) => {
            this.db.run('INSERT INTO files (fileName) VALUES(?)', extension)
                .get('UPDATE files SET fileId = last_insert_rowid(), fileName = last_insert_rowid() || \'.\' || ? WHERE ROWID = last_insert_rowid() RETURNING fileId, fileName', extension, (err: Error, row: CardFile) => {
                    if (err) reject(err)
                    else resolve(row)
                });
        });
    }

    getFileNameById(fileId: number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.db.prepare('SELECT fileName WHERE fileId = ?')
                .get(fileId, (err: Error, row: { fileName: string }) => {
                    if (err) reject(err)
                    else resolve(row.fileName)
                });
        });
    }

    fileLink(cardId: number, files: CardFile[]): void {
        let statement: Statement = this.db.prepare('UPDATE files SET cardId = ? WHERE fileId = ?');
        files.forEach((file: CardFile) => {
            statement.run(cardId, file.fileId);
        });
    }

    fileDelete(files: CardFile[]): void {
        const statement: Statement = this.db.prepare('DELETE FROM files WHERE fileId = ?');
        files.forEach((file: CardFile) => statement.run(file.fileId));
    }

    tagCreate(cardId: number, tags: string[]): void {
        const statement: Statement = this.db.prepare('INSERT OR IGNORE INTO tags VALUES(?,?)');
        tags.forEach((tag: string) => statement.run(cardId, tag.trim()))
        statement.reset();
    }

    tagDelete(cardId: number): void {
        this.db.prepare('DELETE FROM tags WHERE cardId = ?').run(cardId).reset();
    }

    cardGetFilesByCardId(cardId: number): Promise<CardFile[]> {
        return new Promise<CardFile[]>((resolve, reject) => {
            this.db.prepare("SELECT fileId, fileName FROM files WHERE cardId = ?")
                .all(cardId, (err: Error, files: CardFile[]) => {
                    if (err) reject(err);
                    else resolve(files);
                }).reset();
        });
    }

    cardGetAll(query: Pagination): Promise<CardResult> {
        return new Promise<CardResult>((resolve, reject) => {
            this.db.prepare('SELECT * FROM cards_view ORDER BY ' + query._sort + ' ' + query._order + ' LIMIT ? OFFSET ?')
                .all([query._limit, query._page], (err: Error, cards: Card[]) => {
                    if (err) reject(err);
                    // return the number of cards for pagination
                    else this.db.get('SELECT COUNT(cardId) AS count FROM cards', (err2: Error, row: { count: number }) => {
                        if (err2) reject(err2);
                        else resolve({cards: cards, count: row.count});
                    });
                }).reset();
        });
    }

    cardSearch(card: Card, query: Pagination): Promise<CardResult> {
        // prepare tags for full-text search
        card.tags = card.tags.split(',').join(' ');

        /*
        * match_fts will look like this,
        * for each non-empty entry in the provided card query :
        * (title: "1975 Ford Thunderbird 2D") AND (tags: "car antique v8 70s")
        */
        let match_fts = '';
        for (const [key, value] of Object.entries(card)) {
            if (typeof value === 'string' && value !== '') {
                match_fts += ' AND (' + key + ' : ' + value + ')';
            }
        }
        match_fts = match_fts.slice(5);

        return new Promise<CardResult>((resolve, reject) => {
            this.db.prepare('SELECT DISTINCT * FROM cards_view INNER JOIN cards_fts ON cards_fts.cardId = cards_view.cardId WHERE cards_fts MATCH ?' +
                '           ORDER BY cards_view.' + query._sort + ' ' + query._order + ' LIMIT ? OFFSET ?')
                //TODO handle spelling mistakes
                .all(match_fts, query._limit, query._page, (err: Error, cards: Card[]) => {
                    if (err) reject(err);
                    // return the count of cards for pagination
                    else this.db.prepare('SELECT DISTINCT COUNT(cardId) AS count FROM cards_fts WHERE cards_fts MATCH ?')
                        .get(match_fts, (err2: Error, row: { count: number }) => {
                            if (err2) reject(err2);
                            else resolve({cards: cards, count: row.count});
                        }).reset();
                }).reset();
        });
    }

    cardExists(files: CardFile[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let prep = '?,'.repeat(files.length);
            this.db.prepare('SELECT EXISTS (SELECT 1 FROM files WHERE fileId IN (' + prep.slice(0, prep.length - 1) + ')) AS res')
                .get(...files.map((file: CardFile) => file.fileId), (err: Error, row: { res: number }) => {
                    if (err) reject(err);
                    else if (row.res === 1) reject(new Error('Card already exists'));
                    else resolve();
                }).reset();
        });
    }

    cardCreate(card: Card): Promise<number> {
        return new Promise((resolve, reject) => {
            // insert data related to card
            this.db.prepare('INSERT INTO cards(title,website,username) VALUES(?,?,?) RETURNING ROWID')
                .get(card.title, card.website, card.username, (err: Error, row: { 'cardId': number }) => {
                    if (err) reject(err);
                    // populate full text search table
                    else {
                        this.db.prepare('INSERT INTO cards_fts VALUES(?,?,?,?,?)')
                            .run(row.cardId, card.title, card.website, card.username, card.tags)
                            .reset();
                        resolve(row.cardId);
                    }
                });
        });
    }

    cardUpdate(card: Card): void {
        // update main table
        this.db.run('UPDATE cards SET title = ?, website = ?, username = ? WHERE cardId = ?',
            [card.title, card.website, card.username, card.cardId])
            // update full text search table
            .run('UPDATE cards_fts SET title = ?, website = ?, username = ?, tags = ? WHERE cardId = ?',
                [card.title, card.website, card.username, card.cardId, card.tags]);
    }

    cardDelete(cardId: number): void {
        // delete from main table
        this.db.run('DELETE FROM cards WHERE cardId = ?', cardId)
            // delete from full text search table
            .run('DELETE FROM cards_fts WHERE cardId = ?', cardId);
    }
}
