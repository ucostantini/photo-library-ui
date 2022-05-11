import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Tag } from "../../models/picture";

const baseURL = 'http://localhost:8686/api/tags';

class TagClass implements Tag {
  constructor(public tagId: number, public name: string) {
  }
}

@Injectable({
  providedIn: 'root'
})
export class TagService {


  constructor(private httpClient: HttpClient) {
  }

  readAll(): Observable<Tag[]> {
    return this.httpClient.get<Tag[]>(baseURL);
  }

  searchByName(text: string): Observable<Tag[]> {
    return this.httpClient.get<Tag[]>(`${baseURL}/search?q=${text}`);
  }

}
