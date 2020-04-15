import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChooseFlightSeatPage } from './choose-flight-seat.page';

describe('ChooseFlightSeatPage', () => {
  let component: ChooseFlightSeatPage;
  let fixture: ComponentFixture<ChooseFlightSeatPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChooseFlightSeatPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ChooseFlightSeatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
