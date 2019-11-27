import { OrderEntity } from '../../models/OrderEntity';
import { OrderFlightTicketStatusType } from "src/app/order/models/OrderFlightTicketStatusType";
import { Component, OnInit, Input } from "@angular/core";
import { OrderFlightTripEntity } from 'src/app/order/models/OrderFlightTripEntity';
import { OrderFlightTripStatusType } from 'src/app/order/models/OrderFlightTripStatusType';
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
            .filter(t => t.Status == OrderFlightTripStatusType.Exchange)
            .length > 0)
        .length > 0;
  }
  getOriginalFlightTrips() {
    let trips: OrderFlightTripEntity[] = [];
    if (this.order && this.order.OrderFlightTickets) {
      this.order.OrderFlightTickets.forEach(t => {
        if (t.OrderFlightTrips) {
          t.OrderFlightTrips.filter(it => new Date(`${it.InsertTime}`.replace(/-/g,'/')).getTime() < new Date(`${t.IssueTime}`.replace(/-/g,'/')).getTime() || new Date(`${t.IssueTime}`.replace(/-/g,'/')).getTime() <= new Date("1800/01/01T00:00:00").getTime()).forEach(trip => {
            trip.VariablesJsonObj = trip.VariablesJsonObj || JSON.parse(trip.Variables) || {};
            trips.push(trip);
          })
        }
      })
    }
    return trips;
  }
}
