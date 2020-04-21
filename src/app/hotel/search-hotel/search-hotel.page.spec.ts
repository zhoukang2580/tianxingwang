import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchHotelPage } from './search-hotel.page';

describe('SearchHotelPage', () => {
  let component: SearchHotelPage;
  let fixture: ComponentFixture<SearchHotelPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchHotelPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchHotelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
