import { Client, ClientOptions } from "minio";
import { FileModel } from "../models/fileModel";
import imageFunction from "image-thumbnail";
import dotenv from "dotenv";
import { UploadedFile } from "express-fileupload";
import { NotFoundError } from "../errors/notFoundError";
import { log } from "../../app";

dotenv.config();

export class FileController {
    private static readonly BUCKET: string = 'photo-library';

    private static MINIO: Client = new Client({
        endPoint: process.env.MINIO_ENDPOINT,
        port: +process.env.MINIO_PORT,
        useSSL: process.env.MINIO_USE_SSL === 'true',
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY
    } as ClientOptions);

    public async get(cardId: number, isThumbnail: boolean): Promise<string[]> {
        return new Promise<string[]>(async (resolve, reject) => {
            try {
                const bucketExists: boolean = await FileController.MINIO.bucketExists(FileController.BUCKET);
                if (bucketExists) {
                    const fileIds: { fileId: number }[] = await new FileModel(cardId, []).get();
                    const fileUrls: string[] = [];
                    const prefix = isThumbnail ? 'thumb-' : '';
                    log.debug(fileIds, 'Get pre-signed URL from MinIO for following file Ids, thumbnail is {}', isThumbnail);
                    for (const fileId of fileIds) {
                        fileUrls.push(await FileController.MINIO.presignedGetObject(FileController.BUCKET, prefix + fileId.fileId))
                    }
                    log.debug(fileUrls, 'File URLs retrieved from MinIO instance');
                    resolve(fileUrls);
                } else {
                    throw new NotFoundError("Bucket does not exists");
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    public async create(file: UploadedFile): Promise<number> {
        return new Promise<number>(async (resolve, reject) => {
            try {
                const bucketExists: boolean = await FileController.MINIO.bucketExists(FileController.BUCKET);
                if (bucketExists) {
                    const fileId: number = await new FileModel(null, []).create();
                    const base64: string = file.data.toString('base64');
                    log.debug(fileId, 'Put file in MinIO for following file Id');
                    await FileController.MINIO.putObject(FileController.BUCKET, fileId.toString(), base64);
                    const thumbnail: Buffer = await imageFunction(base64, {responseType: 'buffer', percentage: 40});
                    log.debug(fileId, 'Put thumbnail in MinIO for following file Id');
                    await FileController.MINIO.putObject(FileController.BUCKET, 'thumb-' + fileId.toString(), thumbnail);
                    resolve(fileId);
                } else {
                    throw new NotFoundError("Bucket does not exists");
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    public async delete(fileIds: number[]): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            try {
                const bucketExists: boolean = await FileController.MINIO.bucketExists(FileController.BUCKET);
                if (bucketExists) {
                    log.debug(fileIds, 'Delete files from MinIO for following file Ids');
                    for (const fileId in fileIds) {
                        await FileController.MINIO.removeObject(FileController.BUCKET, fileId + '');
                        await FileController.MINIO.removeObject(FileController.BUCKET, 'thumb-' + fileId);
                    }
                    new FileModel(null, fileIds).delete();
                    resolve('File was successfully removed');
                } else {
                    throw new NotFoundError("Bucket does not exists");
                }
            } catch (err) {
                reject(err);
            }
        });
    }
}
