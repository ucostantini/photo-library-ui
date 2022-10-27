import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Card, CardResult, Message, Pagination, Sorting } from '../../models/card';

const baseURL = 'http://localhost:3000/cards';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  private cards = new EventEmitter<CardResult>();
  private pagination = new EventEmitter<Pagination>();

  constructor(private httpClient: HttpClient) {
  }

  create(card: Card): Observable<Message> {
    return this.httpClient.post<Message>(baseURL, card);
  }

  update(card: Card): Observable<Message> {
    return this.httpClient.put<Message>(`${baseURL}/${card.cardId}`, card);
  }

  delete(id: number): Observable<Message> {
    return this.httpClient.delete<Message>(`${baseURL}/${id}`);
  }

  fetch(page: Pagination, sort: Sorting, search: Card): Observable<HttpResponse<Card[]>> {
    const searchUrl = (search ? `?_search=${JSON.stringify(search)}&` : '?');
    const paginationUrl = {_page: page.pageIndex, _limit: page.pageSize, _sort: sort.sort, _order: sort.order};
    return this.httpClient.get<Card[]>(`${baseURL}${searchUrl}_pagination=${JSON.stringify(paginationUrl)}`, {observe: "response"});
  }

  getCardsEmitter(): EventEmitter<CardResult> {
    return this.cards;
  }

  getPaginationEmitter(): EventEmitter<Pagination> {
    return this.pagination;
  }
}
