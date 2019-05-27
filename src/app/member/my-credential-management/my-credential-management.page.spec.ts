import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCredentialManagementPage } from './my-credential-management.page';

describe('MyCredentialManagementPage', () => {
  let component: MyCredentialManagementPage;
  let fixture: ComponentFixture<MyCredentialManagementPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyCredentialManagementPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyCredentialManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
