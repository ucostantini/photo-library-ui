import { Component, Inject, OnInit } from '@angular/core';
import { Card, CardRequest, Status } from '../../../core/models/card';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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

  form: FormGroup;
  operation: Status;

  constructor(private dialogRef: MatDialogRef<CardFormComponent>,
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
      title: [inputCard?.title, [
        Validators.maxLength(80)]
      ],
      files: this.fb.array([], (!isSearch && !inputCard) ? [Validators.required, Validators.minLength(1)] : []),
      tags: this.fb.array([], !isSearch ? [Validators.required, Validators.minLength(1)] : []),
      website: [inputCard?.website, !isSearch ? [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30)] : []
      ],
      author: [inputCard?.author, !isSearch ? [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20)] : []
      ]
    });
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
      const rawValue: any = this.form.getRawValue();
      // prepare files
      rawValue.files = rawValue.files.map(file => file.content);
      const formData = (rawValue as CardRequest);
      let card = this.data.card ? {...formData, cardId: this.data.card.id} : formData;
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
    reader.onloadend = () =>
      (this.form.get('files') as FormArray)
        .push(new FormControl({name: $event.fileName, content: (reader.result as string).split(',')[1]}));
  }

  /**
   * After deletion of file, remove file from form data
   * @param $event Backend response containing the deleted file ID
   */
  onFileRemoved($event: FilePreviewModel): void {
    const formArray = (this.form.get('files') as FormArray);
    formArray.removeAt(formArray.controls.findIndex((item: AbstractControl) =>
      (item.value.name) === $event.fileName)
    );
  }

  addTag($event: string): void {
    (this.form.get('tags') as FormArray).push(new FormControl($event));
  }

  removeTag($event: number): void {
    (this.form.get('tags') as FormArray).removeAt($event);
  }

  /*
   Returns an array of invalid control/group names, or a zero-length array if
   no invalid controls/groups where found
*/
  public findInvalidControlsRecursive(formToInvestigate: FormGroup | FormArray): void {
    var invalidControls: string[] = [];
    let recursiveFunc = (form: FormGroup | FormArray) => {
      Object.keys(form.controls).forEach(field => {
        const control = form.get(field);
        if (control.invalid) invalidControls.push(field);
        if (control instanceof FormGroup) {
          recursiveFunc(control);
        } else if (control instanceof FormArray) {
          recursiveFunc(control);
        }
      });
    }
    recursiveFunc(formToInvestigate);
    console.error(invalidControls);
  }
}
