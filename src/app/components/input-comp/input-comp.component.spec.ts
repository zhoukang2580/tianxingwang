import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputCompComponent } from './input-comp.component';

describe('InputCompComponent', () => {
  let component: InputCompComponent;
  let fixture: ComponentFixture<InputCompComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputCompComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
