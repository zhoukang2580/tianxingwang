import { AppHelper } from './../../../appHelper';
import { OrderItemHelper } from "./../../../flight/models/flight/OrderItemHelper";
import { Component, OnInit } from "@angular/core";
import { OrderItemEntity } from "../../models/OrderEntity";

@Component({
  selector: "app-order-item-price-popover",
  templateUrl: "./order-item-price-popover.component.html",
  styleUrls: ["./order-item-price-popover.component.scss"]
})
export class OrderItemPricePopoverComponent implements OnInit {
  amount: number;
  orderItems: OrderItemEntity[];
  OrderItemHelper = OrderItemHelper;
  IsShowServiceFee = false;
  isAgent=false;
  constructor() { }
  abs(item: number) {
    return Math.abs(item);
  }
  ngOnInit() { }

  getAmount(
    args: OrderItemHelper | [OrderItemHelper],
    amountFromVariable?: string
  ) {
    if (!args || !this.orderItems) {
      return 0;
    }
    const tags = args instanceof Array ? args : [args];
    return this.orderItems
      .filter(it => tags.some(t => t == it.Tag))
      .reduce((acc, item) => {
        if (amountFromVariable) {
          item.VariablesJsonObj =
            item.VariablesJsonObj || JSON.parse(item.Variables) || {};
          acc = AppHelper.add(acc, +item.VariablesJsonObj[amountFromVariable] || 0);
        } else {
          acc = AppHelper.add(acc, +item.Amount || 0);
        }
        return acc;
      }, 0);
  }
}
