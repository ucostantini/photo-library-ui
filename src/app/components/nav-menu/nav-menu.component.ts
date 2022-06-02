import { Component } from '@angular/core';
import { CardFormComponent } from '../modals/card-form/card-form.component';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CardService } from '../../core/services/card/card.service';
import { Card, Sorting } from '../../core/models/card';
import { NotificationService } from '../../core/services/notification/notification.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent {
  form: FormGroup;
  card: Card = null;
  sorting: Sorting = {sort: 'cardId', order: 'asc'};

  constructor(public dialog: MatDialog, private cardService: CardService, private notifService: NotificationService) {
    this.form = new FormGroup({
      sort: new FormControl('cardId'),
      order: new FormControl('asc'),
    });
  }

  onAdd(): void {
    this.dialog.open(CardFormComponent, {
      data: {card: null, isSearch: false},
    }).afterClosed()
      .subscribe({
        next: () => this.notifService.notifySuccess('created'),
        // TODO fix error formatting
        error: (error) => this.notifService.notifyError(JSON.stringify(error))
      });
  }

  onSearch(): void {
    this.dialog.open(CardFormComponent, {
      data: {card: null, isSearch: true},
    }).afterClosed()
      .subscribe({
        next: (card: Card) => this.card = card,
        error: error => this.notifService.notifyError(JSON.stringify(error))
      });
  }

  onSortSubmit(): void {
    this.sorting = (this.form.getRawValue() as Sorting);
  }
}
