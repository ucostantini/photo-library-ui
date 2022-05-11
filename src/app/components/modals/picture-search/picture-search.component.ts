import { Component, OnInit } from '@angular/core';
import { BsModalRef } from "ngx-bootstrap/modal";

@Component({
  selector: 'app-picture-search',
  templateUrl: './picture-search.component.html',
  styleUrls: ['./picture-search.component.css']
})
export class PictureSearchComponent implements OnInit {

  constructor(public bsModalRef: BsModalRef) {
  }

  ngOnInit() {
  }

}
