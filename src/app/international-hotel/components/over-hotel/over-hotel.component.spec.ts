import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OverHotelComponent } from './over-hotel.component';

describe('OverHotelComponent', () => {
  let component: OverHotelComponent;
  let fixture: ComponentFixture<OverHotelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverHotelComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OverHotelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
