import { Card, CardFile, CardResult, Pagination } from "../../types/card";

/**
 * Strategy interface for DB requests related to both cards and files
 */
export interface IDBStrategy {
    /**
     * Generate a new id for the inserted file for the system and insert it
     * @param extension the extension of the file
     * @return a promise of the file
     */
    fileCreate(extension: string): Promise<CardFile>;

    /**
     *
     * @param fileId
     */
    getFileNameById(fileId: number): Promise<string>;

    /**
     * Link the card id with its corresponding files' ids
     * @param cardId the card's id to link the files with
     * @param files the ids of the files to be linked with the card
     */
    fileLink(cardId: number, files: CardFile[]): void;

    /**
     * Delete the files given their ids
     * @param files ids of the files to be deleted
     */
    fileDelete(files: CardFile[]): void;

    /**
     * Link the card with its corresponding tags
     * @param cardId the card's id
     * @param tags the card's tags to be linked with
     */
    tagCreate(cardId: number, tags: string[]): void;

    /**
     * Delete the tags related to the card given its id
     * @param cardId the card's id
     */
    tagDelete(cardId: number): void;

    /**
     * Return the files' names of a corresponding card
     * @param cardId the id of the corresponding card
     */
    cardGetFilesByCardId(cardId: number): Promise<CardFile[]>;

    /**
     * Return all the cards and the number of cards
     * @param query the provided pagination
     */
    cardGetAll(query: Pagination): Promise<CardResult>;

    /**
     * Return the corresponding card given the information provided
     * @param card the search information of the card
     * @param query the pagination for the search
     */
    cardSearch(card: Card, query: Pagination): Promise<CardResult>;

    /**
     * Check if the card exist given its files' ids
     * @param cardId the id of the updated card
     * @param files the ids of the files
     */
    cardExists(cardId: number, files: CardFile[]): Promise<boolean>;

    /**
     * Create a new card based on provided information
     * @param card the card's information
     * @return the created card's id
     */
    cardCreate(card: Card): Promise<number>;

    /**
     * Update the card based on the provided information
     * @param card the card's updated information
     */
    cardUpdate(card: Card): void;

    /**
     * Delete the card based on its id
     * @param cardId the id of the card to be deleted
     */
    cardDelete(cardId: number): void;
}
