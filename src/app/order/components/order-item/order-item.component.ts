import { Component, OnInit, Input } from "@angular/core";
import { OrderEntity } from "src/app/order/models/OrderEntity";
import { OrderFlightTripStatusType } from "src/app/order/models/OrderFlightTripStatusType";
@Component({
  selector: "app-order-item",
  templateUrl: "./order-item.component.html",
  styleUrls: ["./order-item.component.scss"]
})
export class OrderItemComponent implements OnInit {
  @Input() order: OrderEntity;
  OrderFlightTripStatusType = OrderFlightTripStatusType;
  constructor() {}

  ngOnInit() {}
}
