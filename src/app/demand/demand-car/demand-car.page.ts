import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-demand-car',
  templateUrl: './demand-car.page.html',
  styleUrls: ['./demand-car.page.scss'],
})
export class DemandCarPage implements OnInit {

  carType = 'plane'|| 'train' || 'domestic';
  constructor() { }

  ngOnInit() {
  }

  segmentChanged(evt :CustomEvent){
    console.log(evt);
  }

}
