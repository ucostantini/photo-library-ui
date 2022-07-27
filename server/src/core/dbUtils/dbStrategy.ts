import { Card, CardFile, Pagination } from "../../types/card";

/**
 * Strategy interface for DB requests related to both cards and files
 */
export interface IDBStrategy {
    fileCreate(cardId: number): Promise<number>;

    fileLink(cardId: number, files: number[]): void;

    fileDelete(files: number[]);

    tagCreate(cardId: number, tags: string[]): void;

    tagUpdate(cardId: number): void;

    cardGetFilesById(cardId: number): Promise<number[]>;

    cardGetAll(query: Pagination): Promise<{ cards: Card[], count: number }>;

    cardSearch(card: Card, query: Pagination): Promise<{ cards: Card[], count: number }>;

    cardExists(files: number[]): Promise<boolean>;

    cardCreate(card: Card): Promise<number>;

    cardUpdate(card: Card): void;

    cardDelete(cardId: number): void;
}
