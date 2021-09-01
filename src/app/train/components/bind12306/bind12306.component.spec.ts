import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { Bind12306Component } from './bind12306.component';

describe('Bind12306Component', () => {
  let component: Bind12306Component;
  let fixture: ComponentFixture<Bind12306Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Bind12306Component ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(Bind12306Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
