import { IStorageService } from "../storage/IStorageService";
import { Logger } from "pino";
import sharp, { Sharp } from "sharp";
import { IFileRepository } from "../repositories/IFileRepository";
import { MD5 } from "crypto-js";
import Tesseract, { RecognizeResult, Worker } from "tesseract.js";
import { FileURL } from "../../types/card";

/**
 * Controller of CRUD operations related to files
 * Performs requests to DB and storage
 */
export class FileController {

    constructor(private log: Logger,
                private storage: IStorageService,
                private fileRepository: IFileRepository) {
    }

    /**
     * Provided the name of the requested file, return a temporary URL to said file
     * @param cardId name of the file to be retrieved, e.g. : 1975_Ford_Thunderbird_2D.jpg
     * @return an URL leading to the requested file
     */
    public get(cardId: number): Promise<FileURL[]> {
        this.log.debug('Get object from storage service for card %s', cardId);
        const fileIds: number[] = this.fileRepository.read({fileId: cardId}).files;

        return Promise.all(fileIds.map(async (fileId: number) => {
            const file = this.fileStructure(fileId);
            return {
                fileURL: await this.storage.getFile(file.name),
                thumbnailURL: await this.storage.getFile(file.thumb)
            };
        }));
    }

    /**
     * Store the provided file in storage, metadata in DB
     * @param file the file to be stored
     * @return the generated ID of the provided file
     */
    public async create(files: string[], tesseractWorker: Worker): Promise<number[]> {
        const fileIds: number[] = [];
        for (const file of files) {
            // 1. Convert the file to jpg and compress it
            const convertedFile: Sharp = sharp(Buffer.from(file, 'base64')).jpeg({mozjpeg: true, quality: 100});
            const fileData: Buffer = await convertedFile.toBuffer();
            const fileHash: string = MD5(fileData.toString('base64')).toString();

            // 2. Store file's metadata in DB and retrieve file ID and name if not already exist
            const fileId: number = this.fileRepository.create({fileHash: fileHash, fileId: null}).files[0];

            // 3. Store file with service
            const fileStructure = this.fileStructure(fileId);
            this.log.debug('Put file in storage service for Id', fileId);
            await this.storage.storeFile(fileStructure.name, fileData, fileStructure.mime);

            // 4. Create thumbnail using image-thumbnail library then store it
            this.log.debug('Create thumbnail for file and store it');
            const thumbnailData: Buffer = await convertedFile.resize(400).toBuffer();
            await this.storage.storeFile(fileStructure.thumb, thumbnailData, fileStructure.mime);

            // 5. Create OCR from file and store it asynchronously, no need to wait for request to end
            //const fileContent: RecognizeResult = await tesseractWorker.recognize(fileData);
            //this.fileRepository.putFileContent(fileId, fileContent.data.text);
            Tesseract.recognize(fileData, 'eng', {logger: m => this.log.debug(m)})
                .then((fileContent: RecognizeResult) =>
                    this.fileRepository.putFileContent(fileId, fileContent.data.text)
                );

            fileIds.push(fileId);
        }

        return fileIds;
    }

    /**
     * Remove file from DB and storage
     * @param fileId The file's id
     */
    public async deleteFromFileId(fileId: number): Promise<string> {
        const file = this.fileStructure(fileId);
        // remove file metadata from DB
        this.fileRepository.delete({fileId: file.id});

        // remove file data from storage
        this.log.debug('Remove file from storage service for %s', file.id);
        await this.storage.removeFile(file.name);
        await this.storage.removeFile(file.thumb);

        return 'File was successfully removed';
    }

    public async deleteFromCardId(cardId: number): Promise<void> {
        const fileIds: number[] = this.fileRepository.read({fileId: cardId}).files;

        await Promise.all(fileIds.map(async (fileId: number) => this.deleteFromFileId(fileId)));
    }

    private fileStructure(fileId: number): any {
        return {
            id: fileId,
            name: fileId + '.jpg',
            thumb: 'thumb-' + fileId + '.jpg',
            mime: 'image/jpeg'
        };
    }
}
