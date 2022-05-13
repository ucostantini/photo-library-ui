import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Picture } from "../../../core/models/picture";

@Component({
  selector: 'app-picture-search',
  templateUrl: './picture-search.component.html',
  styleUrls: ['./picture-search.component.css']
})
export class PictureSearchComponent implements OnInit {
  form: FormGroup;

  constructor(public fb: FormBuilder, public dialogRef: MatDialogRef<PictureSearchComponent>,
              @Inject(MAT_DIALOG_DATA) public picture: Picture) {
    this.form = fb.group({
      title: new FormControl(),
      tags: new FormControl(),
      website: new FormControl(),
      author: new FormControl(),
    });
  }

  ngOnInit() {
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {

  }
}
