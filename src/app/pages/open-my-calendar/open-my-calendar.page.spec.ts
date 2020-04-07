import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OpenMyCalendarPage } from './open-my-calendar.page';

describe('OpenMyCalendarPage', () => {
  let component: OpenMyCalendarPage;
  let fixture: ComponentFixture<OpenMyCalendarPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenMyCalendarPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OpenMyCalendarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
