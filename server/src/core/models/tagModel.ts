import { Statement } from "sqlite3";
import { db } from "../../app";

export class TagModel {

    constructor(private cardId: number, private tags: string) {
    }

    public insert(): void {
        const insert: Statement = db.prepare('INSERT INTO tags VALUES(?,?)');
        this.tags.toLowerCase().split(',')
            .forEach((tag: string) => insert.run(this.cardId, tag.trim()))
        insert.finalize();
    }

    public update(): void {
        db.prepare('DELETE FROM tags WHERE cardId = ?').run(this.cardId).finalize();
        this.insert();
    }

}
