import { Component, OnInit } from '@angular/core';
import { Paginate, Picture } from "../../core/models/picture";
import { PictureService } from "../../core/services/picture/picture.service";

@Component({
  selector: 'app-picture-list',
  templateUrl: './picture-list.component.html',
  styleUrls: ['./picture-list.component.css']
})
export class PictureListComponent implements OnInit {

  pictures: Picture[] = [];
  paginate: Paginate = null;
  isLoading: boolean;

  constructor(private pictureService: PictureService) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.readPictures();
  }

  readPictures(): void {
    this.pictureService.readAll().subscribe(response => {
        console.log(response);
        this.pictures = response.pictures;
        this.paginate = response.paginate;
        this.isLoading = false;
      },
      error => {
        console.error(error);
      });
  }

  onPageChange(event: number): void {
    this.paginate.page = event;
  }

}
