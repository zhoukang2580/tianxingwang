import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelectNationalityPage } from './select-nationality.page';

describe('SelectNationalityPage', () => {
  let component: SelectNationalityPage;
  let fixture: ComponentFixture<SelectNationalityPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectNationalityPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectNationalityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
