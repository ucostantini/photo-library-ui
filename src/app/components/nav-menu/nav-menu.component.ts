import { Component } from '@angular/core';
import { PictureCreateComponent } from '../modals/picture-create/picture-create.component';
import { PictureSearchComponent } from '../modals/picture-search/picture-search.component';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {
  options: FormGroup;
  sortByControl = new FormControl('date');
  orderByControl = new FormControl('asc');

  constructor(public fb: FormBuilder, public dialog: MatDialog) {
    this.options = fb.group({
      sortBy: this.sortByControl,
      orderBy: this.orderByControl,
    });
  }

  onAdd() {
    const dialogRef = this.dialog.open(PictureCreateComponent, {
      data: {picture: null},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);
    });
  }

  onSearch() {
    const dialogRef = this.dialog.open(PictureSearchComponent, {
      data: {picture: null}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);
    });
  }
}
