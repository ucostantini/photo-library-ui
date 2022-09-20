import express from 'express';
import logger from 'morgan';
import dotenv from 'dotenv';
import { cardRoutes } from './routes/cardRouter';
import { fileRoutes } from './routes/fileRouter';
import fileUpload from "express-fileupload";
import cors from 'cors';
import pino, { Logger } from "pino";
import { IDBStrategy } from "./core/dbUtils/dbStrategy";
import { DBClient } from "./types/card";
import * as swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

dotenv.config();

/**
 * Represents the whole Express Application
 */
class App {

    // node.js application
    public expressApp: express.Application;
    // Strategy interface for the used DB
    public db: IDBStrategy;
    public log: Logger;

    constructor() {
        this.expressApp = express();
        // initialize DB strategy based on .env value
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

    /**
     * Provides middlewares too express app
     * @private
     */
    private middleware(): void {
        // configure options related to development environment, like DB debugging options or logging
        if (process.env.ENVIRONMENT === 'dev') {
            // TODO change this
        }
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
        // routes related to cards, see cardRouter.ts
        this.expressApp.use('/cards', cardRoutes.router);
        // routes related to files, see fileRouter.ts
        this.expressApp.use('/files', fileRoutes.router);
    }
}

// TODO refactor these global variables
const mainInstance = new App();
const app = mainInstance.expressApp;
const log = mainInstance.log;
const db = mainInstance.db;
export { app, db, log };
