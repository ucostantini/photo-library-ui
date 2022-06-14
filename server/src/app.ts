import express from 'express';
import ExpressSession from 'express-session';
import logger from 'morgan';
import flash from 'express-flash-plus';
import { cardRoutes } from './routes/cardRouter';
import { fileRoutes } from './routes/fileRouter';
import { Database } from 'sqlite3';
import fileUpload from "express-fileupload";
// TODO CHANGE THIS !!!
export const db: Database = new Database('/home/wolfie/git/photo-library/server/resources/db.sqlite');

// Creates and configures an ExpressJS web server.
class App {

  // ref to Express instance
  public app: express.Application;

  //Run configuration methods on the Express instance.
  constructor() {
    this.app = express();
    this.middleware();
    this.routes();
    this.app.set('view engine', 'pug');
    this.app.use(express.static(__dirname + '/public') as express.RequestHandler); // https://expressjs.com/en/starter/static-files.html
  }

  // Configure Express middleware.
  private middleware(): void {
    this.app.use(logger('dev') as express.RequestHandler);
    this.app.use(express.json() as express.RequestHandler);
    this.app.use(express.urlencoded({extended: false}) as express.RequestHandler);
    this.app.use(ExpressSession(
        {
          secret: 'My Secret Key',
          resave: false,
          saveUninitialized: true
        }));
    this.app.use(flash());
    this.app.use(require('cors')());
    this.app.use(fileUpload());
  }

  // Configure API endpoints.
  private routes(): void {
    let router = express.Router();

    router.get('/', (req, res, next) => {
      res.redirect('/');
    });

    this.app.use('/', router);
    this.app.use('/cards', cardRoutes.router);
    this.app.use('/files', fileRoutes.router);
  }
}

export default new App().app;
