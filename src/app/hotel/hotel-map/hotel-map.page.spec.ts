import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HotelMapPage } from './hotel-map.page';

describe('HotelMapPage', () => {
  let component: HotelMapPage;
  let fixture: ComponentFixture<HotelMapPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HotelMapPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HotelMapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
