import { Card } from '../types/card';
import { getDB } from '../app';
import { Statement } from 'sqlite3';

export class CardController {


    constructor() {
    }


    public create(card: Card): void {
        const db = getDB();
        db.serialize(() => {
            // TODO check card not in db --> unique title ? unique fileId ? how to unique upload file ? to be continued
            // TODO put those nasty statements in models
            let insert: Statement = db.prepare('INSERT INTO cards VALUES(?,?,?,?)');
            insert.run(card.title.trim(), card.source.website.trim(), card.source.username.trim());
            insert.finalize();
            const insertedCardId = db.run('SELECT last_insert_rowid()');

            insert = db.prepare('INSERT INTO files VALUES(?,?)');
            card.files.forEach((fileId: number) => insert.run(insertedCardId, fileId));
            insert.finalize();

            insert = db.prepare('INSERT INTO tags VALUES(?,?)');
            const tags = card.tags.toLowerCase().split(',');
            tags.forEach((tag: string) => insert.run(insertedCardId, tag.trim()));
            insert.finalize();

            insert = db.prepare('INSERT INTO fts VALUES(?,?,?,?)');
            insert.run(insertedCardId, card.title.trim(), card.source.website.trim(), card.source.username.trim());
            insert.finalize();
        });

        db.close();
    }


}
