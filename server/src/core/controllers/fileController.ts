import { UploadedFile } from "express-fileupload";
import { IStorageService } from "../IStorageService";
import { Logger } from "pino";
import sharp, { Sharp } from "sharp";
import { IFileRepository } from "../repositories/IFileRepository";
import { MD5 } from "crypto-js";
import Tesseract, { RecognizeResult } from "tesseract.js";

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
    public async create(file: UploadedFile): Promise<number> {
        // 1. Convert the file to jpg and compress it
        const convertedFile: Sharp = sharp(file.data).jpeg({mozjpeg: true, quality: 100});
        const fileData: Buffer = await convertedFile.toBuffer();
        const fileHash: string = MD5(fileData.toString('base64')).toString();

        // 2. Store file's metadata in DB and retrieve file ID and name if not already exist
        const fileId: number = this.fileRepository.create({fileHash: fileHash, fileId: null}).files[0];

        // 3. Store file with service
        this.log.debug('Put file in storage service for %s', file.name);
        await this.storage.storeFile(fileId + '.jpg', fileData, "image/jpeg");

        // 4. Create thumbnail using image-thumbnail library then store it
        this.log.debug('Create thumbnail for file and store it');
        const thumbnailData: Buffer = await convertedFile.resize(400).toBuffer();
        await this.storage.storeFile('thumb-' + fileId + '.jpg', thumbnailData, "image/jpeg");

        // 5. Create OCR from file and store it asynchronously, no need to wait for request to end
        // TODO put OCR text content in DB and index it for FTS, use Tesseract.js
        Tesseract.recognize(fileData, 'eng', {logger: m => this.log.debug(m)}).then((data: RecognizeResult) => {
            this.log.debug(data.data.text);
        });

        return fileId;
    }

    /**
     * Remove file from DB and storage
     * @param fileId The file's id
     */
    public async deleteFromId(fileId: number): Promise<string> {
        // remove file metadata from DB
        this.fileRepository.delete({fileId: fileId});

        // remove file data from storage
        this.log.debug('Remove file from storage service for %s', fileId);
        await this.storage.removeFile(fileId + '.jpg');
        await this.storage.removeFile('thumb-' + fileId + '.jpg');

        return 'File was successfully removed';
    }
}
