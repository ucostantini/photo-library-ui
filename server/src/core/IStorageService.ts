export interface IStorageService {
  storeFile(name: string, data: Buffer, mimeType: string): Promise<any>;

  getFile(name: string): Promise<string>;

  removeFile(name: string): Promise<void>;
}
