import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalCarPage } from './rental-car.page';

describe('RentalCarPage', () => {
  let component: RentalCarPage;
  let fixture: ComponentFixture<RentalCarPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RentalCarPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RentalCarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
