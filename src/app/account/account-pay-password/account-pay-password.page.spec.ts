import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountPayPasswordPage } from './account-pay-password.page';

describe('AccountPayPasswordPage', () => {
  let component: AccountPayPasswordPage;
  let fixture: ComponentFixture<AccountPayPasswordPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountPayPasswordPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountPayPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
