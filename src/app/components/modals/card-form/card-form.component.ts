import { Component, Inject, OnInit } from '@angular/core';
import { Card, Tag } from '../../../core/models/card';
import { CardService } from '../../../core/services/card/card.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileService } from '../../../core/services/file/file.service';
import { FilePreviewModel } from 'ngx-awesome-uploader';

@Component({
  selector: 'app-card-form',
  templateUrl: './card-form.component.html',
  styleUrls: ['./card-form.component.scss']
})
export class CardFormComponent implements OnInit {

  form: FormGroup;
  status: string;
  private tags: Tag[] = [];
  private files: number[] = [];

  constructor(private cardService: CardService, public fileService: FileService, private dialogRef: MatDialogRef<CardFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { card: Card, isSearch: boolean }) {
  }

  ngOnInit(): void {
    this.status = this.data.isSearch ? 'Search' : (this.data.card ? 'Edit' : 'Create');

    this.form = new FormGroup({
      title: new FormControl(this.data.card ? this.data.card.title : '', this.data.isSearch ? [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30)] : []
      ),
      files: new FormControl(this.data.card ? this.data.card.files : this.files, this.data.isSearch ? Validators.minLength(1) : []),
      tags: new FormControl(this.data.card ? this.data.card.tags.join(',') : '', this.data.isSearch ? Validators.required : []),
      source: new FormGroup({
        website: new FormControl(this.data.card ? this.data.card.source.website : '', this.data.isSearch ? [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30)] : []
        ),
        author: new FormControl(this.data.card ? this.data.card.source.userName : '', this.data.isSearch ? [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20)] : []
        )
      })
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.data.isSearch && this.form.getRawValue() == {}) {
      this.data.card = null;
    } else {
      this.form.get('tags').setValue((this.form.get('tags').value as string).toLowerCase().split(','));

      if (this.data.card) {
        const cardId = this.data.card.cardId;
        this.data.card = (this.form.getRawValue() as Card);
        this.data.card.cardId = cardId;
      } else {
        this.data.card = (this.form.getRawValue() as Card);
      }
    }

    this.dialogRef.close(this.data.card);
  }

  onFileUploaded($event: FilePreviewModel) {
    this.files.push($event.uploadResponse.fileId);
  }

  onFileRemoved($event: FilePreviewModel) {
    this.files = this.files.filter(el => el !== $event.uploadResponse.fileId);
  }
}
