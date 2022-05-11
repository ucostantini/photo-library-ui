import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { BsModalRef } from "ngx-bootstrap/modal";

@Component({
  selector: 'app-picture-delete',
  templateUrl: './picture-delete.component.html',
  styleUrls: ['./picture-delete.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PictureDeleteComponent implements OnInit {

  pictureId;

  constructor(public bsModalRef: BsModalRef) {
  }

  ngOnInit() {
  }

}
