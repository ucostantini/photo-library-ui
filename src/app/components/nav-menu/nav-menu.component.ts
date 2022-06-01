import { Component } from '@angular/core';
import { CardFormComponent } from '../modals/card-form/card-form.component';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CardService } from '../../core/services/card/card.service';
import { Card, Sorting } from '../../core/models/card';
import { NotificationService } from "../../core/services/notification/notification.service";

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent {
  form: FormGroup;
  card: Card;
  sorting: Sorting;

  constructor(public dialog: MatDialog, private cardService: CardService, private notifService: NotificationService) {
    this.form = new FormGroup({
      sort: new FormControl('cardId'),
      order: new FormControl('asc'),
    });
  }

  onAdd(): void {
    this.dialog.open(CardFormComponent, {
      data: {card: null, isSearch: false},
    }).afterClosed().subscribe(() => this.notifService.notifySuccess("created"));
  }

  onSearch(): void {
    this.dialog.open(CardFormComponent, {
      data: {card: null, isSearch: true},
    }).afterClosed().subscribe((card: Card) => this.card = card);
  }

  onSortSubmit(): void {
    this.sorting = (this.form.getRawValue() as Sorting);
  }
}
