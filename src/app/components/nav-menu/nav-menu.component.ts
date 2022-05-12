import { Component } from '@angular/core';
import { PictureCreateComponent } from '../modals/picture-create/picture-create.component';
import { PictureSearchComponent } from '../modals/picture-search/picture-search.component';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {
  options: FormGroup;
  sortByControl = new FormControl('date');
  orderByControl = new FormControl('asc');

  constructor(fb: FormBuilder) {
    this.options = fb.group({
      sortBy: this.sortByControl,
      orderBy: this.orderByControl,
    });
  }

  onAdd() {

  }

  onSearch() {

  }
}
