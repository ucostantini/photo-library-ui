import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from "@angular/common/http";
import { FilePickerAdapter, FilePreviewModel, UploadResponse, UploadStatus } from "ngx-awesome-uploader";
import { catchError, map, Observable, of } from "rxjs";

const baseURL = 'http://localhost:3000/files';

/**
 * Provides methods for file operations
 *
 * Used mainly by ngx-awesome-uploader library, implementing its interface {@link FilePickerAdapter}
 *
 * See [npm ngx-awesome-uploader]{@link https://www.npmjs.com/package/ngx-awesome-uploader}
 */
@Injectable({
  providedIn: 'root'
})
export class FileService extends FilePickerAdapter {

  constructor(private http: HttpClient) {
    super();
  }

  /**
   * @param {FilePreviewModel} fileItem The file information and data to be uploaded
   * @returns The progress status of the uploading process to report in a progress bar, or OK if uploaded
   */
  public uploadFile(fileItem: FilePreviewModel): Observable<UploadResponse> {

    const form = new FormData();
    form.append('file', fileItem.file);

    const req = new HttpRequest('POST', baseURL, form, {reportProgress: true});
    return this.http.request(req).pipe(
      map((res: HttpEvent<any>) => {
        if (res.type === HttpEventType.Response) {
          return {
            body: res.body,
            status: UploadStatus.UPLOADED
          };
        } else if (res.type === HttpEventType.UploadProgress) {
          /** Compute and show the % done: */
          const uploadProgress = +Math.round((100 * res.loaded) / res.total);
          return {
            status: UploadStatus.IN_PROGRESS,
            progress: uploadProgress
          };
        }
      }),
      catchError(err => {
        console.log(err);
        return of({status: UploadStatus.ERROR, body: err});
      })
    );
  }

  /**
   * @param fileItem The file to be deleted
   */
  public removeFile(fileItem: FilePreviewModel): Observable<any> {
    return this.http.delete(`${baseURL}/${fileItem.uploadResponse.fileId}`);
  }

  /**
   * @ignore
   */
  public downloadFile(url: string): void {
    window.location.href = url;
  }

  /**
   * @param fileName The file's name to retrieve the thumbnail from
   * @returns The thumbnail's URL
   */
  public getThumbnailUrl(fileName: string): Observable<string> {
    return this.http.get(`${baseURL}/${fileName}`, {responseType: 'text'});
  }
}
