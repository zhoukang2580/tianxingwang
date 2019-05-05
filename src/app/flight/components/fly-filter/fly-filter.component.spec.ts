import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlyFilterComponent } from './fly-filter.component';

describe('FlyFilterComponent', () => {
  let component: FlyFilterComponent;
  let fixture: ComponentFixture<FlyFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlyFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlyFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
