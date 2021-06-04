import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectFlightsegmentCabinComponent } from './select-flightsegment-cabin.component';

describe('SelectFlightsegmentCabinComponent', () => {
  let component: SelectFlightsegmentCabinComponent;
  let fixture: ComponentFixture<SelectFlightsegmentCabinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectFlightsegmentCabinComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectFlightsegmentCabinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
