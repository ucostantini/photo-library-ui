import { Client, ClientOptions } from "minio";
import { FileModel } from "../models/fileModel";
import imageFunction from "image-thumbnail";
import { UploadedFile } from "express-fileupload";
import { log } from "../../app";
import { CardFile } from "../../types/card";

/**
 * Controller of CRUD operations related to files
 * Performs requests to DB and storage
 */
export class FileController {

    // MinIO options, stored in .env
    private static MINIO: Client = new Client({
        endPoint: process.env.MINIO_ENDPOINT,
        port: +process.env.MINIO_PORT,
        useSSL: process.env.MINIO_USE_SSL === 'true',
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY
    } as ClientOptions);

    /**
     * Provided the name of the requested file, return a temporary URL to said file
     * @param fileName name of the file to be retrieved, e.g. : 1975_Ford_Thunderbird_2D.jpg
     * @param isThumbnail is the file requested a thumbnail ?
     * @return an URL leading to the requested file
     */
    public async get(fileName: string, isThumbnail: boolean): Promise<string> {
        const prefix = isThumbnail ? 'thumb-' : '';
        log.info('Get object from MinIO for fileId %s, thumbnail is %s', fileName, isThumbnail);
        return FileController.MINIO.presignedGetObject(process.env.MINIO_BUCKET_NAME, prefix + fileName);
    }

    /**
     * Store the provided file in the MinIO storage, its metadata in the DB, retrieving the fileId
     * TODO use model to generify file storage (minio, S3...)
     * @param file the file to be stored
     * @return the generated ID of the provided file
     */
    public async create(file: UploadedFile): Promise<number> {
        return new Promise<number>(async (resolve, reject) => {
            try {
                // 1. Store the metadata of the file in DB and retrieve file ID
                const fileExtension = file.name.split('.').pop();
                const fileDB: CardFile = await new FileModel(null, []).create(fileExtension);

                // 2. Generate base64 and full name of the file (i.e. including its extension) then store the file
                log.debug(fileDB.fileId, 'Put file in MinIO for following file Id');
                const base64: string = file.data.toString('base64');
                await FileController.MINIO.putObject(process.env.MINIO_BUCKET_NAME, fileDB.fileName, base64, undefined, {'Content-Type': file.mimetype});

                // 3. create thumbnail using image-thumbnail library then store it
                log.debug(fileDB.fileId, 'Put thumbnail in MinIO for following file Id');
                const thumbnail: Buffer = await imageFunction(base64, {responseType: 'buffer', percentage: 40});
                await FileController.MINIO.putObject(process.env.MINIO_BUCKET_NAME, 'thumb-' + fileDB.fileName, thumbnail);
                resolve(fileDB.fileId);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Remove files from DB and storage
     * @param files provided files
     */
    public async deleteFromNames(files: CardFile[]): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            try {
                log.debug(files, 'Remove files from MinIO for following file names');
                for (const file of files) {
                    await FileController.MINIO.removeObject(process.env.MINIO_BUCKET_NAME, file.fileName);
                    await FileController.MINIO.removeObject(process.env.MINIO_BUCKET_NAME, 'thumb-' + file.fileName);
                }
                // remove files metadata from DB
                new FileModel(null, files).delete();
                resolve('File was successfully removed');
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     *
     * @param fileId
     */
    public async deleteFromId(fileId: number): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            try {
                // remove file metadata from DB
                const fm = new FileModel(null, [{fileId: fileId}]);
                const fileName = await fm.getFileName();
                fm.delete();

                await FileController.MINIO.removeObject(process.env.MINIO_BUCKET_NAME, fileName);
                await FileController.MINIO.removeObject(process.env.MINIO_BUCKET_NAME, 'thumb-' + fileName);

                resolve('File was successfully removed');
            } catch (err) {
                reject(err);
            }
        });
    }
}
