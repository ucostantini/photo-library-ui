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

  read(id: number): Observable<Card> {
    return this.httpClient.get<Card>(`${baseURL}/${id}`);
  }

  create(card: Card): Observable<Object> {
    // TODO implement file upload, not working as of now
    // localhost/upload route, with multipart form data, using ngx-awesome-uploader
    console.log("CREATE " + JSON.stringify(card));
    return this.httpClient.post(baseURL, card);
  }

  update(card: Card): Observable<Card> {
    console.log("UPDATE " + card);
    return this.httpClient.put<Card>(`${baseURL}/${card.cardId}`, card);
  }

  delete(id: number): Observable<Object> {
    console.log("DELETE " + id);
    return this.httpClient.delete(`${baseURL}/${id}`);
  }

  search(terms: Card): Observable<any> {
    if (null === terms)
      return this.readAll();
    else
      return this.httpClient.get(`${baseURL}?body=${new URLSearchParams(JSON.stringify(terms)).toString()}`);
  }

  fetchCount(page: Paginate): Observable<Paginate> {
    return this.httpClient.get<Paginate>(`${baseURL}sCount${page.pageIndex}`);
  }

  fetch(page: Paginate): Observable<Card[]> {
    return this.httpClient.get<Card[]>(`${baseURL}s?_page=${page.pageIndex + 1}&_limit=${page.pageSize}`);
  }
}
