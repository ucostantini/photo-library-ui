import { CardRequest, TagResult } from "../../../types/card";
import { ITagRepository } from "../ITagRepository";
import Database, { SqliteError, Statement } from "better-sqlite3";

export class SqliteTagRepository implements ITagRepository {
    private db = new Database(process.env.DB_PATH);

    create(entity: CardRequest): TagResult {
        const statement: Statement = this.db.prepare('INSERT OR IGNORE INTO tags VALUES(?,?)');
        entity.card.tags.forEach(tag => statement.run(entity.card.id, tag.trim().toLowerCase()));

        return this.readAll(entity);
    }

    delete(entity: CardRequest): void {
        this.db.prepare('DELETE FROM tags WHERE cardId = ?').run(entity.card.id);
    }

    read(entity: CardRequest): TagResult {
        throw new SqliteError('Not Implemented', '501');
    }

    readAll(entity: CardRequest): TagResult {
        return {tags: this.db.prepare('SELECT DISTINCT tag FROM tags').pluck(true).all() as string[]};
    }

    update(entity: CardRequest): void {
        this.delete(entity);
        this.create(entity);
    }
}
