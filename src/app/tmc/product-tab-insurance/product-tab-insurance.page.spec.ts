import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTabInsurancePage } from './product-tab-insurance.page';

describe('ProductTabInsurancePage', () => {
  let component: ProductTabInsurancePage;
  let fixture: ComponentFixture<ProductTabInsurancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductTabInsurancePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductTabInsurancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
