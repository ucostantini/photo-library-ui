import { Component } from '@angular/core';
import { CardFormComponent } from '../modals/card-form/card-form.component';
import { CardSearchComponent } from '../modals/card-search/card-search.component';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from "@angular/material/dialog";
import { CardService } from "../../core/services/card/card.service";
import { Card, Sorting } from "../../core/models/card";

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent {
  form: FormGroup;

  constructor(public dialog: MatDialog, private cardService: CardService) {
    this.form = new FormGroup({
      sort: new FormControl('cardId'),
      order: new FormControl('asc'),
    });
  }

  onAdd() {
    const dialogRef = this.dialog.open(CardFormComponent, {
      data: null,
    });
    // TODO handle service response for add,search,delete (toaster ?)
    dialogRef.afterClosed().subscribe((card: Card) =>
      this.cardService.create(card).subscribe(val => console.log(val))
    );
  }

  onSearch() {
    const dialogRef = this.dialog.open(CardSearchComponent);

    dialogRef.afterClosed().subscribe((terms: Card) => {
      this.cardService.search(terms);
    });
  }

  onSortSubmit() {
    this.cardService.getSortingEmitter().emit(this.form.getRawValue() as Sorting);
  }
}
