import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketchangingComponent } from './ticketchanging.component';

describe('TicketchangingComponent', () => {
  let component: TicketchangingComponent;
  let fixture: ComponentFixture<TicketchangingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketchangingComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketchangingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
