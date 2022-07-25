import express from 'express';
import logger from 'morgan';
import { cardRoutes } from './routes/cardRouter';
import { fileRoutes } from './routes/fileRouter';
import fileUpload from "express-fileupload";
import dotenv from 'dotenv';
import cors from 'cors';
import pino, { Logger } from "pino";
import { IDBStrategy } from "./core/dbUtils/dbStrategy";
import { DBClient } from "./types/card";

class App {

    public expressApp: express.Application;
    public db: IDBStrategy;
    public log: Logger;

    constructor() {
        this.expressApp = express();
        this.db = new (DBClient[process.env.DB_CLIENT])();

        this.log = pino({
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true
                }
            }
        });
        this.middleware();
        this.routes();
    }

    private middleware(): void {
        dotenv.config();
        if (process.env.ENVIRONMENT === 'dev') {
            // TODO change this
        }
        this.expressApp.use(logger(process.env.ENVIRONMENT) as express.RequestHandler);
        this.expressApp.use(express.json() as express.RequestHandler);
        this.expressApp.use(express.urlencoded({extended: false}) as express.RequestHandler);
        this.expressApp.use(cors({exposedHeaders: ['X-Total-Count']}));
        this.expressApp.use(fileUpload());
    }

    private routes(): void {
        const router = express.Router();

        router.get('/', (_req, res) => {
            res.redirect('/');
        });

        this.expressApp.use('/', router);
        this.expressApp.use('/cards', cardRoutes.router);
        this.expressApp.use('/files', fileRoutes.router);
    }
}

// TODO refactor these global variables
const mainInstance = new App();
const app = mainInstance.expressApp;
const log = mainInstance.log;
const db = mainInstance.db;
export { app, db, log };
