import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OpenRentalCarPage } from './open-rental-car.page';

describe('OpenRentalCarPage', () => {
  let component: OpenRentalCarPage;
  let fixture: ComponentFixture<OpenRentalCarPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenRentalCarPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OpenRentalCarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
