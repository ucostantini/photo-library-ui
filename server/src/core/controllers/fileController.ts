import { FileModel } from "../models/fileModel";
import { UploadedFile } from "express-fileupload";
import { CardFile } from "../../types/card";
import { IStorageService } from "../IStorageService";
import { Logger } from "pino";
import sharp, { Sharp } from "sharp";

/**
 * Controller of CRUD operations related to files
 * Performs requests to DB and storage
 */
export class FileController {

    private log: Logger;
    private storage: IStorageService;

    constructor(log: Logger, storage: IStorageService) {
        this.log = log;
        this.storage = storage;
    }

    /**
     * Provided the name of the requested file, return a temporary URL to said file
     * @param fileName name of the file to be retrieved, e.g. : 1975_Ford_Thunderbird_2D.jpg
     * @return an URL leading to the requested file
     */
    public async get(fileName: string): Promise<string> {
        this.log.debug('Get object from storage service for %s', fileName);
        return this.storage.getFile(fileName);
    }

    /**
     * Store the provided file in storage, metadata in DB
     * @param file the file to be stored
     * @return the generated ID of the provided file
     */
    public async create(file: UploadedFile): Promise<number> {
        return new Promise<number>(async (resolve, reject) => {
            try {
                // 1. Store file's metadata in DB and retrieve file ID
                const fileDB: CardFile = await new FileModel(null, []).create('jpg');

                // 2. Convert the file to jpg and compress it
                const convertedFile: Sharp = sharp(file.data).jpeg({mozjpeg: true, quality: 80});
                const fileData: Buffer = await convertedFile.toBuffer();

                // 3. Store file with service
                this.log.debug('Put file in storage service for %s', file.name);
                file.name = fileDB.fileName;
                await this.storage.storeFile(file.name, fileData, "image/jpeg");

                // 3. Create thumbnail using image-thumbnail library then store it
                this.log.debug('Create thumbnail for file and store it');
                const thumbnailData: Buffer = await convertedFile.resize(400).toBuffer();
                file.name = 'thumb-' + file.name;
                await this.storage.storeFile(file.name, thumbnailData, "image/jpeg");

                resolve(fileDB.fileId);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Remove file from DB and storage
     * @param fileId The file's id
     */
    public async deleteFromId(fileId: number): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            try {
                // remove file metadata from DB
                const fm = new FileModel(null, [{fileId: fileId}]);
                const fileName = await fm.getFileName();
                fm.delete();

                await this.storage.removeFile(fileName);
                await this.storage.removeFile('thumb-' + fileName);

                resolve('File was successfully removed');
            } catch (err) {
                reject(err);
            }
        });
    }
}
