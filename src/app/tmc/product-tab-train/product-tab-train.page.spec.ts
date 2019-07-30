import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTabTrainPage } from './product-tab-train.page';

describe('ProductTabTrainPage', () => {
  let component: ProductTabTrainPage;
  let fixture: ComponentFixture<ProductTabTrainPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductTabTrainPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductTabTrainPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
