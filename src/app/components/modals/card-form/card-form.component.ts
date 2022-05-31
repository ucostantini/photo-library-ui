import { Component, Inject, OnInit } from '@angular/core';
import { Card, Tag } from '../../../core/models/card';
import { CardService } from '../../../core/services/card/card.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FileService } from "../../../core/services/file/file.service";
import { FilePreviewModel } from "ngx-awesome-uploader";

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
              @Inject(MAT_DIALOG_DATA) public card: Card) {
  }

  ngOnInit(): void {
    this.status = (this.card ? 'Edit' : 'Create');

    this.form = new FormGroup({
      title: new FormControl(this.card ? this.card.title : '', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30)]
      ),
      files: new FormControl(this.card ? this.card.files : this.files, Validators.minLength(1)),
      tags: new FormControl(this.card ? this.card.tags.join(',') : '', Validators.required),
      source: new FormGroup({
        website: new FormControl(this.card ? this.card.source.website : '', [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30)]
        ),
        author: new FormControl(this.card ? this.card.source.userName : '', [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20)]
        )
      })
    });
  }

  onCancel() {
    this.dialogRef.close()
  }

  onSubmit() {
    this.form.get('tags').setValue((this.form.get('tags').value as string).toLowerCase().split(','));

    if (this.card) {
      const cardId = this.card.cardId;
      this.card = (this.form.getRawValue() as Card);
      this.card.cardId = cardId;
    } else {
      this.card = (this.form.getRawValue() as Card);
    }
    this.dialogRef.close(this.card);
  }

  onFileUploaded($event: FilePreviewModel) {
    this.files.push($event.uploadResponse.fileId);
  }

  onFileRemoved($event: FilePreviewModel) {
    // TODO optimize this. change data structure from array to object
    this.files = this.files.filter(el => el !== $event.uploadResponse.fileId);
  }
}
