import { RunResult } from "sqlite3";
import { db } from "../../app";

export class FileModel {

    constructor(private cardId: number, private fileIds: number[]) {
    }

    public async get(): Promise<number[]> {
        return new Promise<number[]>((resolve, reject) => {
            db.prepare('SELECT fileId FROM files WHERE cardId = ?').all(this.cardId, (_res: RunResult, err: Error, rows: number[]) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
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
        const stmt = db.prepare('UPDATE files SET cardId = ? WHERE fileId = ?');
        this.fileIds.forEach((fileId: number) => {
            stmt.run(this.cardId, fileId);
        });
        stmt.finalize();
    }

    public update(): void {
        this.delete();
        this.insert().then();
    }

    public delete(): void {
        db.prepare('DELETE FROM files WHERE cardId = ?').run(this.cardId).finalize();
    }
}
