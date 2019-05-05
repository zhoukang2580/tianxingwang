import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwitchCityComponent } from './switch-city.component';

describe('SelectCityComponent', () => {
  let component: SwitchCityComponent;
  let fixture: ComponentFixture<SwitchCityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwitchCityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwitchCityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
