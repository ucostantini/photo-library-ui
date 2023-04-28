import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Card, CardRequest, Status } from '../../../core/models/card';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileService } from '../../../core/services/file/file.service';
import { FilePickerComponent, FilePreviewModel } from 'ngx-awesome-uploader';

/**
 * Represents a card's form for upload, update or search
 *
 * Adding files is only available for card creation operation (nor updated or searched)
 *
 * The general principle is this : The user fills the form with data, and add some files.
 *
 * These files will be uploaded to backend, which will generate IDs for the client.
 *
 * These IDs will then be added to the form, before the user can submit the card form data.
 *
 * This file uploading process is handled by the [ngx-awesome-uploader]{@link FilePickerComponent} JS library.
 */
@Component({
  selector: 'app-card-form',
  templateUrl: './card-form.component.html',
  styleUrls: ['./card-form.component.scss']
})
export class CardFormComponent implements OnInit {

  /**
   * Used for some css fixes, see component's scss file
   */
  @ViewChild(FilePickerComponent) viewChild: FilePickerComponent;

  form: FormGroup;
  operation: Status;

  constructor(public fileService: FileService, private dialogRef: MatDialogRef<CardFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { card: Card, isSearch: boolean }, private fb: FormBuilder) {
  }

  /**
   * Initializes card form with default values and standard Angular form validators
   */
  ngOnInit(): void {
    const inputCard = this.data.card;
    const isSearch = this.data.isSearch;
    this.operation = isSearch ? 'Search' : (inputCard ? 'Edit' : 'Create');

    this.form = this.fb.group({
      title: [inputCard ? inputCard.title : '', [
        Validators.maxLength(80)]
      ],
      files: this.fb.array([], !isSearch ? [Validators.required, Validators.minLength(1)] : []),
      tags: this.fb.array([], !isSearch ? [Validators.required, Validators.minLength(1)] : []),
      website: [inputCard ? inputCard.website : '', !isSearch ? [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30)] : []
      ],
      username: [inputCard ? inputCard.username : '', !isSearch ? [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20)] : []
      ]
    });

    // pre-complete tags field in card form
    if (inputCard) {
      inputCard.tags.forEach((tag: string) => {
        (this.form.get('tags') as FormArray).push(new FormControl(tag, []));
      });
    }
  }

  /**
   * Closes the form dialog
   */
  onFormClose(): void {
    this.dialogRef.close(null);
  }

  /**
   * Closes the dialog with the provided form data for caller {@link NavMenuComponent}
   */
  onFormSubmit(): void {
    if (this.form.valid) {
      const formData = (this.form.getRawValue() as CardRequest);
      let card = this.data.card ? {...formData, cardId: this.data.card.cardId} : formData;
      this.dialogRef.close(card);
    }
  }

  /**
   * After upload of file, retrieve backend-generated file ID from response and add it in card form
   * @param $event Backend response containing the generated file ID
   */
  onFileAdded($event: FilePreviewModel): void {
    const reader = new FileReader();
    reader.readAsDataURL($event.file);
    reader.onloadend = () => (this.form.get('files') as FormArray).push(new FormControl((reader.result as string).split(',')[1]));
  }

  /**
   * After deletion of file, remove file from form data
   * @param $event Backend response containing the deleted file ID
   */
  onFileRemoved($event: FilePreviewModel): void { //TODO fix this
    const formArray = (this.form.get('files') as FormArray);
    formArray.removeAt(formArray.controls.findIndex((item: AbstractControl) =>
      (item.value as number) === $event.uploadResponse.fileId)
    );
  }

  addTag($event: string): void {
    (this.form.get('tags') as FormArray).push(new FormControl($event));
  }

  removeTag($event: number): void {
    (this.form.get('tags') as FormArray).removeAt($event);
  }
}
