import { NextFunction, Request, Response, Router } from 'express';
import { FileController } from "../core/controllers/fileController";

export class FileRouter {
    private readonly _router: Router;
    private readonly _fileController: FileController;

    constructor() {
        this._fileController = new FileController();
        this._router = Router();
        this.init();
    }

    get fileController() {
        return this._fileController;
    }

    get router() {
        return this._router;
    }

    private static errorHandler(error: any, req: Request, res: Response<any, Record<string, any>>) {
        req.flash('error', error.message);
        res.status(error.code).json({error: error.toString()});
    }

    public get(req: Request, res: Response, next: NextFunction) {
        try {
            console.log(req.body);
            this._fileController.get(req.body.cardId, true).then((fileUrls: string[]) =>
                res.status(200)
                    .send({
                        body: fileUrls,
                        status: res.status
                    })
            );
        } catch (error) {
            FileRouter.errorHandler(error, req, res);
        }
    }

    public create(req: Request, res: Response, next: NextFunction) {
        try {
            console.log(req.body);
            this._fileController.create(req.body as File).then((fileId: number) =>
                res.status(201)
                    .send({
                        message: 'File successfully created',
                        body: fileId,
                        status: res.status
                    })
            );
        } catch (error) {
            FileRouter.errorHandler(error, req, res);
        }
    }

    public delete(req: Request, res: Response, next: NextFunction) {
        try {
            console.log(req.body);
            this._fileController.delete(req.body.cardId).then((message: string) =>
                res.status(201)
                    .send({
                        message: message,
                        status: res.status
                    })
            );
        } catch (error) {
            FileRouter.errorHandler(error, req, res);
        }
    }


    init() {
        this._router.get('/:cardId', this.get);
        this._router.post('/', this.create);
        this._router.delete('/:cardId', this.delete);
    }

}

export const fileRoutes = new FileRouter();
fileRoutes.init();
