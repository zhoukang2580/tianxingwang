import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlyDaysCalendarComponent } from './fly-days-calendar.component';

describe('FlyDaysCalendarComponent', () => {
  let component: FlyDaysCalendarComponent;
  let fixture: ComponentFixture<FlyDaysCalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlyDaysCalendarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlyDaysCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
