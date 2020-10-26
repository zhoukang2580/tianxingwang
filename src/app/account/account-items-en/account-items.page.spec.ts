import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AccountItemsPage } from './account-items-en.page';

describe('AccountItemsPage', () => {
  let component: AccountItemsPage;
  let fixture: ComponentFixture<AccountItemsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountItemsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountItemsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
