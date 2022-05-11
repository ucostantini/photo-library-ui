import { Component, Input, OnInit } from '@angular/core';
import { Picture } from "../../core/models/picture";
import { PictureService } from "../../core/services/picture/picture.service";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { PictureDeleteComponent } from "../modals/picture-delete/picture-delete.component";
import { PictureCreateComponent } from "../modals/picture-create/picture-create.component";

@Component({
  selector: 'app-picture-details',
  templateUrl: './picture-details.component.html',
  styleUrls: ['./picture-details.component.css']
})
export class PictureDetailsComponent implements OnInit {

  @Input() picture: Picture;
  modalRef: BsModalRef;

  constructor(private pictureService: PictureService, private modalService: BsModalService) {
  }

  ngOnInit(): void {
  }

  readPicture(id: number) {
    this.pictureService.read(id).subscribe(picture => {
        console.log(picture);
        this.picture = picture;
      },
      error => {
        console.error(error);
      });
  }


  onEdit() {
    this.modalRef = this.modalService.show(PictureCreateComponent, {
      class: 'modal-lg',
      keyboard: false,
      ignoreBackdropClick: true,
      focus: true,
      initialState: {
        isCreate: false
      }
    })
  }

  onDelete() {
    this.modalRef = this.modalService.show(PictureDeleteComponent, {
      initialState: {
        pictureId: this.picture.pictureId
      }
    })
  }
}
