import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookTmcOutnumberComponent } from './book-tmc-outnumber.component';

describe('BookTmcOutnumberComponent', () => {
  let component: BookTmcOutnumberComponent;
  let fixture: ComponentFixture<BookTmcOutnumberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookTmcOutnumberComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookTmcOutnumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
