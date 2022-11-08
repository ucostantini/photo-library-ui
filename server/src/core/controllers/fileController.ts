import { UploadedFile } from "express-fileupload";
import { CardFile } from "../../types/card";
import { IStorageService } from "../IStorageService";
import { Logger } from "pino";
import sharp, { Sharp } from "sharp";
import { IFileRepository } from "../repositories/IFileRepository";
import { MD5 } from "crypto-js";

/**
 * Controller of CRUD operations related to files
 * Performs requests to DB and storage
 */
export class FileController {

    constructor(private log: Logger, private storage: IStorageService, private fileRepository: IFileRepository) {
    }

    /**
     * Provided the name of the requested file, return a temporary URL to said file
     * @param fileName name of the file to be retrieved, e.g. : 1975_Ford_Thunderbird_2D.jpg
     * @return an URL leading to the requested file
     */
    public get(fileName: string): Promise<string> {
        this.log.debug('Get object from storage service for %s', fileName);
        return this.storage.getFile(fileName);
    }

    /**
     * Store the provided file in storage, metadata in DB
     * @param file the file to be stored
     * @return the generated ID of the provided file
     */
    public create(file: UploadedFile): Promise<number> {
        return new Promise<number>(async (resolve, reject) => {
            try {
                // 1. Convert the file to jpg and compress it
                // TODO chek JPEG quality, do tests
                const convertedFile: Sharp = sharp(file.data).jpeg({mozjpeg: true, quality: 80});
                const fileData: Buffer = await convertedFile.toBuffer();
                const fileHash: string = MD5(fileData.toString('base64')).toString();

                // 2. Store file's metadata in DB and retrieve file ID and name if not already exist
                const fileDB: CardFile = this.fileRepository.create({fileName: fileHash, fileId: null}).files[0];

                // 3. Store file with service
                this.log.debug('Put file in storage service for %s', file.name);
                file.name = fileDB.fileName;
                await this.storage.storeFile(file.name, fileData, "image/jpeg");

                // 4. Create thumbnail using image-thumbnail library then store it
                this.log.debug('Create thumbnail for file and store it');
                const thumbnailData: Buffer = await convertedFile.resize(400).toBuffer();
                file.name = 'thumb-' + file.name;
                await this.storage.storeFile(file.name, thumbnailData, "image/jpeg");

                resolve(fileDB.fileId);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Remove file from DB and storage
     * @param fileId The file's id
     */
    public deleteFromId(fileId: number): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            try {
                // remove file metadata from DB
                const file: CardFile = this.fileRepository.read({fileName: "", fileId: fileId}).files[0];
                this.fileRepository.delete(file);

                // remove file data from storage
                this.log.debug('Remove file from storage service for %s', file.fileName);
                await this.storage.removeFile(file.fileName);
                await this.storage.removeFile('thumb-' + file.fileName);

                resolve('File was successfully removed');
            } catch (error) {
                reject(error);
            }
        });
    }
}
