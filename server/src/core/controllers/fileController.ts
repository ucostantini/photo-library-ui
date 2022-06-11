import { getDB } from "../../app";

import { Client, ClientOptions } from "minio";
import { FileModel } from "../models/fileModel";
import imageFunction from "image-thumbnail";
import dotenv from "dotenv";

dotenv.config();

export class FileController {
    private static readonly BUCKET: string = 'photo-library';
    private minio: Client = new Client({
        endPoint: process.env.MINIO_ENDPOINT,
        port: +process.env.MINIO_PORT,
        useSSL: process.env.MINIO_USE_SSL === 'true',
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY
    } as ClientOptions);

    constructor() {
    }

    public async get(cardId: number, thumbnail: boolean): Promise<string[]> {

        return new Promise<string[]>(async (resolve, reject) => {
            try {
                const bucketExists: boolean = await this.minio.bucketExists(FileController.BUCKET);
                if (bucketExists) {
                    const fileIds: number[] = await new FileModel(getDB(), cardId, []).get();
                    const fileUrls: string[] = [];
                    const prefix = thumbnail ? 'thumb-' : '';

                    for (const fileId of fileIds) {
                        fileUrls.push(await this.minio.presignedGetObject(FileController.BUCKET, prefix + fileId))
                    }
                    resolve(fileUrls);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    public async create(file: File): Promise<number> {
        return new Promise<number>(async (resolve, reject) => {
            try {
                const bucketExists: boolean = await this.minio.bucketExists(FileController.BUCKET);
                if (bucketExists) {
                    const fileId: number = await new FileModel(getDB(), null, []).insert();
                    const base64: string = await file.text();
                    await this.minio.putObject(FileController.BUCKET, fileId.toString(), base64);
                    const thumbnail: Buffer = await imageFunction(base64);
                    await this.minio.putObject(FileController.BUCKET, 'thumb-' + fileId.toString(), thumbnail)
                    resolve(fileId);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    public async delete(cardId: number): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            try {
                const bucketExists: boolean = await this.minio.bucketExists(FileController.BUCKET);
                if (bucketExists) {
                    const strFileIds: string[] = [];
                    const thumbFileIds: string[] = [];
                    (await new FileModel(getDB(), cardId, []).get()).forEach((fileId: number) => {
                        strFileIds.push(fileId + '');
                        thumbFileIds.push('thumb-' + fileId);
                    });
                    await this.minio.removeObjects(FileController.BUCKET, strFileIds);
                    await this.minio.removeObjects(FileController.BUCKET, thumbFileIds);
                    new FileModel(getDB(), cardId, []).delete();
                    resolve('File was deleted successfully');
                }
            } catch (err) {
                reject(err);
            }
        });
    }
}
