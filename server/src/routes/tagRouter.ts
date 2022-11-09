import { Request, Response, Router } from 'express';
import { TagResult } from "../types/card";
import { TagController } from "../core/controllers/tagController";
import { ITagRepository } from "../core/repositories/ITagRepository";

/**
 * Entry point for all CRUD routes related to files
 */
export class TagRouter {
    private readonly _router: Router;
    private readonly tagController: TagController;

    constructor(tagRepository: ITagRepository) {
        this.tagController = new TagController(tagRepository);
        this._router = Router();
        this.routes();
    }

    get router() {
        return this._router;
    }

    /**
     * This method configures all the routes related to files
     */
    public routes() {
        this._router.get('', this.get.bind(this));
    }

    /**
     * @swagger
     * /files/{fileName}:
     *   get:
     *     summary: Retrieve a file URL, given the provided file name
     *     parameters:
     *       - in: path
     *         name: fileName
     *         required: true
     *         description: The name of the requested file
     *         example: 1975_Ford_Thunderbird_2D.jpg
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: The URL leading to the requested file
     *         content:
     *           text/plain:
     *             schema:
     *               type: string
     *               example: http://localhost:9000/photo-library/314.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220726%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220726T182820Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=a186ae2d57f58c7896cfac1bbb416a72217da464f269e5396139cef9abc5dafd
     */
    public get(req: Request, res: Response) {
        this.tagController.get().then((tags: TagResult) => {
            res.status(200)
                .send(tags);
        }).catch(error => this.errorHandler(error, res));
    }

    /**
     * Error handler for all operations related to file requests
     * @param error the error that occurred in the application. Can be type related, schema (YUP) related, DB related, etc.
     * @param res the 500 error response to be returned to the user
     * @private
     */
    private errorHandler(error: any, res: Response<any, Record<string, any>>) {
        res.status(500).send(error.message);
    }
}
