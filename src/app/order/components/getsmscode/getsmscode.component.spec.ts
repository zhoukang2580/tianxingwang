import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GetsmscodeComponent } from './getsmscode.component';

describe('GetsmscodeComponent', () => {
  let component: GetsmscodeComponent;
  let fixture: ComponentFixture<GetsmscodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetsmscodeComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GetsmscodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
