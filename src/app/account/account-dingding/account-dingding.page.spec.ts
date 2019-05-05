import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountDingdingPage } from './account-dingding.page';

describe('AccountDingdingPage', () => {
  let component: AccountDingdingPage;
  let fixture: ComponentFixture<AccountDingdingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountDingdingPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountDingdingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
