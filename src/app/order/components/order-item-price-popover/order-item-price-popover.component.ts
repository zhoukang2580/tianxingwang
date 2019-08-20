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
  insurance: number;
  items: { name: string; amount: number }[];
  constructor() {}
  abs(item: number) {
    return Math.abs(item);
  }
  ngOnInit() {
    this.items = this.getPriceItems();
    console.log("orderItems", this.orderItems, this.items);
  }
  private getPriceItems() {
    const items: { name: string; amount: number }[] = [];
    if (!this.orderItems) {
      return items;
    }
    const orderItems = this.orderItems;
    this.orderItems.forEach(it => {
      switch (it.Tag) {
        case OrderItemHelper.FlightTicket: {
          items.push({
            name: "机票票价",
            amount: this.getAmount(OrderItemHelper.FlightTicket, orderItems)
          });
          break;
        }
        case OrderItemHelper.FlightTicketTax: {
          items.push({
            name: "机票税收",
            amount: this.getAmount(OrderItemHelper.FlightTicketTax, orderItems)
          });
          break;
        }
        case OrderItemHelper.FlightTicketOnlineFee:
        case OrderItemHelper.FlightTicketOfflineFee: {
          items.push({
            name: "服务费",
            amount: this.getAmount(
              [
                OrderItemHelper.FlightTicketOfflineFee,
                OrderItemHelper.FlightTicketOnlineFee
              ],
              orderItems
            )
          });
          break;
        }
        case OrderItemHelper.FlightTicketRate:
        case OrderItemHelper.FlightTicketReward: {
          items.push({
            name: "代理费率",
            amount: this.getAmount(
              [
                OrderItemHelper.FlightTicketReward,
                OrderItemHelper.FlightTicketRate
              ],
              orderItems,
              "TmcRate"
            )
          });
          break;
        }
        case OrderItemHelper.FlightTicketRate:
        case OrderItemHelper.FlightTicketReward: {
          items.push({
            name: "代理费",
            amount: this.getAmount(
              [
                OrderItemHelper.FlightTicketRate,
                OrderItemHelper.FlightTicketReward
              ],
              orderItems
            )
          });
          break;
        }
        case OrderItemHelper.FlightTicketExchange: {
          items.push({
            name: "机票改签费",
            amount: this.getAmount(
              [OrderItemHelper.FlightTicketExchange],
              orderItems
            )
          });
          break;
        }
        case OrderItemHelper.FlightTicketExchangeTax: {
          items.push({
            name: "机票改签税收",
            amount: this.getAmount(
              [OrderItemHelper.FlightTicketExchangeTax],
              orderItems
            )
          });
          break;
        }
        case OrderItemHelper.FlightTicketExchangeApiFee:
        case OrderItemHelper.FlightTicketExchangeOfflineFee:
        case OrderItemHelper.FlightTicketExchangeOnlineFee: {
          items.push({
            name: "改签服务费",
            amount: this.getAmount(
              [
                OrderItemHelper.FlightTicketExchangeApiFee,
                OrderItemHelper.FlightTicketExchangeOfflineFee,
                OrderItemHelper.FlightTicketExchangeOnlineFee
              ],
              orderItems
            )
          });
          break;
        }
        case OrderItemHelper.FlightTicketExchangeRate:
        case OrderItemHelper.FlightTicketExchangeOnlineFee: {
          items.push({
            name: "改签代理费率",
            amount: this.getAmount(
              [
                OrderItemHelper.FlightTicketExchangeRate,
                OrderItemHelper.FlightTicketExchangeOnlineFee
              ],
              orderItems,
              "TmcRate"
            )
          });
          break;
        }
        case OrderItemHelper.FlightTicketExchangeRate:
        case OrderItemHelper.FlightTicketExchangeReward: {
          items.push({
            name: "改签代理费",
            amount: this.getAmount(
              [
                OrderItemHelper.FlightTicketExchangeRate,
                OrderItemHelper.FlightTicketExchangeReward
              ],
              orderItems
            )
          });
          break;
        }
        case OrderItemHelper.FlightTicketRefund: {
          items.push({
            name: "退票票面价",
            amount: this.getAmount(
              [OrderItemHelper.FlightTicketRefund],
              orderItems
            )
          });
          break;
        }
        case OrderItemHelper.FlightTicketRefundTax: {
          items.push({
            name: "退票税收",
            amount: this.getAmount(
              [OrderItemHelper.FlightTicketRefundTax],
              orderItems
            )
          });
          break;
        }
        case OrderItemHelper.FlightTicketRefundUsedTicket: {
          items.push({
            name: "机票退票已用票价",
            amount: this.getAmount(
              [OrderItemHelper.FlightTicketRefundUsedTicket],
              orderItems
            )
          });
          break;
        }
        case OrderItemHelper.FlightTicketRefundUsedTax: {
          items.push({
            name: "机票退票已用税收",
            amount: this.getAmount(
              [OrderItemHelper.FlightTicketRefundUsedTax],
              orderItems
            )
          });
          break;
        }
        case OrderItemHelper.FlightTicketRefundDeduction: {
          items.push({
            name: "机票退票手续费",
            amount: this.getAmount(
              [OrderItemHelper.FlightTicketRefundDeduction],
              orderItems
            )
          });
          break;
        }
        case OrderItemHelper.FlightTicketRefundApiFee:
        case OrderItemHelper.FlightTicketRefundOfflineFee:
        case OrderItemHelper.FlightTicketExchangeOnlineFee: {
          items.push({
            name: "退票服务费",
            amount: this.getAmount(
              [
                OrderItemHelper.FlightTicketRefundApiFee,
                OrderItemHelper.FlightTicketRefundOfflineFee,
                OrderItemHelper.FlightTicketExchangeOnlineFee
              ],
              orderItems
            )
          });
          break;
        }
        case OrderItemHelper.FlightTicketRefundRate:
        case OrderItemHelper.FlightTicketRefundReward: {
          items.push({
            name: "退票代理费率",
            amount: this.getAmount(
              [
                OrderItemHelper.FlightTicketRefundRate,
                OrderItemHelper.FlightTicketRefundReward
              ],
              orderItems,
              "TmcRate"
            )
          });
          break;
        }
      }
    });
    if (this.insurance) {
      items.push({
        name: "航班意外险",
        amount: this.insurance
      });
    }
    return items;
  }
  private getAmount(
    args: OrderItemHelper | [OrderItemHelper],
    orderItems: OrderItemEntity[],
    amountFromVariable?: string
  ) {
    const tags = args instanceof Array ? args : [args];
    return orderItems
      .filter(it => tags.some(t => t == it.Tag))
      .reduce((acc, item) => {
        if (amountFromVariable) {
          item.VariablesJsonObj =
            item.VariablesJsonObj || JSON.parse(item.Variables) || {};
          acc += +item.VariablesJsonObj[amountFromVariable] || 0;
        } else {
          acc += +item.Amount || 0;
        }
        return acc;
      }, 0);
  }
}
