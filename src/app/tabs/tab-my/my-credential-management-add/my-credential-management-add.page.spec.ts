import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCredentialManagementAddPage } from './my-credential-management-add.page';

describe('MyCredentialManagementAddPage', () => {
  let component: MyCredentialManagementAddPage;
  let fixture: ComponentFixture<MyCredentialManagementAddPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyCredentialManagementAddPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyCredentialManagementAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
