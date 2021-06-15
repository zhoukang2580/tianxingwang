import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirtypeComponent } from './airtype.component';

describe('AirtypeComponent', () => {
  let component: AirtypeComponent;
  let fixture: ComponentFixture<AirtypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirtypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirtypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
