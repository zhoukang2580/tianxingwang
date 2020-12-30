import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DemandMeetingPage } from './demand-meeting.page';

describe('DemandMeetingPage', () => {
  let component: DemandMeetingPage;
  let fixture: ComponentFixture<DemandMeetingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemandMeetingPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DemandMeetingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
