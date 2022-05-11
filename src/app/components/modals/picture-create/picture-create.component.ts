import { Component, OnInit } from '@angular/core';
import { Picture } from "../../../core/models/picture";
import { PictureService } from "../../../core/services/picture/picture.service";
import { BsModalRef } from "ngx-bootstrap/modal";
import { FormControl, FormGroup, ValidatorFn, Validators } from "@angular/forms";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { TagService } from "../../../core/services/tag/tag.service";
import { TagModel } from "ngx-chips/core/accessor";

@Component({
  selector: 'app-picture-create',
  templateUrl: './picture-create.component.html',
  styleUrls: ['./picture-create.component.css']
})
export class PictureCreateComponent implements OnInit {

  pictureForm: FormGroup;
  isCreate: boolean = true;
  submitted = false;
  public errorMessages = {
    'minLength': 'Minimum tag length is 3 chars',
    'maxLength': 'Maximum tag length is 20 chars'
  };
  private picture: Picture;
  private tags: TagModel[];

  constructor(public bsModalRef: BsModalRef, private pictureService: PictureService, private tagService: TagService) {
  }

  ngOnInit(): void {

    this.pictureForm = new FormGroup({
      file: new FormControl('', Validators.required),
      chips: new FormGroup({
        tags: new FormControl(this.tags, Validators.required)
      }),
      source: new FormGroup({
        website: new FormControl(this.picture && this.picture.source.website ? this.picture.source.website : '', [
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern('/^(https?:\\/\\/)?(www\\.)?([a-zA-Z0-9]+(-?[a-zA-Z0-9])*\\.)+[\\w]{2,}(\\/\\S*)?$/ig')]
        ),
        userName: new FormControl(this.picture && this.picture.source.userName ? this.picture.source.userName : '', [
          Validators.minLength(3),
          Validators.maxLength(20)]
        )
      })
    });

    if (this.picture) {
      this.prefillTags();
    }
  }

  autoCompleteTags = (text: string): Observable<TagModel[]> => {
    return this.tagService.searchByName(text);
  }


  onAdd = (tag: TagModel): Observable<TagModel> => {
    return of(tag).pipe(map(tag.toLowerCase)).pipe(map(tag.normalize));
  };

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
    if (this.pictureForm.valid) {
      console.log("Valid & submitted");
    } else {
      console.error("Form Invalid and not submitted");
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

  private prefillTags() {
    if (this.picture.tags) {
      this.picture.tags.forEach(tag => this.tags.push({identifyBy: tag.tagId, displayBy: tag.name}));
    }
  }


}
