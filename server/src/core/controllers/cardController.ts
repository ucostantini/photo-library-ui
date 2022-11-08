import { CardForm, CardResult, Pagination } from "../../types/card";
import { Logger } from "pino";
import { ICardRepository } from "../repositories/ICardRepository";
import { ITagRepository } from "../repositories/ITagRepository";

/**
 * Controller of CRUD operations related to cards
 * Validates the data and performs request to models
 */
export class CardController {

    constructor(private log: Logger,
                private cardRepository: ICardRepository,
                private tagRepository: ITagRepository) {
    }

    /**
     * Retrieved cards based on provided search condition and pagination
     * @param search get all cards if null, matching cards otherwise
     * @param pagination query pagination with page number and number of resources to be returned
     * @return promise containing the result values, or an error
     */
    get(card: CardForm): Promise<CardResult> {
        return new Promise(async (resolve, reject) => {
            try {
                card.pagination = this.pageToOffset(card.pagination);
                let res: CardResult;
                if (card.card === null) {
                    // home page request, return all cards
                    res = this.cardRepository.readAll(card);
                } else {
                    // return cards matching the values provided in the card object
                    res = this.cardRepository.read(card);
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
    public create(card: CardForm): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                this.cardRepository.create(card);
                this.tagRepository.create(card);
                resolve('Card successfully created');
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Update existing card based on provided data
     * @param card provided card data, must pass YUP schema specifications
     */
    public update(card: CardForm): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                this.cardRepository.update(card);
                this.tagRepository.update(card);
                resolve('Card successfully updated');
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Delete card and its file from DB and storage based on provided card ID
     * @param cardId the ID of the card to be deleted
     */
    public delete(cardId: number): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const form: CardForm = {card: {cardId: cardId}, pagination: null};
                this.cardRepository.delete(form);
                this.tagRepository.delete(form);
                resolve('Card successfully deleted');
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * transform page to offset for DB query
     * N.B. : offset means that the x first rows will be skipped
     * @example page = 3, limit = 25 --> offset = (3 * 25) = 75
     * @param pagination
     * @private
     */
    private pageToOffset(pagination: Pagination): Pagination {
        if (pagination._page !== 0)
            pagination._page = pagination._limit * pagination._page;
        return pagination;
    }
}
