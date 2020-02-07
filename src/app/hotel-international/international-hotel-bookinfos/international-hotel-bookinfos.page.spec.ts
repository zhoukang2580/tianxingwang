import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InternationalHotelBookinfosPage } from './international-hotel-bookinfos.page';

describe('InternationalHotelBookinfosPage', () => {
  let component: InternationalHotelBookinfosPage;
  let fixture: ComponentFixture<InternationalHotelBookinfosPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InternationalHotelBookinfosPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InternationalHotelBookinfosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
