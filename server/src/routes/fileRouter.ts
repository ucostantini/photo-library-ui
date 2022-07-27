import { Request, Response, Router } from 'express';
import { FileController } from "../core/controllers/fileController";
import { UploadedFile } from "express-fileupload";
import { log } from "../app";

export class FileRouter {
    private readonly _router: Router;
    private readonly _fileController: FileController;

    constructor() {
        this._fileController = new FileController();
        this._router = Router();
        this.init();
    }

    get router() {
        return this._router;
    }

    private static errorHandler(error: any, _req: Request, res: Response<any, Record<string, any>>) {
        log.error(error);
        res.status(500).json({error: error.toString()});
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
        log.debug(req.params, "Request Parameters Payload");
        this._fileController.getThumbnailUrl(req.params['fileName'], true).then((fileUrl: string) => {
            log.debug(fileUrl, 'Response Payload');
            res.status(200)
                .send(fileUrl);
        }).catch(error => FileRouter.errorHandler(error, req, res));
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
        log.debug(req.files, "Request Files Payload");
        this._fileController.create(req.files.file as UploadedFile).then((fileId: number) => {
            log.debug(fileId, 'Response Payload');
            res.status(201).send('' + fileId);
        }).catch(error => FileRouter.errorHandler(error, req, res));
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
        log.debug(req.params, "Request Parameters Payload");
        this._fileController.delete([{fileId: Number(req.params.fileId)}]).then((message: string) => {
            log.debug(message, 'Response Payload');
            res.status(201)
                .send({
                    message: message,
                    status: res.status
                });
        }).catch(error => FileRouter.errorHandler(error, req, res));
    }

    init() {
        this._router.get('/:fileName', this.get.bind(this));
        this._router.post('', this.create.bind(this));
        this._router.delete('/:fileId', this.delete.bind(this));
    }
}

export const fileRoutes = new FileRouter();
fileRoutes.init();
