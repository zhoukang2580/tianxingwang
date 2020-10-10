import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookCredentialCompEnComponent } from './book-credential-comp_en.component';

describe('BookCredentialCompComponent', () => {
  let component: BookCredentialCompEnComponent;
  let fixture: ComponentFixture<BookCredentialCompEnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookCredentialCompEnComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookCredentialCompEnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
