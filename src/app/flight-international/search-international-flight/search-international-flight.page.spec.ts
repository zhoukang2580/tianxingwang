import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SearchInternationalFlightPage } from './search-international-flight.page';

describe('SearchInternationalFlightPage', () => {
  let component: SearchInternationalFlightPage;
  let fixture: ComponentFixture<SearchInternationalFlightPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchInternationalFlightPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchInternationalFlightPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
