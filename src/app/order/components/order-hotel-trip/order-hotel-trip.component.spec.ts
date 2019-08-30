import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderHotelTripComponent } from './order-hotel-trip.component';

describe('OrderHotelTripComponent', () => {
  let component: OrderHotelTripComponent;
  let fixture: ComponentFixture<OrderHotelTripComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderHotelTripComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderHotelTripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
