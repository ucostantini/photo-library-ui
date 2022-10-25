import { Client, ClientOptions } from 'minio';
import { UploadedFile } from "express-fileupload";
import { IStorageService } from './IStorageService';

export class MinIOStorageService implements IStorageService {
    // MinIO options, stored in .env
    private static MINIO: Client = new Client({
        endPoint: process.env.MINIO_ENDPOINT,
        port: +process.env.MINIO_PORT,
        useSSL: process.env.MINIO_USE_SSL === 'true',
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY
    } as ClientOptions);

    public storeFile(file: UploadedFile): Promise<any> {
        return MinIOStorageService.MINIO.putObject(process.env.MINIO_BUCKET_NAME, file.name, file.data, undefined, {'Content-Type': file.mimetype});
    }

    public getFile(fileName: string): Promise<string> {
        return MinIOStorageService.MINIO.presignedGetObject(process.env.MINIO_BUCKET_NAME, fileName);
    }

    public removeFile(fileName: string): Promise<void> {
        return MinIOStorageService.MINIO.removeObject(process.env.MINIO_BUCKET_NAME, fileName);
    }

}
