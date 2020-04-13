import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelectedTripInfoPage } from './selected-trip-info.page';

describe('SelectedTripInfoPage', () => {
  let component: SelectedTripInfoPage;
  let fixture: ComponentFixture<SelectedTripInfoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedTripInfoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectedTripInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
