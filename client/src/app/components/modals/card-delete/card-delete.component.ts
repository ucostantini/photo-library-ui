import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-card-delete',
  templateUrl: './card-delete.component.html'
})
export class CardDeleteComponent {

  constructor(
    public dialogRef: MatDialogRef<CardDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public cardId: number
  ) {
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
