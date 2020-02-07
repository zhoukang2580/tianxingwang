import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PinFabComponent } from './pin-fab.component';

describe('PinFabComponent', () => {
  let component: PinFabComponent;
  let fixture: ComponentFixture<PinFabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PinFabComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PinFabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
