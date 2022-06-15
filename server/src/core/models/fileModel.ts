import { RunResult } from "sqlite3";
import { db } from "../../app";

export class FileModel {

    constructor(private cardId: number, private fileIds: number[]) {
    }

    public async get(): Promise<number[]> {
        return new Promise<number[]>((resolve, reject) => {
            db.prepare('SELECT fileId FROM files WHERE cardId = ?').all(this.cardId, (_res: RunResult, rows: { 'fileId': number }[]) =>
                resolve(rows.map(object => object.fileId))
            );
        });
    }

    public insert(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            db.prepare('INSERT INTO files (cardId) VALUES(?)')
                .run(this.cardId)
                .finalize().get('SELECT last_insert_rowid() AS id', (_res: RunResult, row: { 'id': number }) => resolve(row.id)
            );
        });
    }

    public link(): void {
        let stmt = db.prepare('INSERT INTO files VALUES(?,?)');
        this.fileIds.forEach((fileId: number) => {
            stmt.run(this.cardId, fileId);
        });
        stmt.finalize();
        db.run('DELETE FROM files WHERE cardId IS NULL AND fileId IS NULL');
    }

    public update(): void {
        this.delete();
        this.insert().then();
    }

    public delete(): void {
        db.prepare('DELETE FROM files WHERE fileId = ?').run(this.fileIds[0]).finalize();
    }
}
