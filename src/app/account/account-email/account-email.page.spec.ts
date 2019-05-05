import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountEmailPage } from './account-email.page';

describe('AccountEmailPage', () => {
  let component: AccountEmailPage;
  let fixture: ComponentFixture<AccountEmailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountEmailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountEmailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
