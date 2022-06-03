import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Card, Pagination, Sorting } from '../../models/card';
import { DataUtils } from "../../../utils/data-utils";

const baseURL = 'http://localhost:3000/cards';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  constructor(private httpClient: HttpClient) {
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

  fetch(page: Pagination, sort: Sorting, search: Card): Observable<Card[]> {
    const searchUrl = (search ? `?${DataUtils.params(search).toString()}&` : '?');
    return this.httpClient.get<Card[]>(`${baseURL}${searchUrl}_page=${page.pageIndex + 1}&_limit=${page.pageSize}&_sort=${sort.sort}&_order=${sort.order}`);
  }
}
