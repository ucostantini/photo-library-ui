import { Card, CardFile, CardResult, Pagination } from "../../types/card";
import { db } from "../../app";

export class CardModel {

    constructor(private card: Card) {
    }

    public getFilesByCardId(): Promise<CardFile[]> {
        return db.cardGetFilesById(this.card.cardId);
    }

    public getAll(query: Pagination): Promise<CardResult> {
        return db.cardGetAll(query);
    }

    public getSearch(query: Pagination): Promise<CardResult> {
        return db.cardSearch(this.card, query);
    }

    public exists(): Promise<boolean> {
        return db.cardExists(this.card.files);
    }

    public create(): Promise<number> {
        return db.cardCreate(this.card);
    }

    public update(): void {
        db.cardUpdate(this.card);
    }

    public delete(): void {
        db.cardDelete(this.card.cardId);
    }
}
