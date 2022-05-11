import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PictureSearchComponent } from './picture-search.component';

describe('PictureSearchComponent', () => {
  let component: PictureSearchComponent;
  let fixture: ComponentFixture<PictureSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PictureSearchComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PictureSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
