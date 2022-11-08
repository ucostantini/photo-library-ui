import { CardFile, FileResult } from "../../../types/card";
import { IFileRepository } from "../IFileRepository";
import Database, { SqliteError } from "better-sqlite3";

export class SqliteFileRepository implements IFileRepository {
    private db = new Database(process.env.DB_PATH);

    create(entity: CardFile): FileResult {
        this.db.prepare('INSERT INTO files (fileHash) VALUES(?)').run(entity.fileName);
        const res: CardFile[] = this.db.prepare('UPDATE files SET fileId = last_insert_rowid(), fileName = last_insert_rowid() || \'.jpg\' WHERE ROWID = last_insert_rowid() RETURNING fileId, fileName').all();

        return {files: res};
    }

    delete(entity: CardFile): void {
        this.db.prepare('DELETE FROM files WHERE fileId = ?').run(entity.fileId);
    }

    read(entity: CardFile): FileResult {
        return {
            files: this.db.prepare('SELECT fileName,fileId FROM files WHERE fileId = ?')
                .all(entity.fileId) as CardFile[]
        };
    }

    readAll(entity: CardFile): FileResult {
        return {files: this.db.prepare('SELECT fileName,fileId FROM files').all() as CardFile[]};
    }

    update(entity: CardFile): void {
        throw new SqliteError('Not Implemented', '501');
    }
}
