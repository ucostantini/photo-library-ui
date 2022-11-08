import { Component, Input, OnInit } from '@angular/core';
import { Card, CardFile, Message } from '../../core/models/card';
import { CardService } from '../../core/services/card/card.service';
import { CardDeleteComponent } from '../modals/card-delete/card-delete.component';
import { MatDialog } from '@angular/material/dialog';
import { CardFormComponent } from '../modals/card-form/card-form.component';
import { NotificationService } from '../../core/services/notification/notification.service';
import { FileService } from "../../core/services/file/file.service";
import { IAlbum, Lightbox, LightboxConfig } from "ngx-lightbox";
import { Image } from "angular-responsive-carousel";
import { HttpErrorResponse } from "@angular/common/http";
import { forkJoin } from "rxjs";

/**
 * Displays an individual card's information
 */
@Component({
  selector: 'app-card-details',
  templateUrl: './card-details.component.html',
  styleUrls: ['./card-details.component.scss']
})
export class CardDetailsComponent implements OnInit {
  @Input() card: Card;
  thumbnails: Image[] = [];
  view: boolean = false;
  // TODO set to false when lightbox is closed, subscribe to lightbox events
  // TODO open image with index lightbox directly

  lightboxFiles: IAlbum[] = [];

  constructor(public dialog: MatDialog,
              private cardService: CardService,
              private notifService: NotificationService,
              private fileService: FileService,
              private lightbox: Lightbox,
              private lightboxConfig: LightboxConfig) {
    this.lightboxConfig.containerElementResolver = (doc: Document) => doc.getElementById("list");
    this.lightboxConfig.showZoom = true;
    this.lightboxConfig.showDownloadButton = true;
    this.lightboxConfig.showImageNumberLabel = true;

    // TODO disable scrolling does not work, lightbox background shade does not fill page entirely
    this.lightboxConfig.disableScrolling = true;
  }

  /**
   * Retrieve URLs of card's files for angular-responsive-carousel library and lightbox
   */
  ngOnInit(): void {
    // TODO find a way to avoid JSON parsing
    // @ts-ignore
    this.card.tags = JSON.parse(this.card.tags);
    // @ts-ignore
    JSON.parse(this.card.files).forEach(file =>
      forkJoin({
        thumbnailURL: this.fileService.getFileURL('thumb-' + file.fileName),
        fileURL: this.fileService.getFileURL(file.fileName)
      }).subscribe({
        next: (res: { thumbnailURL: string, fileURL: string }) => {
          this.thumbnails.push({path: res.thumbnailURL});
          this.lightboxFiles.push({
            src: res.fileURL,
            thumb: res.thumbnailURL,
            caption: this.card.title,
            downloadUrl: res.fileURL
          });
        },
        error: (error: HttpErrorResponse) => this.notifService.notifyError(error.error.message)
      })
    );
  }

  onImageView() {
    if (this.view) {
      this.lightbox.open(this.lightboxFiles);
    } else {
      this.lightbox.close();
    }
  }

  /**
   * Opens up card form component in modal dialog for card update
   *
   * Calls the card update operation if form is filled with data
   */
  onCardEdit(): void {
    this.dialog.open(CardFormComponent, {
      data: {card: this.card, isSearch: false},
    }).afterClosed().subscribe((card: Card) => {
      if (card) {
        this.cardService.update(card).subscribe({
          next: (message: Message) => this.notifService.notifySuccess(message.message),
          error: (error: HttpErrorResponse) => this.notifService.notifyError(error.error.message)
        });
      }
    });
  }

  /**
   * Opens up card delete component in modal dialog for card deletion
   *
   * Calls the card deletion operation if card id is provided
   */
  onCardDelete(): void {
    this.dialog.open(CardDeleteComponent, {
      data: this.card,
    }).afterClosed().subscribe((card: Card) => {
      if (card) {
        // TODO what if an error happen here ? Test errors everywhere in app to avoid crashes
        card.files.forEach((file: CardFile) => this.fileService.removeFileFromId(file.fileId));
        this.cardService.delete(card.cardId).subscribe({
          next: (message: Message) => this.notifService.notifySuccess(message.message),
          error: (error: HttpErrorResponse) => this.notifService.notifyError(error.error.message)
        });
      }
    });
  }
}
