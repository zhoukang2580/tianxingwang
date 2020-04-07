import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TakeoffLandingAirportComponent } from './takeoff-landing-airport.component';

describe('TakeoffLandingAirportComponent', () => {
  let component: TakeoffLandingAirportComponent;
  let fixture: ComponentFixture<TakeoffLandingAirportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TakeoffLandingAirportComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TakeoffLandingAirportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
