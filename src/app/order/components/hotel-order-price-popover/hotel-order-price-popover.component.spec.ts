import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HotelOrderPricePopoverComponent } from './order-hotel-price-popover.component';

describe('HotelOrderPricePopoverComponent', () => {
  let component: HotelOrderPricePopoverComponent;
  let fixture: ComponentFixture<HotelOrderPricePopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HotelOrderPricePopoverComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HotelOrderPricePopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
