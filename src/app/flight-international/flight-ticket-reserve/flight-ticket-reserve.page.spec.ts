import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FlightTicketReservePage } from './flight-ticket-reserve.page';

describe('FlightTicketReservePage', () => {
  let component: FlightTicketReservePage;
  let fixture: ComponentFixture<FlightTicketReservePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlightTicketReservePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FlightTicketReservePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
