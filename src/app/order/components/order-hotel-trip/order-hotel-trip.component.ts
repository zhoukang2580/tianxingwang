import { Component, OnInit, Input } from "@angular/core";
import { OrderTripModel } from "../../models/OrderTripModel";

@Component({
  selector: "app-order-hotel-trip",
  templateUrl: "./order-hotel-trip.component.html",
  styleUrls: ["./order-hotel-trip.component.scss"]
})
export class OrderHotelTripComponent implements OnInit {
  @Input() orderTrip: OrderTripModel;
  constructor() {}

  ngOnInit() {}
  
}
