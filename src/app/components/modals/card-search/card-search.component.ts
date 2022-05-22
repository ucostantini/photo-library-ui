import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Card } from "../../../core/models/card";

@Component({
  selector: 'app-card-search',
  templateUrl: './card-search.component.html',
  styleUrls: ['./card-search.component.scss']
})
export class CardSearchComponent implements OnInit {
  form: FormGroup;

  constructor(public fb: FormBuilder, public dialogRef: MatDialogRef<CardSearchComponent>,
              @Inject(MAT_DIALOG_DATA) public card: Card) {
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
