import { Component, Input, OnInit } from '@angular/core';
import { Card, CardFile } from '../../core/models/card';
import { CardService } from '../../core/services/card/card.service';
import { CardDeleteComponent } from '../modals/card-delete/card-delete.component';
import { MatDialog } from '@angular/material/dialog';
import { CardFormComponent } from '../modals/card-form/card-form.component';
import { NotificationService } from '../../core/services/notification/notification.service';
import { Image } from 'angular-responsive-carousel';
import { FileService } from "../../core/services/file/file.service";
import { mergeMap, tap } from "rxjs";

@Component({
  selector: 'app-card-details',
  templateUrl: './card-details.component.html',
  styleUrls: ['./card-details.component.scss']
})
export class CardDetailsComponent implements OnInit {

  @Input() card: Card;
  images: Image[] = [];
  thumbnails: File[] = []

  constructor(public dialog: MatDialog,
              private cardService: CardService,
              private notifService: NotificationService,
              private fileService: FileService) {
  }

  ngOnInit(): void {
    // @ts-ignore
    JSON.parse(this.card.files).forEach((file: CardFile) =>
      this.fileService.getThumbnailUrl(file.fileName).pipe(
        tap((fileUrl: string) => this.images.push({path: fileUrl})),
        mergeMap((fileUrl: string) => this.fileService.downloadFile(fileUrl))
      ).subscribe((thumbnail: Blob) =>
        this.thumbnails.push(new File([thumbnail], file.fileName))
      ));
  }

  onEdit(): void {
    this.dialog.open(CardFormComponent, {
      data: {card: this.card, isSearch: false, files: this.thumbnails},
    }).afterClosed().subscribe((card: Card) => {
      if (card) {
        this.cardService.update(card).subscribe({
          next: () => this.notifService.notifySuccess('updated'),
          error: (error) => this.notifService.notifyError(JSON.stringify(error))
        });
      }
    });
  }

  onDelete(): void {
    this.dialog.open(CardDeleteComponent, {
      data: this.card.cardId,
    }).afterClosed().subscribe((cardId: number) => {
      if (cardId) {
        this.cardService.delete(cardId).subscribe({
          next: () => this.notifService.notifySuccess('deleted'), // TODO notifications always pop up, even when error
          error: (error) => this.notifService.notifyError(JSON.stringify(error))
        });
      }
    });
  }
}
