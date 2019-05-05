import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AircompanyComponent } from './aircompany.component';

describe('AircompanyComponent', () => {
  let component: AircompanyComponent;
  let fixture: ComponentFixture<AircompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AircompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AircompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
