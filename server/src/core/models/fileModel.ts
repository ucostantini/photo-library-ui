import { RunResult, Statement } from "sqlite3";
import { db } from "../../app";

export class FileModel {

    constructor(private cardId: number, private fileIds: number[]) {
    }

    public async get(): Promise<{ fileId: number }[]> {
        return new Promise<{ fileId: number }[]>((resolve, _reject) => {
            db.prepare('SELECT fileId FROM files WHERE cardId = ?')
                .all(this.cardId, (_res: RunResult, rows: { 'fileId': number }[]) =>
                    resolve(rows)
                );
        });
    }

    public create(): Promise<number> {
        return new Promise<number>((resolve, _reject) => {
            db.prepare('INSERT INTO files (cardId) VALUES(?)')
                .run(this.cardId)
                .finalize()
                .get('SELECT last_insert_rowid() AS id',
                    (_res: RunResult, row: { 'id': number }) => resolve(row.id)
                );
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
        db.prepare('DELETE FROM files WHERE fileId = ?').run(this.fileIds[0]).finalize();
    }
}
