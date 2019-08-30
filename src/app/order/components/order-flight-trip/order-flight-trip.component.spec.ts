import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderFlightTripComponent } from './order-flight-trip.component';

describe('OrderFlightTripComponent', () => {
  let component: OrderFlightTripComponent;
  let fixture: ComponentFixture<OrderFlightTripComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderFlightTripComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderFlightTripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
