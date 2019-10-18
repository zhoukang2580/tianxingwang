import { AppHelper } from 'src/app/appHelper';
import { TmcEntity } from 'src/app/tmc/tmc.service';
import { TmcService } from './../../../tmc/tmc.service';
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { OrderEntity, OrderStatusType } from "src/app/order/models/OrderEntity";
import { OrderFlightTripStatusType } from "src/app/order/models/OrderFlightTripStatusType";
import { OrderTravelPayType } from '../../models/OrderTravelEntity';
import { OrderFlightTicketStatusType } from '../../models/OrderFlightTicketStatusType';
import { OrderTrainTicketStatusType } from '../../models/OrderTrainTicketStatusType';
import { OrderFlightTicketEntity } from '../../models/OrderFlightTicketEntity';
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
  private tmc: TmcEntity;
  constructor(private tmcService: TmcService) {
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
  async ngOnInit() {
    this.tmc = await this.tmcService.getTmc().catch(_ => null);
  }
  checkPay() {
    const order = this.order;
    if (!order) {
      return false;
    }
    if (order.Status == OrderStatusType.WaitHandle) { return false; }
    let rev = order.PayAmount < order.TotalAmount &&
      (order.GetVariable<number>("TravelPayType") ==
        OrderTravelPayType.Credit
        ||
        order.GetVariable<number>("TravelPayType") ==
        OrderTravelPayType.Person) && order.Status != OrderStatusType.Cancel;
    if (!rev) { return false; }
    rev = !order.OrderFlightTickets ||
      order.OrderFlightTickets.filter(it => it.Status == OrderFlightTicketStatusType.Booking ||
        it.Status == OrderFlightTicketStatusType.BookExchanging).length == 0;
    if (!rev) { return false; }
    rev = !order.OrderTrainTickets ||
      order.OrderTrainTickets.filter(it => it.Status == OrderTrainTicketStatusType.Booking ||
        it.Status == OrderTrainTicketStatusType.BookExchanging).length == 0;
    return rev;
  }
  getTotalAmount(order: OrderEntity, key: string) {
    let amount = 0;
    const Tmc = this.tmc;
    if (!order) {
      return amount;
    }
    if (!order.OrderItems || !Tmc) { return amount; }
    if (Tmc.IsShowServiceFee) {
      amount = order.OrderItems
        .filter(it => it.Key == key)
        .reduce((acc, it) => { acc = AppHelper.add(acc, +it.Amount); return acc; }, 0);
    }
    else {
      amount = order.OrderItems
        .filter(it => it.Key == key && !(it.Tag || "").endsWith("Fee"))
        .reduce((acc, it) => { acc = AppHelper.add(acc, +it.Amount); return acc; }, 0);
    }
    return amount;
  }
  orderFlightTicketIsReject(orderFlightTicket:OrderFlightTicketEntity){
    return orderFlightTicket&&orderFlightTicket.GetVariable<boolean>("IsReject");
  }
}
