import { Component, OnInit, Input } from "@angular/core";
import { OrderFlightTripStatusType } from "src/app/order/models/OrderFlightTripStatusType";
import { OrderModel } from "src/app/order/models/OrderModel";

@Component({
  selector: "app-product-hotel",
  templateUrl: "./product-hotel.component.html",
  styleUrls: ["./product-hotel.component.scss"]
})
export class ProductHotelComponent implements OnInit {
  @Input() orderModel: OrderModel;
  constructor() {}

  ngOnInit() {}
}
