import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordCheckPage } from './password-check.page';

describe('PasswordCheckPage', () => {
  let component: PasswordCheckPage;
  let fixture: ComponentFixture<PasswordCheckPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PasswordCheckPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordCheckPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
