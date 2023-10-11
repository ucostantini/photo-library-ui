import { Client } from '@elastic/elasticsearch'
import { IFTSRepository } from "./IFTSRepository";
import { CardForm } from "../../types/card";
import {
    QueryDslBoolQuery,
    QueryDslQueryContainer,
    SearchHit,
    SearchResponse
} from "@elastic/elasticsearch/lib/api/types";

export class ElasticSearchRepository implements IFTSRepository {
    private index = 'cards';

    private elastic: Client = new Client({node: process.env.ELASTIC_ENDPOINT});

    async create(entity: CardForm): Promise<number[]> {
        this.elastic.index({
            index: this.index,
            id: String(entity.id),
            document: entity
        });
        return [entity.id];
    }

    delete(entity: CardForm): void {
        this.elastic.delete({
            id: `${entity.id}`,
            index: this.index
        });
    }

    async read(entity: CardForm): Promise<number[]> {
        const matches: QueryDslQueryContainer[] = [];

        for (const [key, value] of Object.entries(entity)) {
            if (value !== null && value.length !== 0) {
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

        const response: SearchResponse = await this.elastic.search<CardForm>({
            index: this.index,
            query: {
                bool: {
                    must: matches
                } as QueryDslBoolQuery
            }
        });
        return response.hits.hits.map((val: SearchHit) => Number(val._id));
    }

    readAll(entity: CardForm): Promise<number[]> {
        throw new Error("Not Implemented 501");
    }

    update(entity: CardForm): void {
        this.elastic.update({
            index: this.index,
            id: `${entity.id}`,
            doc: entity
        });
    }

}
