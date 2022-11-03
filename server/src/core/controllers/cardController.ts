import { FileModel } from '../models/fileModel';
import { CardModel } from '../models/cardModel';
import { TagModel } from "../models/tagModel";
import { Card, CardResult, Pagination } from "../../types/card";
import { Logger } from "pino";

/**
 * Controller of CRUD operations related to cards
 * Validates the data and performs request to models
 */
export class CardController {

    private log: Logger;

    constructor(log: Logger) {
        this.log = log;
    }

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
                if (pagination._page !== 0)
                    pagination._page = pagination._limit * pagination._page;

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
    public create(card: Card): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const cardModel = new CardModel(card);
            cardModel.create()
                .then(insertedCardId => {
                    this.log.debug(insertedCardId, 'Link files and tags for following cardId');
                    new FileModel(insertedCardId, card.files).link();
                    new TagModel(insertedCardId, card.tags).create();
                    resolve('Card successfully created');
                })
                .catch((error: Error) => {
                    reject(error);
                });
        });

    }

    /**
     * Update existing card based on provided data
     * @param card provided card data, must pass YUP schema specifications
     */
    public update(card: Card): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const cardModel = new CardModel(card);
            // TODO use hash to compare images
            cardModel.exists().then(() => {
                // if card does not already exist, update card data, files and tags
                cardModel.update();
                new TagModel(card.cardId, card.tags).update();
                resolve('Card successfully updated');
            }).catch((error: Error) => {
                reject(error);
            });
        });
    }

    /**
     * Delete card and its file from DB and storage based on provided card ID
     * @param cardId the ID of the card to be deleted
     */
    public delete(cardId: number): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const cardModel = new CardModel({cardId: cardId});
            cardModel.delete();
            // delete linked tags
            new TagModel(cardId, []).delete();
            resolve('Card successfully deleted');
        });
    }
}
