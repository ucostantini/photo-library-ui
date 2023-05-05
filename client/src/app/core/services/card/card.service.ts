import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Card, CardResult, OperationResponse, Pagination, Sorting } from '../../models/card';

const baseURL = 'http://localhost:3034/cards';

/**
 * Provides CRUD methods for card related operations
 */
@Injectable({
  providedIn: 'root'
})
export class CardService {

  /**
   * Used by {@link NavMenuComponent} to pass card result list ("emit" action) to {@link CardListComponent} ("subscribe")
   *
   * When a search action occurs, the result from the API is fetched by the first to be passed to the second
   * @private
   */
  private cards = new EventEmitter<CardResult>();

  /**
   * Used by {@link CardListComponent} to pass pagination update events ("emit" action) to {@link NavMenuComponent} ("subscribe")
   *
   * When the user access another page with the pagination component, the new page index is passed by the first to the second
   * @private
   */
  private pagination = new EventEmitter<Pagination>();

  constructor(private httpClient: HttpClient) {
  }

  /**
   * @param {Card} cardForm The provided form to create a new card
   * @returns OK if the card has been successfully created
   */
  create(cardForm: Card): Observable<OperationResponse> {
    return this.httpClient.post<OperationResponse>(baseURL, cardForm);
  }

  /**
   * @param {Card} cardForm The provided form to update the card
   * @returns OK if the card has been successfully updated
   */
  update(cardForm: Card): Observable<OperationResponse> {
    return this.httpClient.put<OperationResponse>(`${baseURL}/${cardForm.id}`, cardForm);
  }

  /**
   * @param {number} id The id of the card to be deleted
   * @returns OK if the card has been successfully deleted
   */
  delete(id: number): Observable<OperationResponse> {
    return this.httpClient.delete<OperationResponse>(`${baseURL}/${id}`);
  }

  /**
   * Fetches all the cards matching the provided search form
   * @param {Pagination} pagination The pagination to be used
   * @param {Sorting} sorting The sorting to be used
   * @param {Card} searchForm The search form provided to match the corresponding cards against
   * @returns The list of cards matching the search form, filtered with the pagination and sorting
   */
  fetch(pagination: Pagination, sorting: Sorting, searchForm: Card): Observable<HttpResponse<OperationResponse>> {
    const searchUrl = (searchForm ? `?_search=${JSON.stringify(searchForm)}&` : '?');
    const paginationUrl = {
      _page: pagination.pageIndex,
      _limit: pagination.pageSize,
      _sort: sorting.sort,
      _order: sorting.order
    };
    return this.httpClient.get<OperationResponse>(`${baseURL}${searchUrl}_pagination=${JSON.stringify(paginationUrl)}`, {observe: "response"});
  }

  /**
   * Getter for the card list emitter, more explanations above
   * @return The event emitter that one can emit a value to or subscribe from
   */
  getCardsEmitter(): EventEmitter<CardResult> {
    return this.cards;
  }

  /**
   * Getter for the pagination emitter, more explanations above
   * @return The event emitter that one can emit a value to or subscribe from
   */
  getPaginationEmitter(): EventEmitter<Pagination> {
    return this.pagination;
  }
}
