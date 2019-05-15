import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CropAvatarPage } from './crop-avatar.page';

describe('CropAvatarPage', () => {
  let component: CropAvatarPage;
  let fixture: ComponentFixture<CropAvatarPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CropAvatarPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CropAvatarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
