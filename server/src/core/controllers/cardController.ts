import { FileModel } from '../models/fileModel';
import { CardModel } from '../models/cardModel';
import { TagModel } from "../models/tagModel";
import { AlreadyExistsError } from "../errors/alreadyExistsError";
import { Card, Pagination } from "../../types/card";
import { FileController } from "./fileController";
import { log } from "../../app";

export class CardController {

    get(card: Card, query: Pagination): Promise<{ cards: Card[], count: number }> {
        return new Promise(async (resolve, reject) => {
            try {
                const cardModel = new CardModel(card);
                const cards: Card[] = await cardModel.get(query);
                const count: number = await cardModel.getTotalCount();
                resolve({cards: cards, count: count});
            } catch (error) {
                reject(error);
            }
        });
    }

    public create(card: Card): void {
        const cardModel = new CardModel(card);
        cardModel.exists().then((cardExists: boolean) => {
            if (!cardExists) {
                cardModel.create().then(insertedCardId => {
                    log.debug(insertedCardId, 'Link files and tags for following cardId');
                    new FileModel(insertedCardId, card.files).link();
                    new TagModel(insertedCardId, card.tags).create();
                }).catch(error => {
                    throw new Error(error)
                });
            } else
                throw new AlreadyExistsError("Card already exists");
        }).catch(error => {
            throw new Error(error)
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
                throw new AlreadyExistsError("Card already exists");
        }).catch(error => {
            throw new Error(error)
        });
    }

    public delete(cardId: number): void {
        const cardModel = new CardModel({cardId: cardId});
        cardModel.delete();
        cardModel.getById().then((fileIds: number[]) => {
            log.debug(fileIds, 'Delete files from DB and storage for following cardId : {}', cardId);
            const fileController = new FileController();
            fileController.delete(fileIds).catch(err => {
                throw new Error(err);
            });
        }).catch(err => {
            throw new Error(err);
        });
    }
}
