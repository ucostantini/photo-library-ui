import { Request, Response, Router } from 'express';
import { FileController } from "../core/controllers/fileController";
import { UploadedFile } from "express-fileupload";
import { Logger } from "pino";
import { IStorageService } from "../core/IStorageService";
import { IFileRepository } from "../core/repositories/IFileRepository";

/**
 * Entry point for all CRUD routes related to files
 */
export class FileRouter {
    private readonly _router: Router;
    private readonly fileController: FileController;

    constructor(private log: Logger, storage: IStorageService, private fileRepository: IFileRepository) {
        this.fileController = new FileController(log, storage, fileRepository);
        this._router = Router();
        this.routes();
    }

    /**
     * This method configures all the routes related to files
     */
    public routes() {
        this._router.get('/:fileName', this.get.bind(this));
        this._router.post('', this.create.bind(this));
        this._router.delete('/:fileId', this.delete.bind(this));
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
        this.log.debug(req.params, "Request Parameters Payload");
        this.fileController.get(req.params['fileName']).then((fileUrl: string) => {
            this.log.debug(fileUrl, 'Response Payload');
            res.status(200)
                .send(fileUrl);
        }).catch(error => this.errorHandler(error, res));
    }

    /**
     * @swagger
     * /files:
     *   post:
     *     summary: Store the provided binary file in the application
     *     requestBody:
     *         required: true
     *         content:
     *           schema:
     *             type: object
     *     responses:
     *       201:
     *         description: Return the created ID of the successfully stored binary file
     *         content:
     *           text/plain:
     *             schema:
     *               type: string
     *               example: 2568
     */
    public create(req: Request, res: Response) {
        this.fileController.create(req.files.file as UploadedFile).then((fileId: number) => {
            this.log.debug(fileId, 'Response Payload');
            res.status(201).send('' + fileId);
        }).catch(error => this.errorHandler(error, res));
    }

    /**
     * @swagger
     * /files/{fileId}:
     *   delete:
     *     summary: Delete the file with the provided ID
     *     parameters:
     *       - in: path
     *         name: fileId
     *         required: true
     *         description: The ID of the file to be deleted
     *         example: 19
     *         schema:
     *           type: integer
     *           example: 258
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
     *                   example: File successfully deleted
     *                 status:
     *                   type: integer
     *                   description: The HTTP status code
     *                   example: 201
     */
    public delete(req: Request, res: Response) {
        this.log.debug(req.params, "Request Parameters Payload");
        this.fileController.deleteFromId(Number(req.params.fileId)).then((message: string) => {
            this.log.debug(message, 'Response Payload');
            res.status(201)
                .send({
                    message: message,
                    status: res.status
                });
        }).catch(error => this.errorHandler(error, res));
    }

    /**
     * Error handler for all operations related to file requests
     * @param error the error that occurred in the application. Can be type related, schema (YUP) related, DB related, etc.
     * @param res the 500 error response to be returned to the user
     * @private
     */
    private errorHandler(error: any, res: Response<any, Record<string, any>>) {
        this.log.error(error, "Error occurred in /files entry point");
        res.status(500).json({error: error.toString()});
    }

    get router() {
        return this._router;
    }
}
