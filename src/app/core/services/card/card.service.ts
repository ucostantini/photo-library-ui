import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Card, Paginate, Sorting } from "../../models/card";

const baseURL = 'http://localhost:3000/cards';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  private sorting = new EventEmitter<Sorting>();

  constructor(private httpClient: HttpClient) {
  }

  readAll(): Observable<{ cards: Card[], paginate: Paginate }> {
    return this.httpClient.get<{ cards: Card[], paginate: Paginate }>(baseURL + 's');
  }

  read(id: number): Observable<Card> {
    return this.httpClient.get<Card>(`${baseURL}/${id}`);
  }

  create(card: Card): Observable<Object> {
    return this.httpClient.post(baseURL, card);
  }

  update(card: Card): Observable<Card> {
    return this.httpClient.put<Card>(`${baseURL}/${card.cardId}`, card);
  }

  delete(id: number): Observable<Object> {
    return this.httpClient.delete(`${baseURL}/${id}`);
  }

  search(terms: Card): Observable<any> {
    if (null === terms)
      return this.readAll();
    else
      return this.httpClient.get(`${baseURL}?body=${new URLSearchParams(JSON.stringify(terms)).toString()}`);
  }

  fetchCount(page: Paginate): Observable<Paginate> {
    return this.httpClient.get<Paginate>(`${baseURL}Count${page.pageIndex}`);
  }

  fetch(page: Paginate, sort?: Sorting): Observable<Card[]> {
    const sortUrl = (sort ? `&_sort=${sort.sort}&_order=${sort.order}` : '');
    return this.httpClient.get<Card[]>(`${baseURL}?_page=${page.pageIndex + 1}&_limit=${page.pageSize}${sortUrl}`);
  }

  getSortingEmitter(): EventEmitter<Sorting> {
    return this.sorting;
  }
}
