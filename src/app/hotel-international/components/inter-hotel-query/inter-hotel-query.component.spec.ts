import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InterHotelQueryComponent } from './inter-hotel-query.component';

describe('InterHotelQueryComponent', () => {
  let component: InterHotelQueryComponent;
  let fixture: ComponentFixture<InterHotelQueryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterHotelQueryComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InterHotelQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
