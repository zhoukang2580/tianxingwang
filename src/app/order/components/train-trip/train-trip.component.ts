import { CalendarService } from './../../../tmc/calendar.service';
import { Component, OnInit, Input } from '@angular/core';
import { OrderTripModel } from 'src/app/order/models/OrderTripModel';
import { OrderInsuranceType } from 'src/app/insurance/models/OrderInsuranceType';

@Component({
  selector: 'app-train-trip',
  templateUrl: './train-trip.component.html',
  styleUrls: ['./train-trip.component.scss'],
})
export class TrainTripComponent implements OnInit {
  @Input() trip: OrderTripModel;
  constructor(private calendarService:CalendarService) { }

  ngOnInit() { }
  getDate() {
    const str = this.trip && this.trip.StartTime && this.trip.StartTime.replace("T", " ") || "";
    return `${str.substr(0, 4)}年${str.substr(5,2)}月${str.substr('yyyy-mm-'.length,2)}日 ${this.calendarService.getDescOfDate(str.substr(0,'yyyy-mm-dd'.length))}`
  }
  getStHHmm() {
    const str = this.trip && this.trip.StartTime && this.trip.StartTime.replace("T", " ") || "";
    return str.substr('yyyy-mm-ddT'.length, 'hh:mm'.length);
  }
  getEndHHmm(){
    const str = this.trip && this.trip.EndTime && this.trip.EndTime.replace("T", " ") || "";
    return str.substr('yyyy-mm-ddT'.length, 'hh:mm'.length);
  }
  getTrainProducts(orderTrip: OrderTripModel) {
    const types = [OrderInsuranceType.TrainAccident];
    if (!orderTrip || !orderTrip.InsuranceResult) {
      return [];
    }
    return orderTrip.InsuranceResult.Products.filter(it => types.some(t => t == it.InsuranceType));
  }
}
