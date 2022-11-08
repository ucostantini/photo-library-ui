import { IRepository } from "./IRepository";
import { CardFile, FileResult } from "../../types/card";

export interface IFileRepository extends IRepository<CardFile, FileResult> {
}
