import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Card, CardFile, Status } from '../../../core/models/card';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileService } from '../../../core/services/file/file.service';
import { FilePickerComponent, FilePreviewModel } from 'ngx-awesome-uploader';

@Component({
  selector: 'app-card-form',
  templateUrl: './card-form.component.html',
  styleUrls: ['./card-form.component.scss']
})
export class CardFormComponent implements OnInit {

  @ViewChild(FilePickerComponent) viewChild: FilePickerComponent;
  form: FormGroup;
  status: Status;
  private files: CardFile[] = [];

  constructor(public fileService: FileService, private dialogRef: MatDialogRef<CardFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { card: Card, isSearch: boolean }) {
  }

  ngOnInit(): void {
    const inputCard = this.data.card;
    const isSearch = this.data.isSearch;
    this.status = isSearch ? 'Search' : (inputCard ? 'Edit' : 'Create');

    this.form = new FormGroup({
      title: new FormControl(inputCard ? inputCard.title : '', !isSearch ? [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(80)] : []
      ),
      files: new FormArray(
        [], !isSearch ? Validators.minLength(1) : []
      ),
      // TODO use chips and dropdown autocomplete for tags
      tags: new FormControl(inputCard ? inputCard.tags : '', !isSearch ? Validators.required : []),
      website: new FormControl(inputCard ? inputCard.website : '', !isSearch ? [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30)] : []
      ),
      username: new FormControl(inputCard ? inputCard.username : '', !isSearch ? [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20)] : []
      )
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formData = (this.form.getRawValue() as Card);
      let card = this.data.card ? {...formData, cardId: this.data.card.cardId} : formData;
      this.dialogRef.close(card);
    }
  }

  onFileUploaded($event: FilePreviewModel): void {
    this.files.push({fileId: $event.uploadResponse as number});
    (this.form.get('files') as FormArray).push(new FormGroup({fileId: new FormControl($event.uploadResponse as number)}));
  }

  onFileRemoved($event: FilePreviewModel): void {
    // TODO delete file independently does not work
    this.files = this.files.filter((file: CardFile) => file.fileId !== $event.uploadResponse.fileId);
    const formArray = (this.form.get('files') as FormArray);
    formArray.removeAt(formArray.controls.findIndex((item: AbstractControl) => (item.value as string) === $event.uploadResponse.fileId));
  }

}
