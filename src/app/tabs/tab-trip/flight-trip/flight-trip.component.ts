import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { OrderTripModel } from 'src/app/order/models/OrderTripModel';
import { CalendarService } from 'src/app/tmc/calendar.service';
import { OrderInsuranceType } from 'src/app/insurance/models/OrderInsuranceType';
import { OrderInsuranceStatusType } from 'src/app/order/models/OrderInsuranceStatusType';
import { InsuranceProductEntity } from 'src/app/insurance/models/InsuranceProductEntity';
import { OrderTravelPayType } from 'src/app/order/models/OrderTravelEntity';
import { TripBuyInsuranceComponent } from '../trip-buy-insurance/trip-buy-insurance.component';

@Component({
  selector: 'app-flight-trip',
  templateUrl: './flight-trip.component.html',
  styleUrls: ['./flight-trip.component.scss'],
})
export class FlightTripComponent implements OnInit {
  @Input() trip: OrderTripModel;
  @Output() payInsuranceEvt: EventEmitter<any>;
  constructor(private calendarService: CalendarService, private modalCtrl: ModalController) {
    this.payInsuranceEvt = new EventEmitter();
  }

  ngOnInit() { }
  check(type: OrderInsuranceType) {
    const OrderInsurances = this.trip && this.trip.OrderInsurances;
    if (!OrderInsurances) { return true; }
    const count = OrderInsurances
      .filter(s => s.InsuranceType == type
        && s.Status != OrderInsuranceStatusType.Abolish
        && s.Status != OrderInsuranceStatusType.Refunded)
      .length;
    if (count > 0) { return false; }
    return true;
  }
  getProducts() {
    let products: InsuranceProductEntity[] = [];
    if (!this.trip) {
      return products;
    }
    const types = [OrderInsuranceType.FlightAccident, OrderInsuranceType.FlightDelay];
    products = this.trip.InsuranceResult
      && this.trip.InsuranceResult.Products
      && this.trip.InsuranceResult.Products
        .filter(it => types.some(t => t == it.InsuranceType)) || [];
    return products;
  }
  getOrderInsurad() {
    if (!this.trip || !this.trip.OrderInsurances) {
      return;
    }
    return this.trip.OrderInsurances
      .find(it => it.Status == OrderInsuranceStatusType.Booking && it.TravelPayType == OrderTravelPayType.Person);
  }
  getDays(t1: string, t2: string) {
    const diff = this.calendarService.getDiffDays(t1, t2);
    // console.log("getdays", diff)
    return diff;
  }
  async onShowSelectedInsurance(p?: InsuranceProductEntity, trip?: OrderTripModel, evt?: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
    }
    if (!p || !trip) {
      return;
    }
    const m = await this.modalCtrl.create({
      component: TripBuyInsuranceComponent,
      componentProps: {
        trip,
        insurance: p
      }
    });
    m.present();
  }
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
  payInsurance(key: string, tradeNo: string,evt:CustomEvent) {
    if (evt) {
      evt.stopPropagation();
    }
    this.payInsuranceEvt.emit({
      evt:evt,
      key,
      tradeNo
    })
  }
}
