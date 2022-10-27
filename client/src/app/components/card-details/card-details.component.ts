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

@Component({
  selector: 'app-card-details',
  templateUrl: './card-details.component.html',
  styleUrls: ['./card-details.component.scss']
})
export class CardDetailsComponent implements OnInit {
  @Input() card: Card;
  images: Image[] = [];

  constructor(public dialog: MatDialog,
              private cardService: CardService,
              private notifService: NotificationService,
              private fileService: FileService,
              private lightbox: Lightbox) {
  }

  ngOnInit(): void {
    // @ts-ignore
    JSON.parse(this.card.files).forEach(file =>
      this.fileService.getThumbnailUrl(file.fileName)
        .subscribe((thumbnailUrl: string) =>
          this.images.push({path: thumbnailUrl})
        )
    );
  }

  onEdit(): void {
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

  onDelete(): void {
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
