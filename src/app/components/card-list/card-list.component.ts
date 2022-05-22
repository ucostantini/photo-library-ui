import { Component, OnInit } from '@angular/core';
import { Card, Paginate } from '../../core/models/card';
import { CardService } from '../../core/services/card/card.service';
import { PageEvent } from '@angular/material/paginator';
import { Observable } from "rxjs";

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss']
})
export class CardListComponent implements OnInit {

  cards: Observable<Card[]>;
  paginate: Paginate = null;
  isLoading: boolean;

  constructor(private cardService: CardService) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    const defaultPage = <Paginate>{
      pageIndex: 0,
      pageSize: 4,
      length: 6
    }
    this.fetchCount(defaultPage);
    this.cards = this.cardService.fetch(defaultPage);
  }

  onPageChange(event: PageEvent): void {
    this.fetchCards(event as Paginate);
  }

  fetchCards(page: Paginate): void {
    this.cards = this.cardService.fetch(page);

    /*
    .subscribe(response => {
        console.log(response);
        this.cards = response;
        this.isLoading = false;
      },
      error => {
        console.error(error);
      });
     */
  }

  fetchCount(page: Paginate): void {
    this.cardService.fetchCount(page).subscribe(response => {
        console.log(response);
        this.paginate = response;
        this.isLoading = false;
      },
      error => {
        console.error(error);
      });
  }

}
