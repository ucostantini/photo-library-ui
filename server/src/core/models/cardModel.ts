import { Card, CardFile, CardResult, Pagination } from "../../types/card";
import { app } from "../../app";
import { SqliteStrategy } from "../dbUtils/sqliteStrategy";

//TODO refactor DB access logic
export class CardModel {

    private db: SqliteStrategy = app.get('db');

    constructor(private card: Card) {
    }

    public getFilesByCardId(): Promise<CardFile[]> {
        return this.db.cardGetFilesByCardId(this.card.cardId);
    }

    public getAll(query: Pagination): Promise<CardResult> {
        return this.db.cardGetAll(query);
    }

    public getSearch(query: Pagination): Promise<CardResult> {
        return this.db.cardSearch(this.card, query);
    }

    public exists(): Promise<void> {
        return this.db.cardExists(this.card.files);
    }

    public create(): Promise<number> {
        return this.db.cardCreate(this.card);
    }

    public update(): void {
        this.db.cardUpdate(this.card);
    }

    public delete(): void {
        this.db.cardDelete(this.card.cardId);
    }
}
