import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Card, Paginate, Sorting } from '../../models/card';

const baseURL = 'http://localhost:3000/cards';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  private sorting = new EventEmitter<Sorting>();

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

  fetchCount(noPage: number, search?: Card): Observable<Paginate> {
    const searchUrl = (search ? `&search=${new URLSearchParams(JSON.stringify(search)).toString()}` : '');
    return this.httpClient.get<Paginate>(`${baseURL}Count${noPage}${searchUrl}`);
  }

  fetch(page: Paginate, sort: Sorting, search?: Card): Observable<Card[]> {
    const searchUrl = (search ? `&search=${new URLSearchParams(JSON.stringify(search)).toString()}` : '');
    return this.httpClient.get<Card[]>(`${searchUrl}${baseURL}?_page=${page.pageIndex + 1}&_limit=${page.pageSize}&_sort=${sort.sort}&_order=${sort.order}`);
  }

  getSortingEmitter(): EventEmitter<Sorting> {
    return this.sorting;
  }
}
