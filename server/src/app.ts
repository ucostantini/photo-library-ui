import express from 'express';
import logger from 'morgan';
import dotenv from 'dotenv';
import fileUpload from "express-fileupload";
import cors from 'cors';
import pino, { Logger } from "pino";
import { IDBStrategy } from "./core/dbUtils/dbStrategy";
import { DBClient, StorageService } from './types/card';
import * as swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { IStorageService } from './core/IStorageService';
import { CardRouter } from "./routes/cardRouter";
import { FileRouter } from "./routes/fileRouter";

/**
 * Represents the whole Express Application
 */
class App {

    // node.js application
    public expressApp: express.Application;

    private db: IDBStrategy;
    private storage: IStorageService;
    private log: Logger;

    constructor() {
        this.expressApp = express();
        dotenv.config();
        // initialize DB connection and storage service based on .env value
        this.db = new (DBClient[process.env.DB_CLIENT])();
        this.storage = new (StorageService[process.env.STORAGE_SERVICE])();

        this.log = pino({
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true
                }
            },
            level: process.env.LOG_LEVEL || 'info'
        });

        this.expressApp.set('log', this.log);
        this.expressApp.set('db', this.db);
        this.expressApp.set('storage', this.storage);
        this.middleware();
        this.routes();
    }

    /**
     * Provides middlewares too express app
     * @private
     */
    private middleware(): void {
        this.expressApp.use(logger(process.env.ENVIRONMENT) as express.RequestHandler);
        this.expressApp.use(express.json() as express.RequestHandler);
        this.expressApp.use(express.urlencoded({extended: false}) as express.RequestHandler);
        this.expressApp.use(cors({exposedHeaders: ['X-Total-Count']}));
        // support for file upload
        this.expressApp.use(fileUpload());

        // swagger openApi configuration
        const options: swaggerJSDoc.OAS3Options = {
            definition: {
                openapi: '3.0.0',
                info: {
                    title: 'Photo Library',
                    description: 'A library to store information related to photos',
                    version: '1.0.0',
                },
            },
            apis: ['./src/routes/*Router.ts'],
        };
        this.expressApp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(options)))
    }

    /**
     * Entry point for routes, more routes in routes/* folder
     * @private
     */
    private routes(): void {
        this.expressApp.get('/', (_req, res) => res.redirect('/'));

        const cardRouter = new CardRouter(this.log);
        const fileRouter = new FileRouter(this.log, this.storage);

        cardRouter.routes();
        fileRouter.routes();

        this.expressApp.use('/cards', cardRouter.router);
        this.expressApp.use('/files', fileRouter.router);
    }
}

const app = new App().expressApp;
export { app };
