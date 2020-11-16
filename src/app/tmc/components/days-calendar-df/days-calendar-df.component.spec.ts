import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DaysCalendarComponent } from './days-calendar-df.component';

describe('FlyDaysCalendarComponent', () => {
  let component: DaysCalendarComponent;
  let fixture: ComponentFixture<DaysCalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DaysCalendarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DaysCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
