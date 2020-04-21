import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InsurancOpenUrlComponent } from './insuranc-open-url.component';

describe('InsurancOpenUrlComponent', () => {
  let component: InsurancOpenUrlComponent;
  let fixture: ComponentFixture<InsurancOpenUrlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsurancOpenUrlComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InsurancOpenUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
