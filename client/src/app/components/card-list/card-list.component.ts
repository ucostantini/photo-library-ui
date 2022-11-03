import { Component, OnInit } from '@angular/core';
import { Card, CardResult, Pagination } from '../../core/models/card';
import { CardService } from '../../core/services/card/card.service';
import { PageEvent } from '@angular/material/paginator';

/**
 * Main section of the app. Displays card list and handles pagination for user
 *
 * Communicates with {@link NavMenuComponent} for receiving cards and report back pagination events,
 * and {@link CardDetailsComponent} for sending individual card information
 */
@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss']
})
export class CardListComponent implements OnInit {

  pagination: Pagination;
  cards: Card[];
  isLoading: boolean;

  constructor(private cardService: CardService) {
  }
// TODO use Masonry desandro
  ngOnInit(): void {
    this.isLoading = true;
    this.listenToCardListChanges();
  }

  /**
   * Emits pagination new value to {@link NavMenuComponent} to retrieve cards for this page
   * @param selectedPage Accessed page by user
   */
  onPageChange(selectedPage: PageEvent): void {
    this.cardService.getPaginationEmitter().emit(selectedPage as Pagination);
  }

  /**
   * Listen to card result events when new cards are fetched from server (new search, page change)
   *
   * Used to display updated cards in this page
   * @private
   */
  private listenToCardListChanges() {
    this.cardService.getCardsEmitter().subscribe((result: CardResult) => {
      this.cards = result.cards;
      this.pagination = result.pagination;
      this.isLoading = false;
    });
  }
}
