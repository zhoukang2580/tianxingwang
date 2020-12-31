import { Component, OnInit } from '@angular/core';
import { FlightType } from '../demand.service';

@Component({
  selector: 'app-demand-list',
  templateUrl: './demand-list.page.html',
  styleUrls: ['./demand-list.page.scss'],
})
export class DemandListPage implements OnInit {

  listType = 'team' || 'meeting' || 'visa' || 'car' || 'flight';
  FlightType = FlightType;
  constructor() { }

  ngOnInit() {

  }

  getListType(type: string){
    this.listType = type;
  }

  segmentChanged(evt :CustomEvent){
    this.getListType(evt.detail.value);
  }
}
