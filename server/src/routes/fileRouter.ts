import { Request, Response, Router } from 'express';
import { FileController } from "../core/controllers/fileController";
import { UploadedFile } from "express-fileupload";

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
        console.error(error);
        res.status(error.code).json({error: error.toString()});
    }

    public get(req: Request, res: Response) {
        try {
            this._fileController.get(Number(req.params['cardId']), true).then((fileUrls: string[]) =>
                res.status(200)
                    .send(fileUrls)
            );
        } catch (error) {
            FileRouter.errorHandler(error, req, res);
        }
    }

    public create(req: Request, res: Response) {
        this._fileController.create(req.files.file as UploadedFile).then((fileId: number) =>
            res.status(201).send('' + fileId)
        ).catch(error => FileRouter.errorHandler(error, req, res));
    }

    public delete(req: Request, res: Response) {
        this._fileController.delete(req.body.fileId).then((message: string) =>
            res.status(201)
                .send({
                    message: message,
                    status: res.status
                })
        ).catch(error => FileRouter.errorHandler(error, req, res));
    }

    init() {
        this._router.get('/:cardId', this.get.bind(this));
        this._router.post('', this.create.bind(this));
        this._router.delete('/:fileId', this.delete.bind(this));
    }
}

export const fileRoutes = new FileRouter();
fileRoutes.init();
