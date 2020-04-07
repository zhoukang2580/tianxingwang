import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HrInvitationListPage } from './hr-invitation-list.page';

describe('HrInvitationListPage', () => {
  let component: HrInvitationListPage;
  let fixture: ComponentFixture<HrInvitationListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HrInvitationListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HrInvitationListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
