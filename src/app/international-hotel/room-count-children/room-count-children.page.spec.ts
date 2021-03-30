import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RoomCountChildrenPage } from './room-count-children.page';

describe('RoomCountChildrenPage', () => {
  let component: RoomCountChildrenPage;
  let fixture: ComponentFixture<RoomCountChildrenPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomCountChildrenPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RoomCountChildrenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
