import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookCostcenterCompComponent } from './book-costcenter-comp-df.component';

describe('BookCostcenterCompComponent', () => {
  let component: BookCostcenterCompComponent;
  let fixture: ComponentFixture<BookCostcenterCompComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookCostcenterCompComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookCostcenterCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
