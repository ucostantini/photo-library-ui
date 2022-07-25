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

    public get(req: Request, res: Response) {
        log.debug(req.params, "Request Parameters Payload");
        this._fileController.getThumbnailUrl(req.params['fileName'], true).then((fileUrl: string) => {
            log.debug(fileUrl, 'Response Payload');
            res.status(200)
                .send(fileUrl);
        }).catch(error => FileRouter.errorHandler(error, req, res));
    }

    public create(req: Request, res: Response) {
        log.debug(req.files, "Request Files Payload");
        this._fileController.create(req.files.file as UploadedFile).then((fileId: number) => {
            log.debug(fileId, 'Response Payload');
            res.status(201).send('' + fileId);
        }).catch(error => FileRouter.errorHandler(error, req, res));
    }

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
