import { Component, Input, OnInit } from '@angular/core';
import { Card } from '../../core/models/card';
import { CardService } from '../../core/services/card/card.service';
import { CardDeleteComponent } from '../modals/card-delete/card-delete.component';
import { MatDialog } from '@angular/material/dialog';
import { CardCreateComponent } from "../modals/card-create/card-create.component";

@Component({
  selector: 'app-card-details',
  templateUrl: './card-details.component.html',
  styleUrls: ['./card-details.component.scss']
})
export class CardDetailsComponent implements OnInit {

  @Input() card: Card;

  constructor(private cardService: CardService, public dialog: MatDialog) {
  }

  ngOnInit(): void {
  }

  readCard(id: number) {
    this.cardService.read(id).subscribe(card => {
        console.log(card);
        this.card = card;
      },
      error => {
        console.error(error);
      });
  }


  onEdit() {
    const dialogRef = this.dialog.open(CardCreateComponent, {
      data: this.card,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  onDelete() {
    const dialogRef = this.dialog.open(CardDeleteComponent, {
      data: this.card.pictureId,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // TODO send request to delete card in DB
    });
  }
}
