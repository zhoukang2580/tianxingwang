import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightOrderDetialComponent } from './flight-order-detial.component';

describe('FlightOrderDetialComponent', () => {
  let component: FlightOrderDetialComponent;
  let fixture: ComponentFixture<FlightOrderDetialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlightOrderDetialComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightOrderDetialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
