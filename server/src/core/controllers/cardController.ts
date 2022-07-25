import { FileModel } from '../models/fileModel';
import { CardModel } from '../models/cardModel';
import { TagModel } from "../models/tagModel";
import { AlreadyExistsError } from "../errors/alreadyExistsError";
import { Card, CardFile, CardResult, Pagination } from "../../types/card";
import { FileController } from "./fileController";
import { log } from "../../app";

export class CardController {

    get(card: Card, query: Pagination): Promise<CardResult> {
        return new Promise(async (resolve, reject) => {
            try {
                const cardModel = new CardModel(card);
                // transform page into pagination offset for query
                query._page = '' + ((Number(query._limit) * Number(query._page)) - Number(query._limit));
                let res;
                if (Object.keys(card).length === 0) {
                    res = await cardModel.getAll(query);
                } else {
                    res = await cardModel.getSearch(query);
                }
                resolve(res);
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
        cardModel.getFilesByCardId().then((files: CardFile[]) => {
            log.debug(files, 'Delete files from DB and storage for following cardId : {}', cardId);
            const fileController = new FileController();
            fileController.delete(files).catch(err => {
                throw new Error(err);
            });
        }).catch(err => {
            throw new Error(err);
        });
    }
}
