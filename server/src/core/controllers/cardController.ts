import { FileModel } from '../models/fileModel';
import { getDB } from '../../app';
import { CardModel } from '../models/cardModel';
import { TagModel } from "../models/tagModel";
import { AlreadyExistsError } from "../errors/alreadyExistsError";

export class CardController {

    constructor() {
    }

    public create(card: CardModel): void {
        const db = getDB();
        card.exists(db).then((cardExists: boolean) => {
            if (cardExists) {
                card.insert(db).then(insertedCardId => {
                    new FileModel(db, insertedCardId, card.files).link();
                    new TagModel(db, insertedCardId, card.tags).insert();
                });
                db.close();
            } else
                throw new AlreadyExistsError("Card already exists in db");
        });
    }

    public update(card: CardModel): void {
        const db = getDB();
        card.exists(db).then((cardExists: boolean) => {
            if (cardExists) {
                card.update(db);
                new FileModel(db, card.cardId, card.files).update();
                new TagModel(db, card.cardId, card.tags).update();
            } else
                throw new AlreadyExistsError("Card already exists in db");
        });
    }

    public delete(card: CardModel) {
        const db = getDB();
        card.delete(db);
    }
}
