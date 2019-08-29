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
  private bookChannals = `Eterm  BlueSky  Android  客户H5  IOS  外购PC  客户PC  代理PC`;
  private selfBookChannals = `Android  客户H5  IOS 客户PC`;
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
  isSelfBook(channal: string) {
    return this.selfBookChannals.includes(channal);
  }
  ngOnInit() {}
}
