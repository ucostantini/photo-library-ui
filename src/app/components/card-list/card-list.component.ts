import { Component, OnInit } from '@angular/core';
import { Card, Paginate, Sorting } from '../../core/models/card';
import { CardService } from '../../core/services/card/card.service';
import { PageEvent } from '@angular/material/paginator';
import { Observable } from 'rxjs';

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
    length: 10000 // TODO fix first call to fetch length, see todo below
  };
  isLoading: boolean;

  constructor(private cardService: CardService) {
  }

  ngOnInit(): void {
    this.setSorting();
    this.isLoading = true;
    this.fetchCount(this.paginate.pageIndex);
    this.fetchCards(this.paginate);
  }

  onPageChange(event: PageEvent): void {
    this.paginate = event as Paginate;
    this.fetchCards(this.paginate);
  }

  // TODO refont the whole logic for pagination, count, fetching

  fetchCards(page: Paginate): void {
    this.paginate = page;
    this.cards = this.cardService.fetch(this.paginate, this.sorting);
  }

  fetchCount(noPage: number): void {
    this.cardService.fetchCount(noPage).subscribe((response: Paginate) => {
      this.paginate = response;
      this.isLoading = false;
    });
  }

  private setSorting(): void {
    this.cardService.getSortingEmitter().subscribe((val: Sorting) => {
      this.sorting = val;
      this.cards = this.cardService.fetch(this.paginate, this.sorting);
    });
  }

}
