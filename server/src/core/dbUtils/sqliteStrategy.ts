import { IDBStrategy } from "./dbStrategy";
import { Card, CardFile, CardResult, Pagination } from "../../types/card";
import { Database, Statement } from "sqlite3";

export class SqliteStrategy implements IDBStrategy {
    private db: Database = new Database(process.env.DB_PATH);

    fileCreate(extension: string): Promise<CardFile> {
        return new Promise<CardFile>((resolve, reject) => {
            this.db.run('INSERT INTO files (fileName) VALUES(?)', extension)
                .run('UPDATE files SET fileId = last_insert_rowid(), fileName = last_insert_rowid() || \'.\' || ? WHERE ROWID = last_insert_rowid()', extension)
                .get('SELECT fileId, fileName FROM files WHERE ROWID = last_insert_rowid()', (err: Error, row: CardFile) => {
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
        // run garbage collector
        statement.finalize()
            .run('DELETE FROM files WHERE cardId IS NULL AND fileId IS NULL');
    }

    fileDelete(files: CardFile[]): void {
        const statement: Statement = this.db.prepare('DELETE FROM files WHERE fileId = ?');
        files.forEach((file: CardFile) => statement.run(file.fileId));
    }

    tagCreate(cardId: number, tags: string[]): void {
        const statement: Statement = this.db.prepare('INSERT OR IGNORE INTO tags VALUES(?,?)');
        tags.forEach((tag: string) => statement.run(cardId, tag.trim()))
        statement.finalize();
    }

    tagDelete(cardId: number): void {
        this.db.prepare('DELETE FROM tags WHERE cardId = ?').run(cardId).finalize();
    }

    cardGetFilesByCardId(cardId: number): Promise<CardFile[]> {
        return new Promise<CardFile[]>((resolve, reject) => {
            this.db.prepare("SELECT fileId, fileName FROM files WHERE cardId = ?")
                .all(cardId, (err: Error, files: CardFile[]) => {
                    if (err) reject(err);
                    resolve(files);
                }).finalize();
        });
    }

    cardGetAll(query: Pagination): Promise<CardResult> {
        return new Promise<CardResult>((resolve, reject) => {
            // the column "files" returns all the files grouped by each card in the form of an array of object (fileId, fileName)
            // the column "tags" will return all the tags separated by a space
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
                    // return the number of cards for pagination
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
                                            json_group_array(DISTINCT json_object('fileId',fileId, 'fileName',fileName)) AS files,
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
                    // return the number of cards for pagination
                    this.db.prepare("SELECT COUNT(cardId) FROM cards_fts WHERE cards_fts MATCH ?")
                        .get(card.title + ' ' + card.website + ' ' + card.username, (err2: Error, row: { count: number }) => {
                            if (err2) reject(err2);
                            resolve({cards: cards, count: row.count});
                        }).finalize();
                }).finalize();
        });
    }

    cardExists(cardId: number, files: CardFile[]): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let prep = '?,'.repeat(files.length - 1);
            this.db.prepare('SELECT EXISTS (SELECT 1 FROM files WHERE fileId IN (' + prep.slice(0, prep.length - 1) + ') AND cardId IS NOT ?)')
                .get(files.map((file: CardFile) => file.fileId), cardId, (err: Error, row: number) => {
                    if (err) reject(err);
                    if (row === 1) resolve(true);
                    else resolve(false);
                }).finalize();
        });
    }

    cardCreate(card: Card): Promise<number> {
        return new Promise((resolve, reject) => {
            // insert data related to card
            this.db.prepare('INSERT INTO cards(title,website,username) VALUES(?,?,?)')
                .run(card.title, card.website, card.username)
                .finalize()
                // return ID of the inserted card
                .get('SELECT last_insert_rowid() AS id', (err: Error, row: { 'id': number }) => {
                    if (err) reject(err);
                    // populate full text search table
                    this.db.prepare('INSERT INTO cards_fts VALUES(?,?,?,?)')
                        .run(row.id, card.title, card.website, card.username)
                        .finalize();
                    resolve(row.id);
                });
        });
    }

    cardUpdate(card: Card): void {
        // update main table
        this.db.run('UPDATE cards SET title = ?, website = ?, username = ? WHERE cardId = ?',
            [card.title, card.website, card.username, card.cardId])
            // update full text search table
            .run('UPDATE cards_fts SET title = ?, website = ?, username = ? WHERE cardId = ?',
                [card.title, card.website, card.username, card.cardId]);
    }

    cardDelete(cardId: number): void {
        // delete from main table
        this.db.run('DELETE FROM cards WHERE cardId = ?', cardId)
            // delete from full text search table
            .run('DELETE FROM cards_fts WHERE cardId = ?', cardId);
    }
}
