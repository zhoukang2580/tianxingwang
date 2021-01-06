import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-demand-item-car',
  templateUrl: './demand-item-car.component.html',
  styleUrls: ['./demand-item-car.component.scss'],
})
export class DemandItemCarComponent implements OnInit {

  carType = 'plane' || 'train' || 'domestic';

  constructor() { }

  ngOnInit() {

  }

  switchCarType(type: string) {
    this.carType = type;
  }

  segmentChanged(evt: CustomEvent) {
    this.switchCarType(evt.detail.value);
  }
}
