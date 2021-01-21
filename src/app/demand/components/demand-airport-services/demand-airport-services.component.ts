import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppHelper } from 'src/app/appHelper';
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
    this.demandAirportModel.DepartureDateDay = date.toLocaleDateString();
    this.demandAirportModel.DepartureDateHour = '12:30';
  }

  onSubmit(){
    try {
      if(this.demandAirportModel){
        if(this.demandAirportModel.DepartureDateDay){
          this.demandAirportModel.DepartureDateDay = this.demandAirportModel.DepartureDateDay.replace("T", " ").substring(
            0,
            10
          );
        }
      }
      if(this.demandAirportModel){
        if(!this.demandAirportModel.LiaisonName){
          AppHelper.alert("请输入联系人");
          return;
        }
        if(!this.demandAirportModel.LiaisonPhone){
          AppHelper.alert("请输入联系电话");
          return;
        }
        const reg = /^1(3|4|5|6|7|8|9)\d{9}$/;
        if (!(reg.test(this.demandAirportModel.LiaisonPhone))) {
          AppHelper.alert("电话格式不正确");
          return;
        }
        if(!this.demandAirportModel.ServiceType ||
          !this.demandAirportModel.AirportName ||
          !this.demandAirportModel.City ||
          !this.demandAirportModel.NumberOfPeople ||
          !this.demandAirportModel.Terminal ||
          !this.demandAirportModel.DepartureDateDay ||
          !this.demandAirportModel.DepartureDateHour
          ){
          AppHelper.alert("请完善信息");
          return;
        }
      }
      this.demandAirport.emit({demandAirportModel:this.demandAirportModel})
    } catch (e) {
      AppHelper.alert(e);
    }
  }

}
