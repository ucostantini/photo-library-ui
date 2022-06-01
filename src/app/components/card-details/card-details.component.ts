import { Component, Input, OnInit } from '@angular/core';
import { Card } from '../../core/models/card';
import { CardService } from '../../core/services/card/card.service';
import { CardDeleteComponent } from '../modals/card-delete/card-delete.component';
import { MatDialog } from '@angular/material/dialog';
import { CardFormComponent } from '../modals/card-form/card-form.component';
import { catchError, mergeMap, of } from 'rxjs';
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

  constructor(private cardService: CardService, public dialog: MatDialog, private notifService: NotificationService, private imageService: ImageService) {
  }

  ngOnInit(): void {
    this.card.files.forEach(fileId => this.images.push({path: this.imageService.getThumbnailPath(fileId)}));
  }

  onEdit(): void {
    this.dialog.open(CardFormComponent, {
      data: {card: this.card, isSearch: false},
    })
      .afterClosed().pipe(
      mergeMap((card: Card) => this.cardService.update(card)),
      // TODO refactor error handling
      catchError((error: string) => {
        console.error(error);
        this.notifService.notifyError(error);
        return of(new Error(error));
      })
    )
      .subscribe(() => this.notifService.notifySuccess("updated"));
  }

  onDelete(): void {
    this.dialog.open(CardDeleteComponent, {
      data: this.card.cardId,
    })
      .afterClosed().pipe(
      mergeMap((cardId: number) => this.cardService.delete(cardId)),
      catchError((error: string) => {
        console.error(error);
        this.notifService.notifyError(error);
        return of(new Error(error));
      })
    )
      .subscribe(() => this.notifService.notifySuccess("deleted"));
  }
}
