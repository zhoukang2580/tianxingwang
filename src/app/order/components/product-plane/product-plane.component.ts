
import { Component, OnInit, Input } from "@angular/core";
import { OrderModel } from "src/app/order/models/OrderModel";
import { OrderFlightTripStatusType } from 'src/app/order/models/OrderFlightTripStatusType';


@Component({
  selector: "app-product-plane",
  templateUrl: "./product-plane.component.html",
  styleUrls: ["./product-plane.component.scss"]
})
export class ProductPlaneComponent implements OnInit {
  @Input() orderModel: OrderModel;
  constructor() {}

  ngOnInit() {}
  
}
