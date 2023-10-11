import { CardRequest, CardResult, OperationResponse, Pagination } from "../../types/card";
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
     * Retrieve cards based on provided search condition and pagination
     * @param search get all cards if null, matching cards otherwise
     * @param pagination query pagination with page number and number of resources to be returned
     * @return promise containing the result values, or an error
     */
    public async get(request: CardRequest): Promise<CardResult> {
        request.pagination = this.pageToOffset(request.pagination);
        // if form is absent, home is request, get all cards. If form is present, get matching cards.
        const result: CardResult = await (request.card === null ? this.cardRepository.readAll(request) : this.cardRepository.read(request));
        for (const card of result.cards) {
            card.files = await this.fileController.get(card.id);
        }
        return result;
    }

    /**
     * Create new card based on provided data
     * @param card provided card information, must pass YUP schema specifications
     */
    public async create(card: CardRequest): Promise<OperationResponse> {
        this.cardRepository.create(card);
        this.tagRepository.create(card);
        return { message: 'Card successfully created' };
    }

    /**
     * Update existing card based on provided data
     * @param card provided card data, must pass YUP schema specifications
     */
    public async update(card: CardRequest): Promise<OperationResponse> {
        this.cardRepository.update(card);
        this.tagRepository.update(card);
        return { message: 'Card successfully updated' };
    }


    /**
     * Delete card and its file from DB and storage based on provided card ID
     * @param cardId the ID of the card to be deleted
     */
    public async delete(cardId: number): Promise<OperationResponse> {
        const form: CardRequest = {card: {id: cardId}, pagination: null};
        this.cardRepository.delete(form);
        this.tagRepository.delete(form);
        await this.fileController.deleteFromCardId(cardId);
        return { message: 'Card successfully deleted' };
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
