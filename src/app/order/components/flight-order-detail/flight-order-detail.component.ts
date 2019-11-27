import { OrderEntity } from '../../models/OrderEntity';
import { OrderFlightTicketStatusType } from "src/app/order/models/OrderFlightTicketStatusType";
import { Component, OnInit, Input } from "@angular/core";
import { OrderFlightTripEntity } from 'src/app/order/models/OrderFlightTripEntity';
import { OrderFlightTripStatusType } from 'src/app/order/models/OrderFlightTripStatusType';
import { AppHelper } from 'src/app/appHelper';
@Component({
  selector: "app-flight-order-detail",
  templateUrl: "./flight-order-detail.component.html",
  styleUrls: ["./flight-order-detail.component.scss"]
})
export class FlightOrderDetailComponent implements OnInit {
  @Input() trips: OrderFlightTripEntity[];
  @Input() order: OrderEntity;
  OrderFlightTicketStatusType = OrderFlightTicketStatusType;
  constructor() { }
  ngOnInit() { }
  hasOriginalFlightTrip() {
    return this.order
      && this.order.OrderFlightTickets
      && this.order.OrderFlightTickets
        .filter(it => it.OrderFlightTrips
          && it.OrderFlightTrips
            .filter(t => t.Status == OrderFlightTripStatusType.Exchange||t.Status == OrderFlightTripStatusType.Refund)
            .length > 0)
        .length > 0;
  }
  getOriginalFlightTrips() {
    let trips: OrderFlightTripEntity[] = [];
    if (this.order && this.order.OrderFlightTickets) {
      this.order.OrderFlightTickets.forEach(t => {
        if (t.OrderFlightTrips) {
          t.OrderFlightTrips.filter(it => AppHelper.getDate(it.InsertTime).getTime() < AppHelper.getDate(t.IssueTime).getTime() || AppHelper.getDate(t.IssueTime).getTime() <= AppHelper.getDate("1800/01/01T00:00:00").getTime()).forEach(trip => {
            trip.VariablesJsonObj = trip.VariablesJsonObj || JSON.parse(trip.Variables) || {};
            trips.push(trip);
          })
        }
      })
    }
    return trips;
  }
}
