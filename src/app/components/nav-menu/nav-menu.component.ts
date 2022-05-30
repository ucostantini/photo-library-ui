import { Component } from '@angular/core';
import { CardFormComponent } from '../modals/card-form/card-form.component';
import { CardSearchComponent } from '../modals/card-search/card-search.component';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from "@angular/material/dialog";
import { CardService } from "../../core/services/card/card.service";
import { Card } from "../../core/models/card";

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent {
  options: FormGroup;
  sortByControl = new FormControl('date');
  orderByControl = new FormControl('asc');

  constructor(public fb: FormBuilder, public dialog: MatDialog, private cardService: CardService) {
    this.options = fb.group({
      sortBy: this.sortByControl,
      orderBy: this.orderByControl,
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
    // TODO add support for sort
  }
}
