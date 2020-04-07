import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountWechatPage } from './account-wechat.page';

describe('AccountWeixinPage', () => {
  let component: AccountWechatPage;
  let fixture: ComponentFixture<AccountWechatPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountWechatPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountWechatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
