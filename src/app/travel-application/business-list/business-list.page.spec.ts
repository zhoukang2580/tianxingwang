import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BusinessListPage } from './business-list.page';

describe('BusinessListPage', () => {
  let component: BusinessListPage;
  let fixture: ComponentFixture<BusinessListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusinessListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BusinessListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
