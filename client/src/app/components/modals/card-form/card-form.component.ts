import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Card, CardFile } from '../../../core/models/card';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileService } from '../../../core/services/file/file.service';
import { FilePickerComponent, FilePreviewModel } from 'ngx-awesome-uploader';

@Component({
  selector: 'app-card-form',
  templateUrl: './card-form.component.html',
  styleUrls: ['./card-form.component.scss']
})
export class CardFormComponent implements OnInit, AfterViewInit {

  @ViewChild(FilePickerComponent) viewChild: FilePickerComponent;
  form: FormGroup;
  status: string;
  private files: CardFile[] = [];

  constructor(public fileService: FileService, private dialogRef: MatDialogRef<CardFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { card: Card, isSearch: boolean, files: File[] }) {
  }

  ngAfterViewInit(): void {
    if (this.data) {
      this.data.files.forEach((file: File) => {
        this.viewChild.files.push({file: file, fileName: file.name} as FilePreviewModel)
      });
      console.log(this.viewChild.files);
      console.log(this.viewChild.changeRef);
      this.viewChild.changeRef.detectChanges();
    }
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
    console.log(inputCard)
    if (inputCard) {
      // @ts-ignore
      JSON.parse(inputCard.files).forEach((file: CardFile) =>
        (this.form.get('files') as FormArray).push(new FormGroup({fileId: new FormControl(file.fileId)}))
      );
    }

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
    this.files = this.files.filter((file: CardFile) => file.fileId !== $event.uploadResponse.fileId);
    const formArray = (this.form.get('files') as FormArray);
    formArray.removeAt(formArray.controls.findIndex((item: AbstractControl) => (item.value as string) === $event.uploadResponse.fileId));
  }

}
