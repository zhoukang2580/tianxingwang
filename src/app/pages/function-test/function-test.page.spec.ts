import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionTestPage } from './function-test.page';

describe('FunctionTestPage', () => {
  let component: FunctionTestPage;
  let fixture: ComponentFixture<FunctionTestPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FunctionTestPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FunctionTestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
