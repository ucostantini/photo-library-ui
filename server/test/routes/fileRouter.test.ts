import supertest from 'supertest'
import 'jest-extended';
import { FileRouter } from "../../src/routes/fileRouter";

const request = supertest(FileRouter);


describe('GET /files/:fileName', () => {

    it(`should return the URL for the requested file`, async () => {
        const res = await request.get('/files?_fileName=1.jpg').send();
        expect(res.status).toBe(200);
        expect(res.body).toBe('https');
    });

    it(`should return the URL for the requested thumbnail`, async () => {
        const res = await request.get('/files?_fileName=thumb-1.jpg').send();
        expect(res.status).toBe(200);
        expect(res.body).toBe('https');
    });

    it(`should return 404 for the requested file`, async () => {
        const res = await request.get('/files?_fileName=2.jpg').send();
        expect(res.status).toBe(404);
        expect(res.body).toBe('https');
    });

    it(`should return 404 for the requested thumbnail`, async () => {
        const res = await request.get('/files?_fileName=thumb-2.jpg').send();
        expect(res.status).toBe(404);
        expect(res.body).toBe('https');
    });
});

describe('POST /files', () => {

    it(`should return the generated ID for the provided file`, async () => {
        const res = await request.post('/files').send({});
        expect(res.status).toBe(200);
        expect(res.body).toBe('https');
    });

    it(`should return an error for the existing file`, async () => {
        let res = await request.post('/files').send({});
        expect(res.status).toBe(200);
        expect(res.body).toBe('https');

        // duplicate file
        res = await request.post('/files').send({});
        expect(res.status).toBe(500);
        expect(res.body).toBe('already exist');
    });

});
