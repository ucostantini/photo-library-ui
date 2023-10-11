import { IRepository } from "./IRepository";
import { CardRequest, TagResult } from "../../types/card";

export interface ITagRepository extends IRepository<CardRequest, TagResult> {
}
