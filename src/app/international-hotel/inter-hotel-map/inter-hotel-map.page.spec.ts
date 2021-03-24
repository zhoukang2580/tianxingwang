import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InterHotelMapPage } from './inter-hotel-map.page';

describe('InterHotelMapPage', () => {
  let component: InterHotelMapPage;
  let fixture: ComponentFixture<InterHotelMapPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterHotelMapPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InterHotelMapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
