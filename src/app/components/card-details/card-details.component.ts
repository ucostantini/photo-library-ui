import { Component, Input, OnInit } from '@angular/core';
import { Card } from '../../core/models/card';
import { CardService } from '../../core/services/card/card.service';
import { CardDeleteComponent } from '../modals/card-delete/card-delete.component';
import { MatDialog } from '@angular/material/dialog';
import { CardFormComponent } from '../modals/card-form/card-form.component';

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

  onEdit() {
    const dialogRef = this.dialog.open(CardFormComponent, {
      data: {card: this.card, isSearch: false},
    });

    dialogRef.afterClosed().subscribe(card =>
      this.cardService.update(card).subscribe(val => console.log(val))
    );
  }

  onDelete() {
    const dialogRef = this.dialog.open(CardDeleteComponent, {
      data: this.card.cardId,
    });

    dialogRef.afterClosed().subscribe((id: number) =>
      this.cardService.delete(id).subscribe(val => console.log(val))
    );
  }
}
