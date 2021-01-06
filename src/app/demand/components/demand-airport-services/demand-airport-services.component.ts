import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CalendarService } from 'src/app/tmc/calendar.service';
import { DemandAirportServiceModel } from '../../demand.service';

@Component({
  selector: 'app-demand-airport-services',
  templateUrl: './demand-airport-services.component.html',
  styleUrls: ['./demand-airport-services.component.scss'],
})
export class DemandAirportServicesComponent implements OnInit {
  @Input() demandAirportModel:DemandAirportServiceModel;
  @Output() demandAirport: EventEmitter<any>;
  constructor(
    private calendarService:CalendarService
  ) {
    this.demandAirport = new EventEmitter();
   }

  ngOnInit() {
    this.demandAirportModel = {} as any;
    let date = new Date();
    this.demandAirportModel.DepartureDateDay = date.toLocaleDateString.toString();
    this.demandAirportModel.DepartureDateHour = '12:30';
  }

  onSubmit(){
    this.demandAirport.emit({demandAirportModel:this.demandAirportModel})
  }

  async onOpenDate() {
    const r = await this.calendarService.openCalendar({
      goArrivalTime: "",
      isMulti: false,
      forType: null,
      beginDate: "",
      endDate: "",
    });
    if (r && r.length) {
      this.demandAirportModel.DepartureDateDay = r[0].date;
    }
  }

}
