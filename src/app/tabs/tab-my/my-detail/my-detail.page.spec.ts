import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyDetailPage } from './my-detail.page';

describe('MyDetailPage', () => {
  let component: MyDetailPage;
  let fixture: ComponentFixture<MyDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
