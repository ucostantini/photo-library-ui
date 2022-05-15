import { Component, OnInit } from '@angular/core';
import { Paginate, Picture } from '../../core/models/picture';
import { PictureService } from '../../core/services/picture/picture.service';
import { PageEvent } from '@angular/material/paginator';
import { Observable } from "rxjs";

@Component({
  selector: 'app-picture-list',
  templateUrl: './picture-list.component.html',
  styleUrls: ['./picture-list.component.css']
})
export class PictureListComponent implements OnInit {

  pictures: Observable<Picture[]>;
  paginate: Paginate = null;
  isLoading: boolean;

  constructor(private pictureService: PictureService) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.fetchCount(1, 4);
    this.pictures = this.pictureService.fetch(1, 4);
  }

  onPageChange(event: PageEvent): void {
    this.fetchPictures(event.pageIndex, event.pageSize);
  }

  fetchPictures(pageIndex: number, pageSize: number): void {
    this.pictures = this.pictureService.fetch(pageIndex, pageSize);

    /*
    .subscribe(response => {
        console.log(response);
        this.pictures = response;
        this.isLoading = false;
      },
      error => {
        console.error(error);
      });
     */
  }

  fetchCount(pageIndex: number, pageSize: number): void {
    this.pictureService.fetchCount(pageIndex, pageSize).subscribe(response => {
        console.log(response);
        this.paginate = response;
        this.isLoading = false;
      },
      error => {
        console.error(error);
      });
  }

}
