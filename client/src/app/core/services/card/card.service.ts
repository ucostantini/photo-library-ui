import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Card, Pagination, Sorting } from '../../models/card';

const baseURL = 'http://localhost:3000/cards';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  constructor(private httpClient: HttpClient) {
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

  fetch(page: Pagination, sort: Sorting, search: Card): Observable<HttpResponse<Card[]>> {
    const searchUrl = (search ? `?_search=${JSON.stringify(search)}&` : '?');
    const paginationUrl = {_page: page.pageIndex, _limit: page.pageSize, _sort: sort.sort, _order: sort.order};
    return this.httpClient.get<Card[]>(`${baseURL}${searchUrl}_pagination=${JSON.stringify(paginationUrl)}`, {observe: "response"});
  }
}
