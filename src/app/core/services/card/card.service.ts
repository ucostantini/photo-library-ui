import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Card, Paginate } from "../../models/card";

const baseURL = 'http://localhost:3000/picture';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  constructor(private httpClient: HttpClient) {
  }

  readAll(): Observable<{ cards: Card[], paginate: Paginate }> {
    return this.httpClient.get<{ cards: Card[], paginate: Paginate }>(baseURL + 's');
  }

  read(id): Observable<Card> {
    return this.httpClient.get<Card>(`${baseURL}/${id}`);
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

  fetchCount(page): Observable<Paginate> {
    return this.httpClient.get<Paginate>(`${baseURL}sCount${page.pageIndex}`);
  }

  fetch(page: Paginate): Observable<Card[]> {
    return this.httpClient.get<Card[]>(`${baseURL}s?_page=${page.pageIndex + 1}&_limit=${page.pageSize}`);
  }
}
