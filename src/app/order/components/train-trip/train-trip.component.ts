import { CalendarService } from "./../../../tmc/calendar.service";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { OrderTripModel } from "src/app/order/models/OrderTripModel";
import { OrderInsuranceType } from "src/app/insurance/models/OrderInsuranceType";
import { InsuranceProductEntity } from "src/app/insurance/models/InsuranceProductEntity";
import { OrderInsuranceStatusType } from "../../models/OrderInsuranceStatusType";
import { OrderTravelPayType } from "../../models/OrderTravelEntity";

@Component({
  selector: "app-train-trip",
  templateUrl: "./train-trip.component.html",
  styleUrls: ["./train-trip.component.scss"],
})
export class TrainTripComponent implements OnInit {
  @Input() trip: OrderTripModel;
  @Input() isShowInsurance = false;
  @Output() showInsuranceEvt: EventEmitter<any>;
  @Output() payInsuranceEvt: EventEmitter<any>;
  orderInsurad: any;
  constructor(private calendarService: CalendarService) {
    this.showInsuranceEvt = new EventEmitter();
    this.payInsuranceEvt = new EventEmitter();
  }

  ngOnInit() {
    this.initTime();
    this.orderInsurad = this.getOrderInsurad();
  }
  private getOrderInsurad() {
    if (!this.trip || !this.trip.OrderInsurances) {
      return;
    }
    return this.trip.OrderInsurances.find(
      (it) =>
        it.Status == OrderInsuranceStatusType.Booking 
        // &&        it.TravelPayType == OrderTravelPayType.Person
    );
  }
  async onShowSelectedInsurance(
    p?: InsuranceProductEntity,
    trip?: OrderTripModel,
    evt?: CustomEvent
  ) {
    if (evt) {
      evt.stopPropagation();
    }
    if (!p || !trip) {
      return;
    }
    this.showInsuranceEvt.emit({ p, trip, evt });
  }
  payInsurance(key: string, tradeNo: string, evt: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
    }
    this.payInsuranceEvt.emit({
      evt,
      key,
      tradeNo,
    });
  }
  private initTime() {
    if (this.trip) {
      this.trip["goDate"] = this.getDate();
      this.trip.StartTime = this.getHHmm(this.trip.StartTime);
      this.trip.EndTime = this.getHHmm(this.trip.EndTime);
    }
  }
  private getDate() {
    const str =
      (this.trip &&
        this.trip.StartTime &&
        this.trip.StartTime.replace("T", " ")) ||
      "";
    return `${str.substr(0, 4)}年${str.substr(5, 2)}月${str.substr(
      "yyyy-mm-".length,
      2
    )}日 ${this.calendarService.getDescOfDate(
      str.substr(0, "yyyy-mm-dd".length)
    )}`;
  }
  private getHHmm(time: string) {
    const str = (time && time.replace("T", " ")) || "";
    return str.substr("yyyy-mm-ddT".length, "hh:mm".length);
  }
}
