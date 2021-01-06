import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DemandAirportServiceModel } from '../../demand.service';

@Component({
  selector: 'app-demand-airport-services',
  templateUrl: './demand-airport-services.component.html',
  styleUrls: ['./demand-airport-services.component.scss'],
})
export class DemandAirportServicesComponent implements OnInit {
  @Input() demandAirportModel:DemandAirportServiceModel;
  @Output() demandAirport: EventEmitter<any>;
  constructor() {
    this.demandAirport = new EventEmitter();
   }

  ngOnInit() {
    this.demandAirportModel = {} as any;
  }

  onSubmit(){
    this.demandAirport.emit({demandAirportModel:this.demandAirportModel})
  }

}
