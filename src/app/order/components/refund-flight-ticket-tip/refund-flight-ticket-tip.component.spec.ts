import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RefundFlightTicketTipComponent } from './refund-flight-ticket-tip.component';

describe('RefundFlightTicketTipComponent', () => {
  let component: RefundFlightTicketTipComponent;
  let fixture: ComponentFixture<RefundFlightTicketTipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefundFlightTicketTipComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RefundFlightTicketTipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
