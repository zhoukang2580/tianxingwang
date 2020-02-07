import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InternationalHotelDetailPage } from './international-hotel-detail.page';

describe('InternationalHotelDetailPage', () => {
  let component: InternationalHotelDetailPage;
  let fixture: ComponentFixture<InternationalHotelDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InternationalHotelDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InternationalHotelDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
