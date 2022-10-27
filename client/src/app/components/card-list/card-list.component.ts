import { Component, OnInit } from '@angular/core';
import { Card, CardResult, Pagination } from '../../core/models/card';
import { CardService } from '../../core/services/card/card.service';
import { PageEvent } from '@angular/material/paginator';

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

  ngOnInit(): void {
    this.isLoading = true;
    this.listenToCardListChanges();
  }

  onPageChange(event: PageEvent): void {
    this.cardService.getPaginationEmitter().emit(event as Pagination);
  }

  private listenToCardListChanges() {
    this.cardService.getCardsEmitter().subscribe((result: CardResult) => {
      this.cards = result.cards;
      this.pagination = result.pagination;
      this.isLoading = false;
    });
  }
}
