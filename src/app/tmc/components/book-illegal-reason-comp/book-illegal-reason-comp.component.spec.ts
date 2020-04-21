import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookIllegalReasonCompComponent } from './book-illegal-reason-comp.component';

describe('BookIllegalReasonCompComponent', () => {
  let component: BookIllegalReasonCompComponent;
  let fixture: ComponentFixture<BookIllegalReasonCompComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookIllegalReasonCompComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookIllegalReasonCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
