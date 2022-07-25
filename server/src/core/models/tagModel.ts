import { db } from "../../app";

export class TagModel {

    constructor(private cardId: number, private tags: string) {
    }

    public create(): void {
        return db.tagCreate(this.cardId, this.tags.toLowerCase().split(','));
    }

    public update(): void {
        db.tagUpdate(this.cardId);
        this.create();
    }
}
