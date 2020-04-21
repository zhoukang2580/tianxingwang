import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RefresherComponent } from './refresher.component';

describe('RefresherComponent', () => {
  let component: RefresherComponent;
  let fixture: ComponentFixture<RefresherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefresherComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefresherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
