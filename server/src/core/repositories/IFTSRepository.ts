import { IRepository } from "./IRepository";
import { CardForm } from "../../types/card";

export interface IFTSRepository extends IRepository<CardForm, Promise<number[]>> {

}
