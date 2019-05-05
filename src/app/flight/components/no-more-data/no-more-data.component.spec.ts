import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoMoreDataComponent } from './no-more-data.component';

describe('NoMoreDataComponent', () => {
  let component: NoMoreDataComponent;
  let fixture: ComponentFixture<NoMoreDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoMoreDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoMoreDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
