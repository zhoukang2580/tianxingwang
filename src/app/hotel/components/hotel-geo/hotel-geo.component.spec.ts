import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelGeoComponent } from './hotel-geo.component';

describe('HotelGeoComponent', () => {
  let component: HotelGeoComponent;
  let fixture: ComponentFixture<HotelGeoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HotelGeoComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HotelGeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
