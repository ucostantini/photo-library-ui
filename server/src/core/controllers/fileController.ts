import { FileModel } from "../models/fileModel";
import imageFunction from "image-thumbnail";
import { UploadedFile } from "express-fileupload";
import { log, storage } from '../../app';
import { CardFile } from "../../types/card";

/**
 * Controller of CRUD operations related to files
 * Performs requests to DB and storage
 */
export class FileController {

    /**
     * Provided the name of the requested file, return a temporary URL to said file
     * @param fileName name of the file to be retrieved, e.g. : 1975_Ford_Thunderbird_2D.jpg
     * @return an URL leading to the requested file
     */
    public async get(fileName: string): Promise<string> {
        log.debug('Get object from storage service for %s', fileName);
        return storage.getFile(fileName);
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
                const fileExtension = file.name.split('.').pop();
                const fileDB: CardFile = await new FileModel(null, []).create(fileExtension);

                // 2. Store file with service
                log.debug('Put file in storage service for %s', file.name);
                file.name = fileDB.fileName;
                await storage.storeFile(file);

                // 3. Create thumbnail using image-thumbnail library then store it
                log.debug('Create thumbnail for file and store it');
                file.data = await imageFunction(file.data, {responseType: 'buffer', percentage: 40});
                file.name = 'thumb-' + file.name;
                await storage.storeFile(file);

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
                    await storage.removeFile(file.fileName);
                    await storage.removeFile('thumb-' + file.fileName);
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

                await storage.removeFile(fileName);
                await storage.removeFile('thumb-' + fileName);

                resolve('File was successfully removed');
            } catch (err) {
                reject(err);
            }
        });
    }
}
