import { IRepository } from "./IRepository";
import { CardRequest, CardResult } from "../../types/card";
import { IFTSRepository } from "./IFTSRepository";

export interface ICardRepository extends IRepository<CardRequest, Promise<CardResult>> {
    fts: IFTSRepository;

    setFTSRepository(repository: IFTSRepository): void;
}
