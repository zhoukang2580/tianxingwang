import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelCityPage } from './hotel-city.page';

describe('HotelCityPage', () => {
  let component: HotelCityPage;
  let fixture: ComponentFixture<HotelCityPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HotelCityPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HotelCityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
