import { Client } from '@elastic/elasticsearch'
import { IFTSRepository } from "./IFTSRepository";
import { CardRequest } from "../../types/card";
import {
    QueryDslBoolQuery,
    QueryDslQueryContainer,
    SearchHit,
    SearchResponse
} from "@elastic/elasticsearch/lib/api/types";

export class ElasticSearchRepository implements IFTSRepository {
    private index = 'cards';

    private elastic: Client = new Client({node: process.env.ELASTIC_ENDPOINT});

    async create(entity: CardRequest): Promise<number[]> {
        this.elastic.index({
            index: this.index,
            id: String(entity.cardId),
            document: entity
        });
        return [entity.cardId];
    }

    delete(entity: CardRequest): void {
        this.elastic.delete({
            id: `${entity.cardId}`,
            index: this.index
        });
    }

    async read(entity: CardRequest): Promise<number[]> {
        const matches: QueryDslQueryContainer[] = [];

        for (const [key, value] of Object.entries(entity)) {
            if (value.length !== 0) {
                matches.push({
                    match: {
                        [key]: {
                            query: (Array.isArray(value) ? value.join(' ') : value),
                            fuzziness: 2
                        }
                    }
                });
            }
        }
        console.log(matches);
        const response: SearchResponse = await this.elastic.search<CardRequest>({
            index: this.index,
            query: {
                bool: {
                    must: matches
                } as QueryDslBoolQuery
            }
        });
        return response.hits.hits.map((val: SearchHit) => Number(val._id));
    }

    readAll(entity: CardRequest): Promise<number[]> {
        throw new Error("Not Implemented 501");
    }

    update(entity: CardRequest): void {
        this.elastic.update({
            index: this.index,
            id: `${entity.cardId}`,
            doc: entity
        });
    }

}
