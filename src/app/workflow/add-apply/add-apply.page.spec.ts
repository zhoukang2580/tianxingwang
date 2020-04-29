import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddApplyPage } from './add-apply.page';

describe('AddApplyPage', () => {
  let component: AddApplyPage;
  let fixture: ComponentFixture<AddApplyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddApplyPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddApplyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
