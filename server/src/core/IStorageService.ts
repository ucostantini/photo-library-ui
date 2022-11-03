export interface IStorageService {
  storeFile(fileName: string, fileData: Buffer, fileMimeType: string): Promise<any>;

  getFile(fileName: string): Promise<string>;

  removeFile(fileName: string): Promise<void>;
}
