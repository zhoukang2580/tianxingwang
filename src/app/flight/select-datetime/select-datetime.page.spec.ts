import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectDatetimePage } from './select-datetime.page';

describe('SelectDatetimePage', () => {
  let component: SelectDatetimePage;
  let fixture: ComponentFixture<SelectDatetimePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectDatetimePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectDatetimePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
