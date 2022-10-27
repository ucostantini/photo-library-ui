import { Component, OnInit } from '@angular/core';
import { CardFormComponent } from '../modals/card-form/card-form.component';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CardService } from '../../core/services/card/card.service';
import { Card, Message, Pagination, Sorting } from '../../core/models/card';
import { NotificationService } from '../../core/services/notification/notification.service';
import { HttpResponse } from "@angular/common/http";

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent implements OnInit {
  form: FormGroup;
  cardFormData: Card;
  sorting: Sorting;
  pagination: Pagination;

  constructor(public dialog: MatDialog, private cardService: CardService, private notifService: NotificationService) {
    this.form = new FormGroup({
      sort: new FormControl('cardId'),
      order: new FormControl('asc'),
    });
  }

  ngOnInit(): void {
    this.cardFormData = null;
    this.paginationReset();
    this.listenToPaginationChanges();
    this.fetchCards();
  }

  onAdd(): void {
    this.dialog.open(CardFormComponent, {
      data: {card: null, isSearch: false},
    }).afterClosed()
      .subscribe((card: Card) => {
        if (card) {
          this.cardService.create(card).subscribe({
            next: (message: Message) => this.notifService.notifySuccess(message.message),
            error: (error: Error) => this.notifService.notifyError(error.message)
          });
        }
      });
  }

  onReset(): void {
    this.ngOnInit();
  }

  onSearch(): void {
    this.dialog.open(CardFormComponent, {
      data: {card: this.cardFormData, isSearch: true},
    }).afterClosed().subscribe({
      next: (card: Card) => {
        this.cardFormData = card;
        this.paginationReset();
        this.fetchCards();
      },
      error: (error: Error) => this.notifService.notifyError(error.message)
    });
  }

  onSortSubmit(): void {
    this.sorting = (this.form.getRawValue() as Sorting);
    this.fetchCards();
  }

  fetchCards(): void {
    this.cardService.fetch(this.pagination, this.sorting, this.cardFormData).subscribe({
      next: (response: HttpResponse<Card[]>) => {
        this.pagination.length = Number(response.headers.get("X-Total-Count"));
        this.cardService.getCardsEmitter().emit({cards: response.body, pagination: this.pagination});
      },
      error: (error: Error) => this.notifService.notifyError(error.message)
    });
  }

  listenToPaginationChanges() {
    this.cardService.getPaginationEmitter().subscribe((pagination: Pagination) => {
      this.pagination = pagination;
      this.fetchCards();
    });
  }

  private paginationReset(): void {
    this.sorting = {sort: 'created', order: 'asc'};
    this.pagination = {pageIndex: 0, pageSize: 10};
  }
}
