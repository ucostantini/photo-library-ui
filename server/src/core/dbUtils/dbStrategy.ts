import { Card, CardFile, Pagination } from "../../types/card";

export interface IDBStrategy {
    fileCreate(cardId: number): Promise<number>;

    fileLink(cardId: number, files: CardFile[]): void;

    fileDelete(files: CardFile[]);

    tagCreate(cardId: number, tags: string[]): void;

    tagUpdate(cardId: number): void;

    cardGetFilesById(cardId: number): Promise<CardFile[]>;

    cardGetAll(query: Pagination): Promise<{ cards: Card[], count: number }>;

    cardSearch(card: Card, query: Pagination): Promise<{ cards: Card[], count: number }>;

    cardExists(files: CardFile[]): Promise<boolean>;

    cardCreate(card: Card): Promise<number>;

    cardUpdate(card: Card): void;

    cardDelete(cardId: number): void;

}
