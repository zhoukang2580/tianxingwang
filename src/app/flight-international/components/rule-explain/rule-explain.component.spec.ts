import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RuleExplainComponent } from './rule-explain.component';

describe('RuleExplainComponent', () => {
  let component: RuleExplainComponent;
  let fixture: ComponentFixture<RuleExplainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RuleExplainComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RuleExplainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
