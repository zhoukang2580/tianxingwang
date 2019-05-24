import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordValidPage } from './password-valid.page';

describe('PasswordValidPage', () => {
  let component: PasswordValidPage;
  let fixture: ComponentFixture<PasswordValidPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PasswordValidPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordValidPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
