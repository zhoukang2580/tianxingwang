import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SearchByTextPage } from './search-by-text.page';

describe('SearchByTextPage', () => {
  let component: SearchByTextPage;
  let fixture: ComponentFixture<SearchByTextPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchByTextPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchByTextPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
