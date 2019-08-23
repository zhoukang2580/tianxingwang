import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightOriginalTripComponent } from './flight-original-trip.component';

describe('FlightOriginalTripComponent', () => {
  let component: FlightOriginalTripComponent;
  let fixture: ComponentFixture<FlightOriginalTripComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlightOriginalTripComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightOriginalTripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
