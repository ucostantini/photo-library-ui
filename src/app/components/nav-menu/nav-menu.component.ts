import { Component } from '@angular/core';
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { PictureCreateComponent } from "../modals/picture-create/picture-create.component";
import { PictureSearchComponent } from "../modals/picture-search/picture-search.component";

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {
  isExpanded = false;
  modalRef: BsModalRef;

  constructor(private modalService: BsModalService) {
  }

  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }

  onAdd() {
    this.modalRef = this.modalService.show(PictureCreateComponent, {
      class: 'modal-lg',
      keyboard: false,
      ignoreBackdropClick: true,
      focus: true,
      initialState: {
        isCreate: true
      }
    })
  }

  onSearch() {
    this.modalRef = this.modalService.show(PictureSearchComponent, {
      class: 'modal-lg',
      keyboard: false,
      ignoreBackdropClick: true,
      focus: true
    })
  }
}
