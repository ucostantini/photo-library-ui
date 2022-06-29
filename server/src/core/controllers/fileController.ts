import { Client, ClientOptions } from "minio";
import { FileModel } from "../models/fileModel";
import imageFunction from "image-thumbnail";
import dotenv from "dotenv";
import { UploadedFile } from "express-fileupload";
import { NotFoundError } from "../errors/notFoundError";
import { log } from "../../app";

dotenv.config();

export class FileController {

    private static MINIO: Client = new Client({
        endPoint: process.env.MINIO_ENDPOINT,
        port: +process.env.MINIO_PORT,
        useSSL: process.env.MINIO_USE_SSL === 'true',
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY
    } as ClientOptions);

    public async getThumbnailUrl(fileName: string, isThumbnail: boolean): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            try {
                const bucketExists: boolean = await FileController.MINIO.bucketExists(process.env.MINIO_BUCKET_NAME);
                if (bucketExists) {
                    const prefix = isThumbnail ? 'thumb-' : '';
                    log.info('Get object from MinIO for fileId %s, thumbnail is %s', fileName, isThumbnail);
                    const url: string = await FileController.MINIO.presignedGetObject(process.env.MINIO_BUCKET_NAME, prefix + fileName);
                    resolve(url);
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
                const bucketExists: boolean = await FileController.MINIO.bucketExists(process.env.MINIO_BUCKET_NAME);
                if (bucketExists) {
                    const fileId: number = await new FileModel(null, []).create();
                    const base64: string = file.data.toString('base64');
                    log.debug(fileId, 'Put file in MinIO for following file Id');
                    const fileName = fileId.toString() + '.' + file.name.split('.').pop();
                    await FileController.MINIO.putObject(process.env.MINIO_BUCKET_NAME, fileName, base64, undefined, {'Content-Type': file.mimetype});
                    const thumbnail: Buffer = await imageFunction(base64, {responseType: 'buffer', percentage: 40});
                    log.debug(fileId, 'Put thumbnail in MinIO for following file Id');
                    await FileController.MINIO.putObject(process.env.MINIO_BUCKET_NAME, 'thumb-' + fileName, thumbnail);
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
                const bucketExists: boolean = await FileController.MINIO.bucketExists(process.env.MINIO_BUCKET_NAME);
                if (bucketExists) {
                    log.debug(fileIds, 'Delete files from MinIO for following file Ids');
                    for (const fileId in fileIds) {
                        await FileController.MINIO.removeObject(process.env.MINIO_BUCKET_NAME, fileId + '');
                        await FileController.MINIO.removeObject(process.env.MINIO_BUCKET_NAME, 'thumb-' + fileId);
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
