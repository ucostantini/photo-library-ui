import supertest from 'supertest'
import 'jest-extended';
import { TagRouter } from "../../src/routes/tagRouter";
import { TagResult } from "../../src/types/card";

const request = supertest(TagRouter);

describe('GET /tags', () => {

    it(`should return all tags in DB without duplicates`, async () => {
        const expectedRes: TagResult = {tags: ["tag1", "tag2", "tag3"]}

        const res = await request.get('/tags').send();
        expect(res.status).toBe(200);
        expect(res.body as TagResult).toBe(expectedRes);
    });
});

