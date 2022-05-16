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
    const defaultPage = <Paginate> {
      pageIndex: 0,
      pageSize: 4,
      length: 6
    }
    this.fetchCount(defaultPage);
    this.pictures = this.pictureService.fetch(defaultPage);
  }

  onPageChange(event: PageEvent): void {
    this.fetchPictures(event as Paginate);
  }

  fetchPictures(page: Paginate): void {
    this.pictures = this.pictureService.fetch(page);

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

  fetchCount(page: Paginate): void {
    this.pictureService.fetchCount(page).subscribe(response => {
        console.log(response);
        this.paginate = response;
        this.isLoading = false;
      },
      error => {
        console.error(error);
      });
  }

}
