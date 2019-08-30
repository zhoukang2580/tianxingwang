import { Component, OnInit, Input } from "@angular/core";
import { OrderTripModel } from "../../models/OrderTripModel";

@Component({
  selector: "app-order-trip",
  templateUrl: "./order-trip.component.html",
  styleUrls: ["./order-trip.component.scss"]
})
export class OrderTripComponent implements OnInit {
  @Input() orderTrip: OrderTripModel;
  constructor() {}

  ngOnInit() {}
}
