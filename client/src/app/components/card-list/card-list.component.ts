import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Card, Pagination, Sorting } from '../../core/models/card';
import { CardService } from '../../core/services/card/card.service';
import { PageEvent } from '@angular/material/paginator';
import { HttpResponse } from "@angular/common/http";

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss']
})
export class CardListComponent implements OnInit, OnChanges {

  @Input() pagination: Pagination;
  cards: Card[];
  isLoading: boolean;
  @Input() private cardFormData: Card;
  @Input() private sorting: Sorting;

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
    this.fetchCards();
  }

  private fetchCards(): void {
    this.cardService.fetch(this.pagination, this.sorting, this.cardFormData)
      .subscribe((response: HttpResponse<Card[]>) => {
        this.cards = response.body;
        console.log(response.headers);
        this.pagination.length = Number(response.headers.get("X-Total-Count"));
      });
    this.isLoading = false;
  }
}
