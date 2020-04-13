import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FlightListDetailPage } from './flight-list-detail.page';

describe('FlightListDetailPage', () => {
  let component: FlightListDetailPage;
  let fixture: ComponentFixture<FlightListDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlightListDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FlightListDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
