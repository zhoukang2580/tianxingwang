import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarCropPage } from './avatar-crop.page';

describe('AvatarCropPage', () => {
  let component: AvatarCropPage;
  let fixture: ComponentFixture<AvatarCropPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvatarCropPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvatarCropPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
