import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwitchCompanyPage } from './switch-company.page';

describe('SwitchCompanyPage', () => {
  let component: SwitchCompanyPage;
  let fixture: ComponentFixture<SwitchCompanyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwitchCompanyPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwitchCompanyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
