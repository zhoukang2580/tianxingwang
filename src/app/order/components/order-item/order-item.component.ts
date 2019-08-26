import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { OrderEntity, OrderStatusType } from "src/app/order/models/OrderEntity";
import { OrderFlightTripStatusType } from "src/app/order/models/OrderFlightTripStatusType";
@Component({
  selector: "app-order-item",
  templateUrl: "./order-item.component.html",
  styleUrls: ["./order-item.component.scss"]
})
export class OrderItemComponent implements OnInit {
  @Input() order: OrderEntity;
  @Output() payaction: EventEmitter<OrderEntity>;
  OrderStatusType = OrderStatusType;
  OrderFlightTripStatusType = OrderFlightTripStatusType;
  constructor() {
    this.payaction = new EventEmitter();
  }
  onPay(evt: CustomEvent) {
    if (this.order) {
      if (this.order.Status == OrderStatusType.WaitPay) {
        this.payaction.emit(this.order);
      }
    }
    evt.preventDefault();
    evt.stopPropagation();
  }
  ngOnInit() {}
}
