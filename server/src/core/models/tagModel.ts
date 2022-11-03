import { app } from "../../app";
import { SqliteStrategy } from "../dbUtils/sqliteStrategy";

export class TagModel {

    private db: SqliteStrategy = app.get('db');

    constructor(private cardId: number, private tags: string[]) {
    }

    public create(): void {
        this.db.tagCreate(this.cardId, this.tags);
    }

    public update(): void {
        this.db.tagDelete(this.cardId);
        this.create();
    }

    public delete(): void {
        this.db.tagDelete(this.cardId);
    }
}
