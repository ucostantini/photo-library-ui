import { FileModel } from '../models/fileModel';
import { CardModel } from '../models/cardModel';
import { TagModel } from "../models/tagModel";
import { AlreadyExistsError } from "../errors/alreadyExistsError";
import { Card, Pagination } from "../../types/card";

export class CardController {

    get(card: Card, query: Pagination): Promise<{ cards: Card[], count: number }> {
        return new Promise(async (resolve, _reject) => {
            const cardModel = new CardModel(card);
            const cards: Card[] = await cardModel.get(query);
            const count: number = await cardModel.getTotalCount();
            resolve({cards: cards, count: count});
        });
    }

    public create(card: Card): void {
        const cardModel = new CardModel(card);
        cardModel.exists().then((cardExists: boolean) => {
            if (!cardExists) {
                cardModel.create().then(insertedCardId => {
                    new FileModel(insertedCardId, card.files).link();
                    new TagModel(insertedCardId, card.tags).create();
                });
            } else
                throw new AlreadyExistsError("Card already exists in db");
        });
    }

    public update(card: Card): void {
        const cardModel = new CardModel(card);
        cardModel.exists().then((cardExists: boolean) => {
            if (!cardExists) {
                cardModel.update();
                new FileModel(card.cardId, card.files).update();
                new TagModel(card.cardId, card.tags).update();
            } else
                throw new AlreadyExistsError("Card already exists in db");
        });
    }

    public delete(card: Card): void {
        new CardModel(card).delete();
    }
}
