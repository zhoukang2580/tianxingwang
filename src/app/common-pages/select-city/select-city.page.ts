import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { SelectCityService } from './select-city.service';

@Component({
  selector: 'app-select-city',
  templateUrl: './select-city.page.html',
  styleUrls: ['./select-city.page.scss'],
})
export class SelectCityPage implements OnInit {
  title: string;
  items: any[] = [];
  viewModelItems: any[];
  constructor(private route: ActivatedRoute, private cityService: SelectCityService) {
    this.title = this.cityService.extra && this.cityService.extra.title;
  }

  ngOnInit() {
    this.items = this.cityService.getCities();
    this.viewModelItems = this.items;
  }
  onItemClick(item: any) {
    this.cityService.setSelectedItem(item);
    window.history.back();
  }
  onIonChange(evt: CustomEvent) {
    if (this.items) {
      if (evt.detail.value) {
        this.viewModelItems = this.items.filter(itm => `${itm[this.cityService.extra.displayField]}`
          .toLowerCase().includes(`${evt.detail.value}`.toLowerCase()));
      } else {
        this.viewModelItems = this.items;
      }
    }
  }
}
