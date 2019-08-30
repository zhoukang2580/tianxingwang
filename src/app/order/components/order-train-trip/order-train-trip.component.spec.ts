import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderTrainTripComponent } from './order-train-trip.component';

describe('OrderTrainTripComponent', () => {
  let component: OrderTrainTripComponent;
  let fixture: ComponentFixture<OrderTrainTripComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderTrainTripComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderTrainTripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
