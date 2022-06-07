import { NextFunction, Request, Response, Router } from 'express';
import { CardController } from '../core/cardController';
import * as yup from 'yup';
import { Card } from "../types/card";

export class CardRouter {
  private readonly _router: Router;
  private readonly _cardController: CardController;

  constructor() {
    this._cardController = new CardController();
    this._router = Router();
    this.init();
  }

  get cardController() {
    return this._cardController;
  }

  get router() {
    return this._router;
  }

  private static errorHandler(error: any, req: Request, res: Response<any, Record<string, any>>) {
    req.flash('error', error.message);
    res.status(error.code).json({error: error.toString()});
  }

  public list(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(req.body);
      console.log(req.params);
      console.log(req);

      res.status(200)
          .send({
            message: 'list',
            status: res.status
          });
    } catch (error) {
      CardRouter.errorHandler(error, req, res);
    }
  }

  public create(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(req.body);
      let schema = yup.object().shape({
        title: yup.string().required(),
        files: yup.array().of(yup.number().min(1)).required(),
        source: yup.object().shape({
          website: yup.string().required(),
          username: yup.string().required()
        })
      });
      schema
          .isValid(req.body)
          .then(() => {
            this._cardController.create(req.body as Card);
          }).catch(

      );


      res.status(201)
          .send({
            message: 'Card successfully created',
            status: res.status
          });
    } catch (error) {
      CardRouter.errorHandler(error, req, res);
    }
  }

  public update(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(req.body);


      res.status(201)
          .send({
            message: 'Card successfully updated',
            status: res.status
          });
    } catch (error) {
      CardRouter.errorHandler(error, req, res);
    }
  }

  public delete(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(req.body);


      res.status(201)
          .send({
            message: 'Card successfully deleted',
            status: res.status
          });
    } catch (error) {
      CardRouter.errorHandler(error, req, res);
    }
  }

  /**
   * Take each handler, and attach to one of the Express.Router's
   * endpoints.
   */
  init() {
    this._router.get('/', this.list);
    this._router.post('/', this.create);
    this._router.put('/:cardId', this.update);
    this._router.delete('/:cardId', this.delete);
  }

}

export const cardRoutes = new CardRouter();
cardRoutes.init();
