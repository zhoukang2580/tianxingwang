import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddStrokeComponent } from './add-stroke.component';

describe('AddStrokeComponent', () => {
  let component: AddStrokeComponent;
  let fixture: ComponentFixture<AddStrokeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddStrokeComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddStrokeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
