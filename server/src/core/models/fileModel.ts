import { db } from "../../app";
import { CardFile } from "../../types/card";

export class FileModel {

    constructor(private cardId: number, private fileIds: number[]) {
    }

    public create(): Promise<number> {
        return db.fileCreate(this.cardId);
    }

    public link(): void {
        db.fileLink(this.cardId, this.fileIds);
    }

    public update(): void {
        this.delete();
        this.create();
    }

    public delete(): void {
        db.fileDelete(this.fileIds);
    }
}
