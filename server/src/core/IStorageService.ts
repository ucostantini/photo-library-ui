export interface IStorageService {
    storeFile(file: UploadedFile): Promise<any>;
    getFile(fileName: string): Promise<string>;
    removeFile(fileName: string): Promise<void>;
}
