import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainBookPage } from './book_en.page';

describe('TrainBookPage', () => {
  let component: TrainBookPage;
  let fixture: ComponentFixture<TrainBookPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainBookPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainBookPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
