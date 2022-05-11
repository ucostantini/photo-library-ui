import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Paginate, Picture } from "../../models/picture";

const baseURL = 'http://localhost:3000/picture';

@Injectable({
  providedIn: 'root'
})
export class PictureService {

  constructor(private httpClient: HttpClient) {
  }

  readAll(): Observable<{ pictures: Picture[], paginate: Paginate }> {
    return this.httpClient.get<{ pictures: Picture[], paginate: Paginate }>(baseURL + "s");
  }

  read(id): Observable<Picture> {
    return this.httpClient.get<Picture>(`${baseURL}/${id}`);
  }

  create(data): Observable<any> {
    return this.httpClient.post(baseURL, data);
  }

  update(id, data): Observable<any> {
    return this.httpClient.put(`${baseURL}/${id}`, data);
  }

  delete(id): Observable<any> {
    return this.httpClient.delete(`${baseURL}/${id}`);
  }

  deleteAll(): Observable<any> {
    return this.httpClient.delete(baseURL);
  }

  searchByName(name): Observable<any> {
    return this.httpClient.get(`${baseURL}?name=${name}`);
  }

}
