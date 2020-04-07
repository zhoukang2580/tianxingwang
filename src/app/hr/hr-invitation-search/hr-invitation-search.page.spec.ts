import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HrInvitationSearchPage } from './hr-invitation-search.page';

describe('HrInvitationSearchPage', () => {
  let component: HrInvitationSearchPage;
  let fixture: ComponentFixture<HrInvitationSearchPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HrInvitationSearchPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HrInvitationSearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
