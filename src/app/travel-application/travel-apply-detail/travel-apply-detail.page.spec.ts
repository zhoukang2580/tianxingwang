import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TravelApplyDetailPage } from './travel-apply-detail.page';

describe('TravelApplyDetailPage', () => {
  let component: TravelApplyDetailPage;
  let fixture: ComponentFixture<TravelApplyDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TravelApplyDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TravelApplyDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
