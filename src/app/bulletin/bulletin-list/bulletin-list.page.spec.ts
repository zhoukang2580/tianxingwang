import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulletinListPage } from './bulletin-list.page';

describe('BulletinListPage', () => {
  let component: BulletinListPage;
  let fixture: ComponentFixture<BulletinListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulletinListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulletinListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
