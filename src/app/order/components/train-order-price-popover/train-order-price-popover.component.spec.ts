import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TrainOrderPricePopoverComponent } from './order-train-price-popover.component';

describe('TrainOrderPricePopoverComponent', () => {
  let component: TrainOrderPricePopoverComponent;
  let fixture: ComponentFixture<TrainOrderPricePopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainOrderPricePopoverComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TrainOrderPricePopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
