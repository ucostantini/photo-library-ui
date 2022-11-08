import { IRepository } from "./IRepository";
import { CardForm, TagResult } from "../../types/card";

export interface ITagRepository extends IRepository<CardForm, TagResult> {
}
