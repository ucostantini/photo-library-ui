import { Statement } from "sqlite3";
import { db } from "../../app";

export class FileModel {

    constructor(private cardId: number, private fileIds: number[]) {
    }

    public async get(): Promise<{ fileId: number }[]> {
        return new Promise<{ fileId: number }[]>((resolve, reject) => {
            db.prepare('SELECT fileId FROM files WHERE cardId = ?')
                .all(this.cardId, (err: Error, rows: { 'fileId': number }[]) => {
                    if (err) reject(err)
                    else resolve(rows)
                });
        });
    }

    public create(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            db.prepare('INSERT INTO files (cardId) VALUES(?)')
                .run(this.cardId)
                .finalize()
                .get('SELECT last_insert_rowid() AS id', (err: Error, row: { 'id': number }) => {
                    if (err) reject(err)
                    else resolve(row.id)
                });
        });
    }

    public link(): void {
        let statement: Statement = db.prepare('INSERT INTO files VALUES(?,?)');
        this.fileIds.forEach((fileId: number) => {
            statement.run(this.cardId, fileId);
        });
        statement.finalize()
            .run('DELETE FROM files WHERE cardId IS NULL AND fileId IS NULL');
    }

    public update(): void {
        this.delete();
        this.create();
    }

    public delete(): void {
        console.log(this.fileIds);
        const statement: Statement = db.prepare('DELETE FROM files WHERE fileId = ?')
        this.fileIds.forEach((fileId: number) => statement.run(fileId));
    }
}
