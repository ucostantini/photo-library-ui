import { Component, OnInit } from '@angular/core';
import { Card, Paginate, Sorting } from '../../core/models/card';
import { CardService } from '../../core/services/card/card.service';
import { PageEvent } from '@angular/material/paginator';
import { Observable } from "rxjs";

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss']
})
export class CardListComponent implements OnInit {

  private sorting: Sorting = {sort: "cardId", order: "asc"};
  cards: Observable<Card[]>;
  paginate: Paginate = {
    pageIndex: 0,
    pageSize: 10,
    length: 10000
  };
  isLoading: boolean;

  constructor(private cardService: CardService) {
  }

  ngOnInit(): void {
    this.setSorting();
    this.isLoading = true;
    this.fetchCount(this.paginate);
    this.fetchCards(this.paginate);
  }

  onPageChange(event: PageEvent): void {
    this.paginate = event as Paginate;
    this.fetchCards(this.paginate);
  }

  fetchCards(page: Paginate): void {
    this.paginate = page;
    this.cards = this.cardService.fetch(this.paginate, this.sorting);
  }

  fetchCount(page: Paginate): void {
    this.paginate = page;
    // TODO fix subscribe
    this.cardService.fetchCount(this.paginate).subscribe(response => {
        this.paginate = response;
        this.isLoading = false;
      },
      error => {
        console.error(error);
      });
  }

  private setSorting(): void {
    this.cardService.getSortingEmitter().subscribe((val: Sorting) => {
      this.sorting = val;
      this.cards = this.cardService.fetch(this.paginate, this.sorting);
    });
  }

}
