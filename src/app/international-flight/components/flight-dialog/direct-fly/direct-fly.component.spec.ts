import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DirectFlyComponent } from './direct-fly.component';

describe('DirectFlyComponent', () => {
  let component: DirectFlyComponent;
  let fixture: ComponentFixture<DirectFlyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DirectFlyComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DirectFlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
