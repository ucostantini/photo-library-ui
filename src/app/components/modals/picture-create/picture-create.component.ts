import { Component, Inject, OnInit } from '@angular/core';
import { Picture, Tag } from '../../../core/models/picture';
import { PictureService } from '../../../core/services/picture/picture.service';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { TagService } from '../../../core/services/tag/tag.service';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { NgxFileDropEntry } from "ngx-file-drop";

@Component({
  selector: 'app-picture-create',
  templateUrl: './picture-create.component.html',
  styleUrls: ['./picture-create.component.css']
})
export class PictureCreateComponent implements OnInit {

  form: FormGroup;
  isCreate = true;
  submitted = false;
  public errorMessages = {
    'minLength': 'Minimum tag length is 3 chars',
    'maxLength': 'Maximum tag length is 20 chars'
  };
  private tags: Tag[];

  constructor(private pictureService: PictureService, private tagService: TagService, private dialogRef: MatDialogRef<PictureCreateComponent>,
              @Inject(MAT_DIALOG_DATA) public picture: Picture) {
  }

  ngOnInit(): void {

    this.form = new FormGroup({
      title: new FormControl('', Validators.required),
      file: new FormControl('', Validators.required),
      tags: new FormControl('', Validators.required),
      source: new FormGroup({
        website: new FormControl(this.picture && this.picture.source.website ? this.picture.source.website : '', [
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern('/^(https?:\\/\\/)?(www\\.)?([a-zA-Z0-9]+(-?[a-zA-Z0-9])*\\.)+[\\w]{2,}(\\/\\S*)?$/ig')]
        ),
        author: new FormControl(this.picture && this.picture.source.userName ? this.picture.source.userName : '', [
          Validators.minLength(3),
          Validators.maxLength(20)]
        )
      })
    });

    if (this.picture) {
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

  createPicture(): void {
    this.pictureService.create(this.picture).subscribe(response => {
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

  private prefillTags() {
    if (this.picture.tags) {
      //  this.picture.tags.forEach(tag => this.tags.push({identifyBy: tag.tagId, displayBy: tag.name}));
    }
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
}
