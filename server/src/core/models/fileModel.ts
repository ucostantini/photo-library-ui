import { Database, RunResult } from "sqlite3";

export class FileModel {

    constructor(private db: Database, private cardId: number, private fileIds: number[]) {
    }

    public async get(): Promise<number[]> {
        return new Promise<number[]>((resolve, reject) => {
            this.db.prepare('SELECT fileId FROM files WHERE cardId = ?').all(this.cardId, (_res: RunResult, err: Error, rows: number[]) => {
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
            this.db.prepare('INSERT INTO files (cardId) VALUES(?)')
                .run(this.cardId)
                .finalize().get('SELECT last_insert_rowid()', (_res: RunResult, err: Error, row: number) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row)
                }
            });
        });
    }

    public link(): void {
        const stmt = this.db.prepare('UPDATE files SET cardId = ? WHERE fileId = ?');
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
        this.db.prepare('DELETE FROM files WHERE cardId = ?').run(this.cardId).finalize();
    }
}
