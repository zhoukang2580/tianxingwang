import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTabHotelPage } from './product-tab-hotel.page';

describe('ProductTabHotelPage', () => {
  let component: ProductTabHotelPage;
  let fixture: ComponentFixture<ProductTabHotelPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductTabHotelPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductTabHotelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
