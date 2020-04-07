import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookCredentialCompComponent } from './book-credential-comp.component';

describe('BookCredentialCompComponent', () => {
  let component: BookCredentialCompComponent;
  let fixture: ComponentFixture<BookCredentialCompComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookCredentialCompComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookCredentialCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
