import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelThemeComponent } from './hotel-theme.component';

describe('HotelThemeComponent', () => {
  let component: HotelThemeComponent;
  let fixture: ComponentFixture<HotelThemeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HotelThemeComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HotelThemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
