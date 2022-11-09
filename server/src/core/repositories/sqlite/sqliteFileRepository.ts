import { CardFile, FileResult } from "../../../types/card";
import { IFileRepository } from "../IFileRepository";
import Database, { RunResult, SqliteError } from "better-sqlite3";

export class SqliteFileRepository implements IFileRepository {
    private db = new Database(process.env.DB_PATH);

    create(entity: CardFile): FileResult {
        const generatedId: RunResult = this.db.prepare('INSERT INTO files (fileHash) VALUES(?)').run(entity.fileHash);
        const res: number[] = this.db.prepare('UPDATE files SET fileId = :id WHERE ROWID = :id RETURNING fileId').pluck(true).all({id: generatedId.lastInsertRowid});

        return {files: res};
    }

    delete(entity: CardFile): void {
        this.db.prepare('DELETE FROM files WHERE fileId = ?').run(entity.fileId);
    }

    read(entity: CardFile): FileResult {
        return {
            files: this.db.prepare('SELECT fileId FROM files WHERE fileId = ?').pluck(true)
                .all(entity.fileId) as number[]
        };
    }

    readAll(entity: CardFile): FileResult {
        return {files: this.db.prepare('SELECT fileId FROM files').pluck(true).all() as number[]};
    }

    update(entity: CardFile): void {
        throw new SqliteError('Not Implemented', '501');
    }
}
