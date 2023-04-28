import { IRepository } from "./IRepository";
import { CardForm, CardResult } from "../../types/card";
import { IFTSRepository } from "./IFTSRepository";

export interface ICardRepository extends IRepository<CardForm, Promise<CardResult>> {
    fts: IFTSRepository;

    setFTSRepository(repository: IFTSRepository): void;
}
