import { Request, Response, Router } from 'express';
import { CardController } from '../core/controllers/cardController';
import * as yup from 'yup';
import { FileController } from "../core/controllers/fileController";
import { Card, Pagination } from "../types/card";

export class CardRouter {
    private readonly _router: Router;
    private readonly _cardController: CardController;
    private readonly schema;

    constructor() {
        this._cardController = new CardController();
        this._router = Router();
        this.schema = yup.object().shape({
            title: yup.string().required().max(60),
            files: yup.array().of(yup.number().min(1)).required(),
            tags: yup.string().required(),
            website: yup.string().required().max(30),
            username: yup.string().required().max(30)
        });
        this.init();
    }

    get cardController() {
        return this._cardController;
    }

    get router() {
        return this._router;
    }

    private static errorHandler(error: any, _req: Request, res: Response<any, Record<string, any>>) {
        console.error(error);
        res.status(error.code).json({error: error.toString()});
    }

    public get(req: Request, response: Response) {
        try {
            this._cardController.get(JSON.parse(req.query._search ? req.query._search as string : '{}') as Card,
                JSON.parse(req.query._pagination as string) as Pagination)
                .then((result) => {
                        response.header("X-Total-Count", '' + result.count).status(200)
                            .send(result.cards)
                    }
                );
        } catch (error) {
            CardRouter.errorHandler(error, req, response);
        }
    }

    public create(req: Request, res: Response) {
        try {
            this.schema
                .isValid(req.body)
                .then(() => this._cardController.create(req.body as Card));
            // TODO DEBUG is the response sent before being able to catch any error ?
            // TODO DEBUG handle errors properly + response properly
            res.status(201)
                .send({
                    message: 'Card successfully created',
                    status: res.status
                });
        } catch (error) {
            CardRouter.errorHandler(error, req, res);
        }
    }

    public update(req: Request, res: Response) {
        try {
            this.schema
                .isValid(req.body)
                .then(() => this._cardController.update(req.body as Card));

            res.status(201)
                .send({
                    message: 'Card successfully updated',
                    status: res.status
                });
        } catch (error) {
            CardRouter.errorHandler(error, req, res);
        }
    }

    public delete(req: Request, res: Response) {
        try {
            this._cardController.delete(req.body as Card);
            const fileController = new FileController();
            (req.body as Card).files.forEach((fileId: number) => fileController.delete(fileId).then());

            res.status(201)
                .send({
                    message: 'Card successfully deleted',
                    status: res.status
                });
        } catch (error) {
            CardRouter.errorHandler(error, req, res);
        }
    }

    init() {
        this._router.get('', this.get.bind(this));
        this._router.post('', this.create.bind(this));
        this._router.put('/:cardId', this.update.bind(this));
        this._router.delete('/:cardId', this.delete.bind(this));
    }
}

export const cardRoutes = new CardRouter();
cardRoutes.init();
