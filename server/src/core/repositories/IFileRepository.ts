import { IRepository } from "./IRepository";
import { CardFile, FileResult } from "../../types/card";

export interface IFileRepository extends IRepository<CardFile, FileResult> {
    putFileContent(fileId: number, content: string): void;
}
