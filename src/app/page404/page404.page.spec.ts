import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Page404Page } from './page404.page';

describe('Page404Page', () => {
  let component: Page404Page;
  let fixture: ComponentFixture<Page404Page>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Page404Page ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Page404Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
