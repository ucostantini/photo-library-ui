import { Component, OnInit } from '@angular/core';
import { CardFormComponent } from '../modals/card-form/card-form.component';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CardService } from '../../core/services/card/card.service';
import { Card, Message, Pagination, Sorting } from '../../core/models/card';
import { NotificationService } from '../../core/services/notification/notification.service';
import { HttpResponse } from "@angular/common/http";

/**
 * Handles card and sort form data retrieval for API operations (creation and search of card)
 *
 * Communicates with {@link CardListComponent} for pagination events and card results displaying
 */
@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent implements OnInit {

  sortingForm: FormGroup;
  selectedSorting: Sorting;
  selectedPagination: Pagination;

  cardFormData: Card;

  constructor(public dialog: MatDialog, private cardService: CardService, private notifService: NotificationService) {
  }

  /**
   * Initializes sorting form with default sort and order values
   *
   * Fetch all cards in application with default values (Recent values, empty search form)
   */
  ngOnInit(): void {
    this.paginationReset();
    this.sortingForm = new FormGroup({
      sort: new FormControl(this.selectedSorting.sort),
      order: new FormControl(this.selectedSorting.order),
    });
    this.listenToPaginationChanges();
    this.fetchCards();
  }

  /**
   * Redirect to "home" page, i.e. with default values for search, sorting and pagination
   *
   * Avoids to subscribe to pagination events again
   */
  onAppReset(): void {
    this.paginationReset();
    this.sortingForm = new FormGroup({
      sort: new FormControl(this.selectedSorting.sort),
      order: new FormControl(this.selectedSorting.order),
    });
    this.fetchCards();
  }

  /**
   * Opens up card form component in modal dialog for card creation
   *
   * Calls the card creation operation if form is filled with data
   */
  onCardAdd(): void {
    this.dialog.open(CardFormComponent, {
      data: {card: null, isSearch: false},
    }).afterClosed()
      .subscribe((cardForm: Card) => {
        if (cardForm)
          this.cardService.create(cardForm).subscribe({
            next: (message: Message) => this.notifService.notifySuccess(message.message),
            error: (error: Error) => this.notifService.notifyError(error.message)
          });
      });
  }

  /**
   * Opens up card form component in modal dialog for card search
   *
   * Calls the card search operation and reset pagination
   */
  onCardSearch(): void {
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

  /**
   * Re-fetch cards from previous search with selected sorting option
   */
  onSortSubmit(): void {
    this.selectedSorting = (this.sortingForm.getRawValue() as Sorting);
    this.fetchCards();
  }

  /**
   * Calls service to fetch matching cards provided the card form data, the sorting and pagination options
   *
   * Then emits the retrieved values to card emitter for {@link CardListComponent} to display them
   */
  fetchCards(): void {
    this.cardService.fetch(this.selectedPagination, this.selectedSorting, this.cardFormData).subscribe({
      next: (response: HttpResponse<Card[]>) => {
        this.selectedPagination.pageLength = Number(response.headers.get("X-Total-Count"));
        this.cardService.getCardsEmitter().emit({cards: response.body, pagination: this.selectedPagination});
      },
      error: (error: Error) => this.notifService.notifyError(error.message)
    });
  }

  /**
   * Listen to page change events (when user go to a different page)
   *
   * Used to reset pagination with correct values and retrieved cards for this page
   */
  listenToPaginationChanges() {
    this.cardService.getPaginationEmitter().subscribe((pagination: Pagination) => {
      this.selectedPagination = pagination;
      this.fetchCards();
    });
  }

  /**
   * Resets sorting and pagination to default values
   * @private
   */
  private paginationReset(): void {
    this.selectedSorting = {sort: 'created', order: 'asc'};
    this.selectedPagination = {pageIndex: 0, pageSize: 10};
  }
}
