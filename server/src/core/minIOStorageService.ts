import { Client, ClientOptions } from 'minio';
import { IStorageService } from './IStorageService';


export class MinIOStorageService implements IStorageService {
    private minio: Client = new Client({
        endPoint: process.env.MINIO_ENDPOINT,
        port: +process.env.MINIO_PORT,
        useSSL: process.env.MINIO_USE_SSL === 'true',
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY
    } as ClientOptions);

    public storeFile(fileName: string, fileData: Buffer, fileMimeType: string): Promise<any> {
        return this.minio.putObject(process.env.MINIO_BUCKET_NAME, fileName, fileData, undefined, {'Content-Type': fileMimeType});
    }

    public getFile(fileName: string): Promise<string> {
        return this.minio.presignedGetObject(process.env.MINIO_BUCKET_NAME, fileName);
    }

    public removeFile(fileName: string): Promise<void> {
        return this.minio.removeObject(process.env.MINIO_BUCKET_NAME, fileName);
    }

}
