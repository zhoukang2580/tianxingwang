import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightDynamicComponent } from './flight-dynamic.component';

describe('FlightDynamicComponent', () => {
  let component: FlightDynamicComponent;
  let fixture: ComponentFixture<FlightDynamicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlightDynamicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightDynamicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
