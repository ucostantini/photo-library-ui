import { db } from "../../app";

export class TagModel {

    constructor(private cardId: number, private tags: string) {
    }

    public create(): void {
        db.tagCreate(this.cardId, this.tags.toLowerCase().split(','));
    }

    public update(): void {
        db.tagDelete(this.cardId);
        this.create();
    }

    public delete(): void {
        db.tagDelete(this.cardId);
    }
}
