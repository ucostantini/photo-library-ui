import { Component, Input, OnInit } from '@angular/core';
import { Card, Message } from '../../core/models/card';
import { CardService } from '../../core/services/card/card.service';
import { CardDeleteComponent } from '../modals/card-delete/card-delete.component';
import { MatDialog } from '@angular/material/dialog';
import { CardFormComponent } from '../modals/card-form/card-form.component';
import { NotificationService } from '../../core/services/notification/notification.service';
import { FileService } from "../../core/services/file/file.service";
import { Lightbox } from "ngx-lightbox";
import { Image } from "angular-responsive-carousel";

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

  constructor(public dialog: MatDialog,
              private cardService: CardService,
              private notifService: NotificationService,
              private fileService: FileService,
              private lightbox: Lightbox) {
  }

  /**
   * Retrieve thumbnail URLs of card's files for angular-responsive-carousel library
   */
  ngOnInit(): void {
    // @ts-ignore
    JSON.parse(this.card.files).forEach(file =>
      this.fileService.getThumbnailUrl(file.fileName)
        .subscribe((thumbnailUrl: string) =>
          this.thumbnails.push({path: thumbnailUrl})
        )
    );
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
          error: (error: Error) => this.notifService.notifyError(error.message)
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
      data: this.card.cardId,
    }).afterClosed().subscribe((cardId: number) => {
      if (cardId) {
        this.cardService.delete(cardId).subscribe({
          next: (message: Message) => this.notifService.notifySuccess(message.message),
          error: (error: Error) => this.notifService.notifyError(error.message)
        });
      }
    });
  }
}
