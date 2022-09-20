import { db } from "../../app";
import { CardFile } from "../../types/card";

export class FileModel {

    constructor(private cardId: number, private files: CardFile[]) {
    }

    public create(extension: string): Promise<CardFile> {
        return db.fileCreate(extension);
    }

    public getFileName(): Promise<string> {
        return db.getFileNameById(this.files[0].fileId);
    }

    public link(): void {
        db.fileLink(this.cardId, this.files);
    }

    public update(): void {
        this.delete();
        this.link();
    }

    public delete(): void {
        db.fileDelete(this.files);
    }
}
