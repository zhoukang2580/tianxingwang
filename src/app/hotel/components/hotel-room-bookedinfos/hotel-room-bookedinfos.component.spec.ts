import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelRoomBookedinfosComponent } from './hotel-room-bookedinfos.component';

describe('HotelRoomBookedinfosComponent', () => {
  let component: HotelRoomBookedinfosComponent;
  let fixture: ComponentFixture<HotelRoomBookedinfosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HotelRoomBookedinfosComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HotelRoomBookedinfosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
