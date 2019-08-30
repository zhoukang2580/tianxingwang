import { Component, OnInit, Input } from "@angular/core";
import { OrderTripModel } from "../../models/OrderTripModel";

@Component({
  selector: "app-order-flight-trip",
  templateUrl: "./order-flight-trip.component.html",
  styleUrls: ["./order-flight-trip.component.scss"]
})
export class OrderFlightTripComponent implements OnInit {
  @Input() orderTrip: OrderTripModel;
  constructor() {
    // this.orderTrip = {} as any;
    // this.orderTrip.OrderId = "190000047694";
    // this.orderTrip.Status = "已出票";
    // this.orderTrip.OrderTicketId = "1900000476945";
    // this.orderTrip.StartTime = "2019-08-31 09:25";
    // this.orderTrip.FromName = "上海虹桥国际机场 T2";
    // this.orderTrip.ToName = "武汉天河国际机场 T3";
    // this.orderTrip.Number = "MU2510";
  }

  ngOnInit() {}
  getTime() {
    if (this.orderTrip && this.orderTrip.StartTime) {
      if (this.orderTrip.StartTime.includes("T")) {
        return this.orderTrip.StartTime.split("T")[1];
      }
      const arr = this.orderTrip.StartTime.split(" ");
      if (arr.length > 1) {
        return arr[1].substr(0, "06:00".length);
      }
    }
  }
  getDate() {
    if (this.orderTrip && this.orderTrip.StartTime) {
      if (this.orderTrip.StartTime.includes("T")) {
        return this.orderTrip.StartTime.split("T")[0];
      }
      const arr = this.orderTrip.StartTime.split(" ");
      return arr.length ? arr[0] : "";
    }
    return "";
  }
}
