import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InternationalHotelShowImagesPage } from './international-hotel-show-images.page';

describe('InternationalHotelShowImagesPage', () => {
  let component: InternationalHotelShowImagesPage;
  let fixture: ComponentFixture<InternationalHotelShowImagesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InternationalHotelShowImagesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InternationalHotelShowImagesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
