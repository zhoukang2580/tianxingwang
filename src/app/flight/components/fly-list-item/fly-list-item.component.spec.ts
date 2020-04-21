import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlyListItemComponent } from './fly-list-item.component';

describe('FlyListItemComponent', () => {
  let component: FlyListItemComponent;
  let fixture: ComponentFixture<FlyListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlyListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlyListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
