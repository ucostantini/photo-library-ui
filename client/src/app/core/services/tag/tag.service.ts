import { Injectable } from '@angular/core';
import { TagResult } from "../../models/card";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";

const baseURL = 'http://localhost:3034/tags';

@Injectable({
  providedIn: 'root'
})
export class TagService {

  constructor(private httpClient: HttpClient) {
  }

  fetch(): Observable<TagResult> {
    return this.httpClient.get<TagResult>(baseURL);
  }
}
