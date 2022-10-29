import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

/**
 * Card deletion modal dialog
 */
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

  /**
   * Closes form dialog
   */
  onDeletionCancel(): void {
    this.dialogRef.close(null);
  }
}
