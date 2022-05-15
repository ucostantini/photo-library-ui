import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-picture-delete',
  templateUrl: './picture-delete.component.html'
})
export class PictureDeleteComponent {

  constructor(
    public dialogRef: MatDialogRef<PictureDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public pictureId: number
  ) {
  }

  onCancel() {
    this.dialogRef.close();
  }
}
