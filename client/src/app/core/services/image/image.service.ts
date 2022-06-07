import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private http: HttpClient) {
  }

  getThumbnailPath(fileId: number): string {
    return 'https://loremflickr.com/320/240?lock=' + fileId;
  }
}
