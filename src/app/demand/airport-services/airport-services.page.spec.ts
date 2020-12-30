import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AirportServicesPage } from './airport-services.page';

describe('AirportServicesPage', () => {
  let component: AirportServicesPage;
  let fixture: ComponentFixture<AirportServicesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirportServicesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AirportServicesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
