import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Card, Paginate, Sorting } from '../../core/models/card';
import { CardService } from '../../core/services/card/card.service';
import { PageEvent } from '@angular/material/paginator';
import { mergeMap, Observable, tap } from 'rxjs';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss']
})
export class CardListComponent implements OnInit, OnChanges {

  cards: Observable<Card[]>;
  @Input() private cardFormData: Card;
  @Input() private sorting: Sorting;
  paginate: Paginate = null;
  isLoading: boolean;

  constructor(private cardService: CardService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.ngOnInit();
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.fetchCards(this.paginate ? this.paginate.pageIndex : 0);
  }

  onPageChange(event: PageEvent): void {
    this.paginate = event as Paginate;
    this.cards = this.cardService.fetch(this.paginate, this.sorting, this.cardFormData);
  }

  private fetchCards(noPage: number): void {
    this.cardService.fetchCount(noPage)
      .pipe(
        tap((pagination: Paginate) => {
          this.paginate = pagination;
          this.isLoading = false;
        }),
        mergeMap((pagination: Paginate) => this.cards = this.cardService.fetch(pagination, this.sorting, this.cardFormData))
      ).subscribe();
  }
}
