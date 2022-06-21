import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Card } from '../../../core/models/card';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
  private files: number[] = [];

  constructor(public fileService: FileService, private dialogRef: MatDialogRef<CardFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { card: Card, isSearch: boolean }) {
  }

  ngAfterViewInit(): void {
    /* if (this.data.card) {
         this.fileService.getThumbnails(this.data.card.cardId).pipe(
           mergeMap((urls: string[]) => )
           concatMap((url: string) => this.fileService.downloadFile(url))
         );
     }
     this.viewChild.pushFile();*/
  }

  ngOnInit(): void {
    const inputCard = this.data.card;
    const isSearch = this.data.isSearch;
    this.status = isSearch ? 'Search' : (inputCard ? 'Edit' : 'Create');

    this.form = new FormGroup({
      title: new FormControl(inputCard ? inputCard.title : '', !isSearch ? [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30)] : []
      ),
      files: new FormControl(inputCard ? inputCard.files : this.files, !isSearch ? Validators.minLength(1) : []),
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
    this.files.push($event.uploadResponse as number);
  }

  onFileRemoved($event: FilePreviewModel): void {
    this.files = this.files.filter((fileId: number) => fileId !== $event.uploadResponse.fileId);
  }
}
