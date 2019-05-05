import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountWeixinPage } from './account-weixin.page';

describe('AccountWeixinPage', () => {
  let component: AccountWeixinPage;
  let fixture: ComponentFixture<AccountWeixinPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountWeixinPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountWeixinPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
