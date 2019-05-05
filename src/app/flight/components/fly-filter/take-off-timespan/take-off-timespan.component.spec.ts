import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TakeOffTimespanComponent } from './take-off-timespan.component';

describe('TakeOffTimespanComponent', () => {
  let component: TakeOffTimespanComponent;
  let fixture: ComponentFixture<TakeOffTimespanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TakeOffTimespanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TakeOffTimespanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
