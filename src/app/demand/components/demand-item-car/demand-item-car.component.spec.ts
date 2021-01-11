import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DemandItemCarComponent } from './demand-item-car.component';

describe('DemandItemCarComponent', () => {
  let component: DemandItemCarComponent;
  let fixture: ComponentFixture<DemandItemCarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemandItemCarComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DemandItemCarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
