import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { map, Observable, startWith } from "rxjs";
import { MatChipInputEvent } from "@angular/material/chips";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { FormControl } from "@angular/forms";
import { TagService } from "../../core/services/tag/tag.service";
import { TagResult } from "../../core/models/card";
import { HttpErrorResponse } from "@angular/common/http";
import { NotificationService } from "../../core/services/notification/notification.service";

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent {

  @Output() addTag = new EventEmitter<string>();
  @Output() removeTag = new EventEmitter<number>();

  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagCtrl = new FormControl('');
  filteredTags: Observable<string[]>;
  tags: string[] = [];
  availableTags: string[] = [];

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;

  constructor(private tagService: TagService, private notifService: NotificationService) {
    this.tagService.fetch().subscribe({
      next: (tags: TagResult) => this.availableTags = tags.tags,
      error: (error: HttpErrorResponse) => this.notifService.notifyError(error.error.message)
    });
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => (tag ? this._filter(tag) : this.availableTags.slice())),
    );
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim().toLowerCase();

    // Add our fruit
    if (value && value.length > 3) {
      this.tags.push(value);
      this.addTag.emit(value);
    }

    // Clear the input value
    event.chipInput.clear();

    this.tagCtrl.setValue(null);

  }

  remove(fruit: string): void {
    const index = this.tags.indexOf(fruit);

    if (index >= 0) {
      this.tags.splice(index, 1);
      this.removeTag.emit(index);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const value: string = event.option.viewValue.toLowerCase();
    this.tags.push(value);
    this.addTag.emit(value);
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.availableTags.filter(tag => tag.toLowerCase().includes(filterValue));
  }

}
