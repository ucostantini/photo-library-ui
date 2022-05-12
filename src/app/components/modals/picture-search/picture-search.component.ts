import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-picture-search',
  templateUrl: './picture-search.component.html',
  styleUrls: ['./picture-search.component.css']
})
export class PictureSearchComponent implements OnInit {
  options: FormGroup;
  titleControl = new FormControl();
  tagsControl = new FormControl();
  websiteControl = new FormControl();
  authorControl = new FormControl();

  constructor(fb: FormBuilder) {
    this.options = fb.group({
      title: this.titleControl,
      tags: this.tagsControl,
      website: this.websiteControl,
      author: this.authorControl
    });
  }

  ngOnInit() {
  }

}
