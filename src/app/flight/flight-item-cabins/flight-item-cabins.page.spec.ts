import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightItemCabinsPage } from './flight-item-cabins.page';

describe('FlightItemCabinsPage', () => {
  let component: FlightItemCabinsPage;
  let fixture: ComponentFixture<FlightItemCabinsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlightItemCabinsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightItemCabinsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
