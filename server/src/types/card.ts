import { MinIOStorageService } from '../core/minIOStorageService';
import { SqliteCardRepository } from "../core/repositories/sqlite/sqliteCardRepository";
import { SqliteFileRepository } from "../core/repositories/sqlite/sqliteFileRepository";
import { SqliteTagRepository } from "../core/repositories/sqlite/sqliteTagRepository";

// fileName is needed to retrieve files from Minio
export interface CardFile {
    fileId: number;
    fileName?: string;
}

export interface Card {
    cardId: number;
    title: string;
    files: CardFile[];
    tags: string[];
    website: string;
    username: string;
    created: Date;
    modified: Date;
}

export interface CardRequest {
    cardId?: number;
    title?: string;
    files?: CardFile[];
    tags?: string[];
    website?: string;
    username?: string;
}

export interface CardForm {
    card: CardRequest;
    pagination: Pagination;
}

export interface Pagination {
    _page: number;
    _limit: number;
    _sort: Sort;
    _order: Order;
}

export enum Sort {
    created,
    title,
    rank
}

export enum Order {
    asc,
    desc
}

export interface CardResult {
    cards: Card[];
    count: number;
}

export interface TagResult {
    tags: string[]
}

export interface FileResult {
    files: CardFile[];
}

export const DBClient = {
    sqlite: [SqliteCardRepository, SqliteFileRepository, SqliteTagRepository]
}

export const StorageService = {
    minio: MinIOStorageService
}
