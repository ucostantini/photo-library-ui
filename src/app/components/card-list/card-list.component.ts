import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Card, Pagination, Sorting } from '../../core/models/card';
import { CardService } from '../../core/services/card/card.service';
import { PageEvent } from '@angular/material/paginator';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss']
})
export class CardListComponent implements OnInit, OnChanges {

  @Input() private cardFormData: Card;
  @Input() private sorting: Sorting;
  @Input() pagination: Pagination;
  cards: Observable<Card[]>;
  isLoading: boolean;

  constructor(private cardService: CardService) {
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.ngOnInit();
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.fetchCards();
  }

  onPageChange(event: PageEvent): void {
    this.pagination = event as Pagination;
    this.cards = this.cardService.fetch(this.pagination, this.sorting, this.cardFormData);
  }

  private fetchCards(): void {
    this.isLoading = false;
    this.cards = this.cardService.fetch(this.pagination, this.sorting, this.cardFormData);
  }
}
