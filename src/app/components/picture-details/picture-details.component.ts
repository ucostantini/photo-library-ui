import { Component, Input, OnInit } from '@angular/core';
import { Picture } from '../../core/models/picture';
import { PictureService } from '../../core/services/picture/picture.service';
import { PictureDeleteComponent } from '../modals/picture-delete/picture-delete.component';
import { PictureCreateComponent } from '../modals/picture-create/picture-create.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-picture-details',
  templateUrl: './picture-details.component.html',
  styleUrls: ['./picture-details.component.css']
})
export class PictureDetailsComponent implements OnInit {

  @Input() picture: Picture;

  constructor(private pictureService: PictureService, public dialog: MatDialog) {
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
  }

  onDelete() {
    const dialogRef = this.dialog.open(PictureDeleteComponent, {
      width: '250px',
      data: this.picture.pictureId,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // TODO send request to delete picture in DB
    });
  }
}
