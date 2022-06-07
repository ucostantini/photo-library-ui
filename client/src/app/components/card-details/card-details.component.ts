import { Component, Input, OnInit } from '@angular/core';
import { Card } from '../../core/models/card';
import { CardService } from '../../core/services/card/card.service';
import { CardDeleteComponent } from '../modals/card-delete/card-delete.component';
import { MatDialog } from '@angular/material/dialog';
import { CardFormComponent } from '../modals/card-form/card-form.component';
import { NotificationService } from '../../core/services/notification/notification.service';
import { Image } from 'angular-responsive-carousel';
import { ImageService } from '../../core/services/image/image.service';

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
              private imageService: ImageService) {
  }

  ngOnInit(): void {
    this.card.files.forEach(fileId => this.images.push({path: this.imageService.getThumbnailPath(fileId)}));
  }

  onEdit(): void {
    this.dialog.open(CardFormComponent, {
      data: {card: this.card, isSearch: false},
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
          next: () => this.notifService.notifySuccess('deleted'),
          error: (error) => this.notifService.notifyError(JSON.stringify(error))
        });
      }
    });
  }
}