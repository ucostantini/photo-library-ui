import { IRepository } from "./IRepository";
import { CardRequest } from "../../types/card";

export interface IFTSRepository extends IRepository<CardRequest, Promise<number[]>> {

}
