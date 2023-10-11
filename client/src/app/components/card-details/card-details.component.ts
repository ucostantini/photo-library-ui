import { Component, Input, OnInit } from '@angular/core';
import { Card, FileURL, OperationResponse } from '../../core/models/card';
import { CardService } from '../../core/services/card/card.service';
import { CardDeleteComponent } from '../modals/card-delete/card-delete.component';
import { MatDialog } from '@angular/material/dialog';
import { CardFormComponent } from '../modals/card-form/card-form.component';
import { NotificationService } from '../../core/services/notification/notification.service';
import { IAlbum, Lightbox, LIGHTBOX_EVENT, LightboxConfig, LightboxEvent } from "ngx-lightbox";
import { CarouselComponent, Image } from "angular-responsive-carousel";
import { HttpErrorResponse } from "@angular/common/http";
import { concatMap, filter, Subscription, throwIfEmpty } from "rxjs";

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

  lightboxFiles: IAlbum[] = [];

  private lightboxSubscription: Subscription;

  constructor(public dialog: MatDialog,
              private cardService: CardService,
              private notifService: NotificationService,
              private lightbox: Lightbox,
              private lightboxConfig: LightboxConfig,
              private lightboxEvent: LightboxEvent,
              private carousel: CarouselComponent) {
  }

  /**
   * Retrieve URLs of card's files for angular-responsive-carousel library and lightbox
   */
  ngOnInit(): void {
    this.lightboxConfig.containerElementResolver = (doc: Document) => doc.getElementById("list");
    this.lightboxConfig.showZoom = true;
    this.lightboxConfig.showDownloadButton = true;
    this.lightboxConfig.showImageNumberLabel = true;

    // TODO disable scrolling does not work, lightbox background shade does not fill page entirely
    this.lightboxConfig.disableScrolling = true;

    this.carousel.initCarousel();

    this.card.files.forEach((file: FileURL) => {
      this.thumbnails.push({path: file.thumbnailURL});
      this.lightboxFiles.push({
        src: file.fileURL,
        thumb: file.thumbnailURL,
        caption: this.card.title,
        downloadUrl: file.fileURL
      });
    });
    this.card.tags = JSON.parse(this.card.tags as unknown as string);
  }

  onImageView() {
    if (this.view) {
      this.lightbox.open(this.lightboxFiles, Number(this.carousel.counter.charAt(0)) - 1);
      this.lightboxSubscription = this.lightboxEvent.lightboxEvent$
        .subscribe(event => this.onReceivedEvent(event));
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
          next: (response: OperationResponse) => this.notifService.notifySuccess(response.message),
          error: (response: HttpErrorResponse) => this.notifService.notifyError((response.error as OperationResponse).message)
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
    }).afterClosed().pipe(
      filter((card: Card) => card !== null && card !== undefined),
      throwIfEmpty(),
      concatMap((card: Card) => this.cardService.delete(card.id))
    ).subscribe({
      next: (response: OperationResponse) => this.notifService.notifySuccess(response.message),
      error: (response: HttpErrorResponse) => this.notifService.notifyError((response.error as OperationResponse).message)
    });
  }

  private onReceivedEvent(event: any): void {
    // remember to unsubscribe the event when lightbox is closed
    if (event.id === LIGHTBOX_EVENT.CLOSE) {
      this.view = false;
      this.lightboxSubscription.unsubscribe();
    }
  }
}
