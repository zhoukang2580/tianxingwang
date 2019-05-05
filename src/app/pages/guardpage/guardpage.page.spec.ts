import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardpagePage } from './guardpage.page';

describe('GuardpagePage', () => {
  let component: GuardpagePage;
  let fixture: ComponentFixture<GuardpagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuardpagePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuardpagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
