import { app } from "../../app";
import { CardFile } from "../../types/card";
import { SqliteStrategy } from "../dbUtils/sqliteStrategy";

export class FileModel {

    private db: SqliteStrategy = app.get('db');

    constructor(private cardId: number, private files: CardFile[]) {
    }

    public create(extension: string): Promise<CardFile> {
        return this.db.fileCreate(extension);
    }

    public getFileName(): Promise<string> {
        return this.db.getFileNameById(this.files[0].fileId);
    }

    public link(): void {
        this.db.fileLink(this.cardId, this.files);
    }

    public update(): void {
        this.delete();
        this.link();
    }

    public delete(): void {
        this.db.fileDelete(this.files);
    }
}
