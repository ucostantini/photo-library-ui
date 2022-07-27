import { db } from "../../app";
import { CardFile } from "../../types/card";

export class FileModel {

    constructor(private cardId: number, private files: CardFile[]) {
    }

    public create(): Promise<number> {
        return db.fileCreate(this.cardId);
    }

    public link(): void {
        db.fileLink(this.cardId, this.files);
    }

    public update(): void {
        this.delete();
        this.create();
    }

    public delete(): void {
        db.fileDelete(this.files);
    }
}
