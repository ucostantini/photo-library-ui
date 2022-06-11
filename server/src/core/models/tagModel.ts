import { Database, Statement } from "sqlite3";

export class TagModel {

    constructor(private db: Database, private cardId: number, private tags: string) {
    }

    public insert(): void {
        const insert: Statement = this.db.prepare('INSERT INTO tags VALUES(?,?)');
        this.tags.toLowerCase().split(',')
            .forEach((tag: string) => insert.run(this.cardId, tag.trim()))
        insert.finalize();
    }

    public update(): void {
        this.db.prepare('DELETE FROM tags WHERE cardId = ?').run(this.cardId).finalize();
        this.insert();
    }

}
