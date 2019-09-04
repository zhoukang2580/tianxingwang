import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelQueryComponent } from './hotel-query.component';

describe('HotelQueryComponent', () => {
  let component: HotelQueryComponent;
  let fixture: ComponentFixture<HotelQueryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HotelQueryComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HotelQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
