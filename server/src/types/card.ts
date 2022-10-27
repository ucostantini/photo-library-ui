import { SqliteStrategy } from "../core/dbUtils/sqliteStrategy";
import { MinIOStorageService } from '../core/minIOStorageService';

// fileName is needed to retrieve files from Minio
export interface CardFile {
    fileId: number;
    fileName?: string;
}
// TODO add Card Form to remove nullable fields
export interface Card {
    cardId?: number;
    title?: string;
    files?: CardFile[];
    tags?: string;
    website?: string;
    username?: string;
    created?: Date;
    modified?: Date;
}

// TODO generify sorting options
export interface Pagination {
    _page: number;
    _limit: number;
    _sort: 'created' | 'title' | 'rank';
    _order: 'asc' | 'desc';
}

export interface CardResult {
    cards: Card[];
    count: number;
}

const DBClient = {
    sqlite: SqliteStrategy,
}

const StorageService = {
    minio: MinIOStorageService
}

export { DBClient, StorageService }
