import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTabsPage } from './product-tabs.page';

describe('ProductTabsPage', () => {
  let component: ProductTabsPage;
  let fixture: ComponentFixture<ProductTabsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductTabsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductTabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
