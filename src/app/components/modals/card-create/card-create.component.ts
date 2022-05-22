import { Component, Inject, OnInit } from '@angular/core';
import { Card, Tag } from '../../../core/models/card';
import { CardService } from '../../../core/services/card/card.service';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { TagService } from '../../../core/services/tag/tag.service';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { NgxFileDropEntry } from "ngx-file-drop";

@Component({
  selector: 'app-card-create',
  templateUrl: './card-create.component.html',
  styleUrls: ['./card-create.component.scss']
})
export class CardCreateComponent implements OnInit {

  form: FormGroup;
  isCreate = true;
  submitted = false;
  public errorMessages = {
    'minLength': 'Minimum tag length is 3 chars',
    'maxLength': 'Maximum tag length is 20 chars'
  };
  private tags: Tag[];

  constructor(private cardService: CardService, private tagService: TagService, private dialogRef: MatDialogRef<CardCreateComponent>,
              @Inject(MAT_DIALOG_DATA) public card: Card) {
  }

  ngOnInit(): void {

    this.form = new FormGroup({
      title: new FormControl('', Validators.required),
      file: new FormControl('', Validators.required),
      tags: new FormControl('', Validators.required),
      source: new FormGroup({
        website: new FormControl('', [
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern('/^(https?:\\/\\/)?(www\\.)?([a-zA-Z0-9]+(-?[a-zA-Z0-9])*\\.)+[\\w]{2,}(\\/\\S*)?$/ig')]
        ),
        author: new FormControl('', [
          Validators.minLength(3),
          Validators.maxLength(20)]
        )
      })
    });

    if (this.card) {
      this.prefillTags();
    }
  }

  autoCompleteTags = (text: string): Observable<Tag[]> => {
    return this.tagService.searchByName(text);
  }


  // onAdd = (tag: Tag): Observable<Tag> => {
  //   return of(tag).pipe(map(tag.name.toLowerCase)).pipe(map(tag.name.normalize));
  // }

  tagsValidators(): ValidatorFn[] {
    return [Validators.minLength(3), Validators.maxLength(20)];
  }

  createCard(): void {
    this.cardService.create(this.card).subscribe(response => {
        console.log(response);
        this.submitted = true;
      },
      error => {
        console.error(error);
      });
  }

  public onValidationError(item) {
    console.log('invalid tag ' + item);
  }

  onSubmit() {
    if (this.form.valid) {
      console.log('Valid & submitted');
    } else {
      console.error('Form Invalid and not submitted');
    }
  }

  /*

  [ngModelOptions]="{standalone: true}"

  private controls(control: FormControl) {
    if (control.value.length < 3) {
      return {
        'minLength': true
      };
    } else if (control.value.length > 20) {
      return {
        'maxLength': true
      };
    }

    return null;
  }

  private validateAsync(control: FormControl): Promise<any> {
    return new Promise(resolve => {
      const value = control.value;
      const result: any = isNaN(value) ? {
        isNan: true
      } : null;

      setTimeout(() => {
        resolve(result);
      }, 400);
    });
  }

  public asyncErrorMessages = {
    isNan: 'Please only add numbers'
  };

  public validators = [this.controls];

  public asyncValidators = [this.validateAsync];

  public errorMessages = {
    'startsWithAt@': 'Your items need to start with \'@\'',
    'endsWith$': 'Your items need to end with \'$\''
  };

*/

  onCancel() {
    this.dialogRef.close()
  }

  dropped(files: NgxFileDropEntry[]) {
    for (const droppedFile of files) {

      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;

        fileEntry.file((file: File) => {
          console.log(droppedFile.relativePath, file);
        });
      }
    }
  }

  private prefillTags() {
    if (this.card.tags) {
      //  this.card.tags.forEach(tag => this.tags.push({identifyBy: tag.tagId, displayBy: tag.name}));
    }
  }
}
