import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from "@angular/common/http";
import { FilePickerAdapter, FilePreviewModel, UploadResponse, UploadStatus } from "ngx-awesome-uploader";
import { catchError, map, Observable, of } from "rxjs";

const baseURL = 'http://localhost:3000/files';

@Injectable({
  providedIn: 'root'
})
export class FileService extends FilePickerAdapter {

  constructor(private http: HttpClient) {
    super();
  }

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

  public removeFile(fileItem: FilePreviewModel): Observable<any> {
    return this.http.delete(`${baseURL}/${fileItem.uploadResponse.fileId}`);
  }

  public downloadFile(url: string): Observable<Blob> {
    return this.http.get(url, {responseType: 'blob'});
  }

  getThumbnails(cardId: number): Observable<string[]> {
    return this.http.get<string[]>(`${baseURL}/${cardId}`);
  }
}
