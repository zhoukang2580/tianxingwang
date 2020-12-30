import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DemandListPage } from './demand-list.page';

describe('DemandListPage', () => {
  let component: DemandListPage;
  let fixture: ComponentFixture<DemandListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemandListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DemandListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
