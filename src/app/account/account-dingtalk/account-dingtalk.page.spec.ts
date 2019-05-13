import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountDingtalkPage } from './account-dingtalk.page';

describe('AccountDingdingPage', () => {
  let component: AccountDingtalkPage;
  let fixture: ComponentFixture<AccountDingtalkPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountDingtalkPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountDingtalkPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
