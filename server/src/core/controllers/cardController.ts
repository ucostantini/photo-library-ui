import { CardForm, CardResult, Pagination } from "../../types/card";
import { ICardRepository } from "../repositories/ICardRepository";
import { ITagRepository } from "../repositories/ITagRepository";
import { FileController } from "./fileController";

/**
 * Controller of CRUD operations related to cards
 * Validates the data and performs request to models
 */
export class CardController {

    constructor(private cardRepository: ICardRepository,
                private tagRepository: ITagRepository,
                private fileController: FileController) {
    }

    /**
     * Retrieved cards based on provided search condition and pagination
     * @param search get all cards if null, matching cards otherwise
     * @param pagination query pagination with page number and number of resources to be returned
     * @return promise containing the result values, or an error
     */
    public async get(card: CardForm): Promise<CardResult> {
        card.pagination = this.pageToOffset(card.pagination);
        // if form is absent, home is request, get all cards. If form is present, get matching cards.
        const cards: CardResult = (card.card === null ? this.cardRepository.readAll(card) : this.cardRepository.read(card));
        for (const card of cards.cards) {
            card.files = await this.fileController.get(card.cardId);
        }
        return cards;
    }

    /**
     * Create new card based on provided data
     * @param card provided card information, must pass YUP schema specifications
     */
    public async create(card: CardForm): Promise<string> {
        this.cardRepository.create(card);
        this.tagRepository.create(card);
        return 'Card successfully created';
    }

    /**
     * Update existing card based on provided data
     * @param card provided card data, must pass YUP schema specifications
     */
    public async update(card: CardForm): Promise<string> {
        this.cardRepository.update(card);
        this.tagRepository.update(card);
        return 'Card successfully updated';
    }


    /**
     * Delete card and its file from DB and storage based on provided card ID
     * @param cardId the ID of the card to be deleted
     */
    public async delete(cardId: number): Promise<string> {
        const form: CardForm = {card: {cardId: cardId}, pagination: null};
        this.cardRepository.delete(form);
        this.tagRepository.delete(form);
        await this.fileController.deleteFromCardId(cardId);
        return 'Card successfully deleted';
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
