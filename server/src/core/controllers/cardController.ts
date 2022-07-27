import { FileModel } from '../models/fileModel';
import { CardModel } from '../models/cardModel';
import { TagModel } from "../models/tagModel";
import { AlreadyExistsError } from "../errors/alreadyExistsError";
import { Card, CardFile, CardResult, Pagination } from "../../types/card";
import { FileController } from "./fileController";
import { log } from "../../app";

/**
 * Controller of CRUD operations related to cards
 * Validates the data and performs request to models
 */
export class CardController {

    /**
     * Retrieved cards based on provided search condition and pagination
     * @param search get all cards if null, matching cards otherwise
     * @param pagination query pagination with page number and number of resources to be returned
     * @return promise containing the result values, or an error
     */
    get(search: Card, pagination: Pagination): Promise<CardResult> {
        // wrap result in Promise so we can await the DB request
        return new Promise(async (resolve, reject) => {
            try {
                const cardModel = new CardModel(search);
                /*
                    transform page into pagination offset for DB query
                    e.g. :
                    page = 3, limit = 25
                    --> offset = (25 * 3) - 25 = 50
                */
                pagination._page = '' + ((Number(pagination._limit) * Number(pagination._page)) - Number(pagination._limit));

                let res: CardResult;
                if (search === null) {
                    // home page request, return all cards
                    res = await cardModel.getAll(pagination);
                } else {
                    // return cards matching the conditions provided in the search card object
                    res = await cardModel.getSearch(pagination);
                }
                resolve(res);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Create new card based on provided data
     * @param card provided card information, must pass YUP schema specifications
     */
    public create(card: Card): void {
        const cardModel = new CardModel(card);
        cardModel.exists()
            .then((cardExists: boolean) => {
                if (!cardExists) {
                    // if card does not already exist, insert the card in DB then link card with its files and its tags
                    cardModel.create().then(insertedCardId => {
                        log.debug(insertedCardId, 'Link files and tags for following cardId');
                        new FileModel(insertedCardId, card.files).link();
                        new TagModel(insertedCardId, card.tags).create();
                    }).catch((error: Error) => {
                        throw error; //TODO test that
                    });
                } else {
                    throw new AlreadyExistsError('Card already exists');
                }
            }).catch((error: Error) => {
            throw error; //TODO test that
        });
    }

    /**
     * Update existing card based on provided data
     * @param card provided card data, must pass YUP schema specifications
     */
    public update(card: Card): void {
        const cardModel = new CardModel(card);
        cardModel.exists().then((cardExists: boolean) => {
            if (!cardExists) {
                // if card does not already exist, update card data, files and tags
                cardModel.update();
                new FileModel(card.cardId, card.files).update();
                new TagModel(card.cardId, card.tags).update();
            } else
                throw new AlreadyExistsError("Card already exists");
        }).catch((error: Error) => {
            throw error; //TODO test that
        });
    }

    /**
     * Delete card and its file from DB and storage based on provided card ID
     * @param cardId the ID of the card to be deleted
     */
    public delete(cardId: number): void {
        const cardModel = new CardModel({cardId: cardId});
        cardModel.delete();
        // after card deletion, delete corresponding files
        cardModel.getFilesByCardId().then((fileIds: number[]) => {
            log.debug(fileIds, 'Remove files from DB and storage for following cardId : {}', cardId);
            new FileController().delete(fileIds).catch((error: Error) => {
                throw error; //TODO test that
            });
        }).catch((error: Error) => {
            throw error; //TODO test that
        });
    }
}
