import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTabPlanePage } from './product-tab-plane.page';

describe('ProductTabPlanePage', () => {
  let component: ProductTabPlanePage;
  let fixture: ComponentFixture<ProductTabPlanePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductTabPlanePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductTabPlanePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
