import { IRepository } from "./IRepository";
import { FTSCardRequest, FTSCardResult } from "../../types/card";

export interface IFTSRepository extends IRepository<FTSCardRequest, FTSCardResult> {

}
