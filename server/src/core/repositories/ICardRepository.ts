import { IRepository } from "./IRepository";
import { CardForm, CardResult } from "../../types/card";

export interface ICardRepository extends IRepository<CardForm, CardResult> {
}
