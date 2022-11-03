import { Request, Response, Router } from 'express';
import { CardController } from '../core/controllers/cardController';
import * as yup from 'yup';
import { BaseSchema } from 'yup';
import { Card, Pagination } from "../types/card";
import { Logger } from "pino";

/**
 * Entry point for all CRUD routes related to cards
 */
export class CardRouter {
    private readonly _router: Router;
    private readonly cardController: CardController;
    // YUP schema specification for validation of a Card object
    private readonly schema: BaseSchema;

    private log: Logger;
    /**
     * @swagger
     * components:
     *   schemas:
     *     Card:
     *       type: object
     *       properties:
     *         cardId:
     *           type: integer
     *           description: The card ID.
     *           example: 12
     *         title:
     *           type: string
     *           description: The card's title
     *           example: 1975 Ford Thunderbird 2D
     *         files:
     *           type: array
     *           items:
     *             type: object
     *             properties:
     *               fileId:
     *                 type: integer
     *                 description: The file's id
     *                 example: 45
     *               fileName:
     *                 type: string
     *                 description: The file's name
     *                 example: 1975_Ford_Thunderbird_2D.jpg
     *         tags:
     *           type: string
     *           description: the card's tags
     *           example: car,antique,v8,70s
     *         website:
     *           type: string
     *           description:
     *           example: twitter
     *         username:
     *           type: string
     *           description:
     *           example: johnDoe125
     *         created:
     *           type: string
     *           description: the card's created date in form of JS Date object
     *           example: 2018-02-12
     *         modified:
     *           type: string
     *           description: the card's last modified date in form of JS Date object
     *           example: 2019-07-22
     */

    constructor(log: Logger) {
        this.cardController = new CardController(log);
        this._router = Router();
        this.log = log;

        // YUP schema specification for validation of a Card object
        this.schema = yup.object({
            title: yup.string().max(60).required(),
            files: yup.array().of(yup.object({
                fileId: yup.number().required(),
                fileName: yup.string()
            })).min(1).required(),
            tags: yup.array().of(yup.string().min(3)).min(1).required(),
            website: yup.string().max(30).required(),
            username: yup.string().max(30).required()
        });

        // configure routes
        this.routes();
    }

    /**
     * This method configures all the routes related to cards
     */
    public routes() {
        this._router.get('', this.get.bind(this));
        this._router.post('', this.create.bind(this));
        this._router.put('/:cardId', this.update.bind(this));
        this._router.delete('/:cardId', this.delete.bind(this));
    }

    /**
     * @swagger
     * /cards:
     *   get:
     *     summary: Retrieve a list of cards
     *     description: Retrieve a list of cards when the user navigates to the home page (all cards)
     *                  or when the user performs a search (matching cards)
     *     parameters:
     *       - in: query
     *         name: _search
     *         required: false
     *         description: The fields of the searched card, in case of a search action
     *         schema:
     *           $ref: '#/components/schemas/Card'
     *       - in: query
     *         name: _pagination
     *         required: true
     *         description: The pagination fields
     *         schema:
     *           type: object
     *           properties:
     *             _page:
     *               type: string
     *               description: The page requested
     *               example: 4
     *             _limit:
     *               type: string
     *               description: The number of resources per page
     *               example: 25
     *             _sort:
     *               type: string
     *               description: The sort type
     *               example: title
     *             _order:
     *               type: string
     *               description: The order of sorting
     *               example: desc
     *     responses:
     *       200:
     *         description: The list of cards
     *         headers:
     *           X-Total-Count:
     *             schema:
     *               type: integer
     *             description: Total number of resources matching the condition
     *             example: 778
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Card'
     */
    public get(req: Request, response: Response) {
        this.log.info(req.query, "Request Query Payload");
        // parse provided search query as Card object, empty if absent
        const card: Card = JSON.parse(req.query._search ? req.query._search as string : null);
        // parse pagination object in query
        const pagination: Pagination = JSON.parse(req.query._pagination as string);

        this.cardController.get(card, pagination)
            .then((result) => {
                    this.log.debug(result, 'Response Payload');
                    // set the total count header to get the total number of resources matching the condition
                    response.header("X-Total-Count", '' + result.count)
                        .status(200)
                        .send(result.cards)
                }
            ).catch((error: Error) => this.errorHandler(error, response));
    }

    /**
     * @swagger
     * /cards:
     *   post:
     *     summary: Create a new Card from the provided data
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Card'
     *     responses:
     *       201:
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: The success creation message
     *                   example: Card successfully created
     *                 status:
     *                   type: integer
     *                   description: The HTTP status code
     *                   example: 201
     */
    public create(req: Request, res: Response) {
        this.log.info(req.body, "Request Body Payload");
        // check validity of provided card information using defined schema
        this.schema
            .validate(req.body as Card)
            .then(() => this.cardController.create(req.body as Card))
            .then((message: string) => res.status(201)
                .send({
                    message: message
                }))
            .catch((error: Error) => this.errorHandler(error, res));
    }

    /**
     * @swagger
     * /cards/{cardId}:
     *   put:
     *     summary: Update the card with the provided data
     *     description: Use the card's id provided to update the stored card with the provided data
     *     parameters:
     *      - in: path
     *        name: cardId
     *        required: true
     *        description: The ID of the card to be updated
     *        type: integer
     *        example: 12
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Card'
     *     responses:
     *       201:
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: The success update message
     *                   example: Card successfully updated
     *                 status:
     *                   type: integer
     *                   description: The HTTP status code
     *                   example: 201
     */
    public update(req: Request, res: Response) {
        this.log.info(req.body, "Request Body Payload");
        // check validity of provided card information using defined schema
        this.schema
            .validate(req.body as Card)
            .then(() => this.cardController.update(req.body as Card))
            .then((message: string) => res.status(200)
                .send({
                    message: message
                }))
            .catch((error: Error) => this.errorHandler(error, res));
    }

    /**
     * @swagger
     * /cards/{cardId}:
     *   delete:
     *     summary: Delete the card with the provided ID
     *     parameters:
     *      - in: path
     *        name: cardId
     *        required: true
     *        description: The ID of the card to be deleted
     *        type: integer
     *        example: 12
     *     responses:
     *       201:
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: The success deletion message
     *                   example: Card successfully deleted
     *                 status:
     *                   type: integer
     *                   description: The HTTP status code
     *                   example: 201
     */
    public delete(req: Request, res: Response) {
        this.log.info(req.params, "Request Parameters Payload");
        this.cardController.delete(Number(req.params.cardId))
            .then((message: string) => res.status(200)
                .send({
                    message: message
                }))
            .catch((error: Error) => this.errorHandler(error, res));
    }

    /**
     * Error handler for all operations related to card requests
     * @param error the error that occurred in the application. Can be type related, schema (YUP) related, DB related, etc.
     * @param res the 500 error response to be returned to the user
     * @private
     */
    private errorHandler(error: Error, res: Response<any, Record<string, any>>) {
        this.log.error(error, "Error occurred in /cards entry point");
        res.status(500).send({message: error.message});
    }

    get router() {
        return this._router;
    }
}
