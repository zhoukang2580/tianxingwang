import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrComponent } from './or.component';

describe('OrComponent', () => {
  let component: OrComponent;
  let fixture: ComponentFixture<OrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
