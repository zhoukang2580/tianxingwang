import { Component, OnInit, Input } from "@angular/core";
import { OrderTripModel } from "../../models/OrderTripModel";
import { CalendarService } from "src/app/tmc/calendar.service";

@Component({
  selector: "app-order-flight-trip",
  templateUrl: "./order-flight-trip.component.html",
  styleUrls: ["./order-flight-trip.component.scss"]
})
export class OrderFlightTripComponent implements OnInit {
  @Input() orderTrip: OrderTripModel;
  constructor(private calendarService: CalendarService) {
    // this.orderTrip = {} as any;
    // this.orderTrip.OrderId = "190000047694";
    // this.orderTrip.Status = "已出票";
    // this.orderTrip.OrderTicketId = "1900000476945";
    // this.orderTrip.StartTime = "2019-08-31 09:25";
    // this.orderTrip.FromName = "上海虹桥国际机场 T2";
    // this.orderTrip.ToName = "武汉天河国际机场 T3";
    // this.orderTrip.Number = "MU2510";
  }
  getWeekName(dt: string) {
    if (!dt) {
      return "";
    }
    return this.calendarService.getDayOfWeekNames()[new Date(dt).getDay()];
  }
  ngOnInit() {}
}
