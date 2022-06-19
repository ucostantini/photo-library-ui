import { Statement } from "sqlite3";
import { db } from "../../app";

export class TagModel {

    constructor(private cardId: number, private tags: string) {
    }

    public create(): void {
        const statement: Statement = db.prepare('INSERT OR IGNORE INTO tags VALUES(?,?)');
        this.tags.toLowerCase().split(',')
            .forEach((tag: string) => statement.run(this.cardId, tag.trim()))
        statement.finalize();
    }

    public update(): void {
        db.prepare('DELETE FROM tags WHERE cardId = ?').run(this.cardId).finalize();
        this.create();
    }
}
