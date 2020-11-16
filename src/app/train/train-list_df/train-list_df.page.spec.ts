import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainListPage } from './train-list_df.page';

describe('TrainListPage', () => {
  let component: TrainListPage;
  let fixture: ComponentFixture<TrainListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
