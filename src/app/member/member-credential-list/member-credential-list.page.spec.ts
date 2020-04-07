import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MemberCredentialListPage } from './member-credential-list.page';

describe('MemberCredentialListPage', () => {
  let component: MemberCredentialListPage;
  let fixture: ComponentFixture<MemberCredentialListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberCredentialListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MemberCredentialListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
