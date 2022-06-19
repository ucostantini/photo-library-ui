import express from 'express';
import logger from 'morgan';
import { cardRoutes } from './routes/cardRouter';
import { fileRoutes } from './routes/fileRouter';
import { Database } from 'sqlite3';
import fileUpload from "express-fileupload";
import dotenv from 'dotenv';
import cors from 'cors';

class App {

    public app: express.Application;

    constructor() {
        this.app = express();
        this.middleware();
        this.routes();
    }

    private middleware(): void {
        this.app.use(logger('dev') as express.RequestHandler);
        this.app.use(express.json() as express.RequestHandler);
        this.app.use(express.urlencoded({extended: false}) as express.RequestHandler);
        this.app.use(cors({exposedHeaders: ['X-Total-Count']}));
        this.app.use(fileUpload());
        dotenv.config();
    }

    private routes(): void {
        const router = express.Router();

        router.get('/', (_req, res) => {
            res.redirect('/');
        });

        this.app.use('/', router);
        this.app.use('/cards', cardRoutes.router);
        this.app.use('/files', fileRoutes.router);
    }
}

export default new App().app;
export const db: Database = new Database(process.env.DB_PATH);
