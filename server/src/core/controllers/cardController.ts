import { FileModel } from '../models/fileModel';
import { CardModel } from '../models/cardModel';
import { TagModel } from "../models/tagModel";
import { AlreadyExistsError } from "../errors/alreadyExistsError";
import { Card, Pagination } from "../../types/card";

export class CardController {

    constructor() {
    }

    public create(card: Card): void {
        new CardModel(card).exists().then((cardExists: boolean) => {
            if (!cardExists) {
                new CardModel(card).insert().then(insertedCardId => {
                    new FileModel(insertedCardId, card.files).link();
                    new TagModel(insertedCardId, card.tags).insert();
                });
            } else
                throw new AlreadyExistsError("Card already exists in db");
        });
    }

    public update(card: Card): void {
        new CardModel(card).exists().then((cardExists: boolean) => {
            if (!cardExists) {
                new CardModel(card).update();
                new FileModel(card.cardId, card.files).update();
                new TagModel(card.cardId, card.tags).update();
            } else
                throw new AlreadyExistsError("Card already exists in db");
        });
    }

    public delete(card: Card): void {
        new CardModel(card).delete();
    }

    get(card: Card, query: Pagination): Promise<Card[]> {
        return new CardModel(card).get(query);
    }
}
