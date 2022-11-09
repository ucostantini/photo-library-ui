import { Client } from '@elastic/elasticsearch'
import { IFTSRepository } from "./IFTSRepository";
import { FTSCardRequest, FTSCardResult } from "../../types/card";

export class ElasticSearchRepository implements IFTSRepository {

    private elastic: Client = new Client({
        cloud: {id: "id"},
        auth: {apiKey: "prout"}
    });

    create(entity: FTSCardRequest): FTSCardResult {
        this.elastic.index({
            index: "cards",
            document: entity
        });
        return {cardIds: [entity.cardId]};
    }

    delete(entity: FTSCardRequest): void {
        this.elastic.delete({
            id: `${entity.cardId}`,
            index: "cards"
        });
    }

    read(entity: FTSCardRequest): FTSCardResult {
        this.elastic.search({
            index: "cards",
            query: {
                match: entity
            }
        });
    }

    readAll(entity: FTSCardRequest): FTSCardResult {
        throw new Error("Not Implemented 501");
    }

    update(entity: FTSCardRequest): void {
        this.elastic.update({
            index: "cards",
            document: entity
        });
    }

}
