import { OrderPassengerEntity } from "./../../models/OrderPassengerEntity";
import { OrderFlightTicketEntity } from "./../../models/OrderFlightTicketEntity";
import { AppHelper } from "./../../../appHelper";
import { OrderItemHelper } from "./../../../flight/models/flight/OrderItemHelper";
import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChildren,
  QueryList,
  Renderer2
} from "@angular/core";
import { OrderItemEntity, OrderEntity } from "../../models/OrderEntity";
import { IonGrid } from "@ionic/angular";
@Component({
  selector: "app-order-item-price-popover",
  templateUrl: "./order-item-price-popover.component.html",
  styleUrls: ["./order-item-price-popover.component.scss"]
})
export class OrderItemPricePopoverComponent implements OnInit, AfterViewInit {
  @ViewChildren(IonGrid) iongrids: QueryList<IonGrid>;
  order: OrderEntity;
  amount: number;
  orderItems: OrderItemEntity[];
  OrderItemHelper = OrderItemHelper;
  // IsShowServiceFee = false;
  constructor(private render: Renderer2) {}
  abs(item: number) {
    return Math.abs(item);
  }
  ngAfterViewInit() {
    if (this.iongrids) {
      setTimeout(() => {
        if (this.iongrids && this.iongrids.length) {
          let maxHeight = 0;
          this.iongrids.forEach(it => {
            if (it["el"]) {
              maxHeight = Math.max(maxHeight, it["el"].clientHeight);
              const prices = it["el"].querySelectorAll(".price");
              const amountEle = it["el"].querySelector(".amount");
              let amount = 0;
              if (amountEle && prices) {
                prices.forEach(p => {
                  if (p && !p.classList.contains("total") && +p.textContent) {
                    amount += +p.textContent;
                  }
                });
                amountEle.textContent = `${amount}`;
              }
            }
            requestAnimationFrame(_ => {
              this.render.setStyle(it["el"], "height", `${maxHeight}px`);
            });
          });
        }
      }, 200);
    }
  }
  ngOnInit() {}
  getPassenger(t: OrderFlightTicketEntity): OrderPassengerEntity {
    if (!t || !t.Passenger) {
      return null;
    }
    return (
      this.order &&
      this.order.OrderPassengers &&
      this.order.OrderPassengers.find(it => it.Id == t.Passenger.Id)
    );
  }
  getAmount(
    ticket: OrderFlightTicketEntity,
    args: OrderItemHelper | [OrderItemHelper],
    amountFromVariable?: string
  ) {
    if (!args || !this.orderItems) {
      return 0;
    }
    const tags = args instanceof Array ? args : [args];
    const amount = this.orderItems
      .filter(
        it =>
          it.Key == (ticket && ticket.Key) ||
          (it.Tag || "").toLowerCase().includes("insurance")
      )
      .filter(it => tags.some(t => t == it.Tag))
      .reduce((acc, item) => {
        if (amountFromVariable) {
          item.VariablesJsonObj =
            item.VariablesJsonObj || JSON.parse(item.Variables) || {};
          acc = AppHelper.add(
            acc,
            +item.VariablesJsonObj[amountFromVariable] || 0
          );
        } else {
          acc = AppHelper.add(acc, +item.Amount || 0);
        }
        return acc;
      }, 0);
    return amount > 0 ? amount : 0;
  }
}
