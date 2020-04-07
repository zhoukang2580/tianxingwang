import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DateCityComponent } from './date-city.component';

describe('DateCityComponent', () => {
  let component: DateCityComponent;
  let fixture: ComponentFixture<DateCityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DateCityComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateCityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
