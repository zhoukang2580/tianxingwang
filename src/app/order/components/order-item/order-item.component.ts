import { PassengerBookInfo } from 'src/app/tmc/tmc.service';
import { TrainService, ITrainInfo } from './../../../train/train.service';
import { CalendarService } from './../../../tmc/calendar.service';
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
import { OrderTrainTicketEntity } from '../../models/OrderTrainTicketEntity';
import { TrainBookType } from 'src/app/train/models/TrainBookType';
import { OrderHotelStatusType } from '../../models/OrderHotelEntity';
import { HotelPaymentType } from 'src/app/hotel/models/HotelPaymentType';
import { TrainSupplierType } from 'src/app/train/models/TrainSupplierType';
import { TripType } from 'src/app/tmc/models/TripType';
import * as moment from 'moment';
import { Router } from '@angular/router';
@Component({
  selector: "app-order-item",
  templateUrl: "./order-item.component.html",
  styleUrls: ["./order-item.component.scss"]
})
export class OrderItemComponent implements OnInit {
  private bookChannals = `Eterm  BlueSky  Android  客户H5  IOS  外购PC  客户PC  代理PC`;
  private selfBookChannals = `Android  客户H5  IOS 客户PC`;
  TrainSupplierType = TrainSupplierType;
  @Input() order: OrderEntity;
  @Output() payaction: EventEmitter<OrderEntity>;
  OrderStatusType = OrderStatusType;
  OrderFlightTripStatusType = OrderFlightTripStatusType;
  OrderFlightTicketStatusType = OrderFlightTicketStatusType;
  OrderTrainTicketStatusType = OrderTrainTicketStatusType;
  OrderHotelStatusType = OrderHotelStatusType;
  HotelPaymentType = HotelPaymentType;
  TrainBookType = TrainBookType;
  tmc: TmcEntity;
  constructor(private tmcService: TmcService,
    private calendarService: CalendarService,
    private router: Router,
    private trainService: TrainService) {
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
  async onExchange(evt: CustomEvent, orderTrainTicket: OrderTrainTicketEntity) {
    if (evt) { evt.stopPropagation(); }
    return this.trainService.onExchange(orderTrainTicket);
  }
  onRefund(evt: CustomEvent, orderTrainTicket: OrderTrainTicketEntity) {
    if (evt) {
      evt.stopPropagation();
    }
    if (orderTrainTicket) {
      this.trainService.refund(orderTrainTicket.Id);
    }
  }
  isSelfBook(channal: string) {
    return this.selfBookChannals.includes(channal);
  }
  async ngOnInit() {
    this.tmc = await this.tmcService.getTmc().catch(_ => null);
  }
  getHHmm(time: string) {
    if (time) {
      return this.calendarService.getHHmm(time);
    }
  }
  checkPay() {
    const order = this.order;
    if (!order) {
      return false;
    }
    order.VariablesJsonObj = order.VariablesJsonObj || JSON.parse(order.Variables) || {};
    if (order.Status == OrderStatusType.WaitHandle) { return false; }
    let rev = order.PayAmount < order.TotalAmount &&
      (order.VariablesJsonObj["TravelPayType"] ==
        OrderTravelPayType.Credit
        ||
        order.VariablesJsonObj["TravelPayType"] ==
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
    if (!order || !order.OrderItems || !Tmc) {
      return amount;
    }
    if (Tmc.IsShowServiceFee) {
      amount = order.OrderItems
        .filter(it => it.Key == key)
        .reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
    } else {
      amount = order.OrderItems
        .filter(it => it.Key == key && !(it.Tag || "").endsWith("Fee"))
        .reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
    }
    return amount;
  }
  ticketIsReject(orderFlightTicket: { Variables: string; VariablesJsonObj: any }) {
    orderFlightTicket.VariablesJsonObj = orderFlightTicket.VariablesJsonObj || JSON.parse(orderFlightTicket.Variables) || {};
    return orderFlightTicket && orderFlightTicket.VariablesJsonObj["IsReject"];
  }
  flightInsuranceAmount(orderFlightTicket: OrderFlightTicketEntity) {
    let amount = 0;
    if (orderFlightTicket && this.order && this.order.OrderItems) {
      const flighttripKeys = orderFlightTicket.OrderFlightTrips && orderFlightTicket.OrderFlightTrips.map(it => it.Key) || [];
      const keys = this.order.OrderInsurances && this.order.OrderInsurances
        .filter(it => flighttripKeys.some(fk => fk == it.AdditionKey)).map(it => it.Key) || [];
      amount = this.order.OrderItems
        .filter(it => keys.some(k => k == it.Key))
        .reduce((acc, it) => { acc = AppHelper.add(acc, +it.Amount); return acc; }, 0);
    }
    return amount;
  }
  trainInsuranceAmount(orderTrainTicket: OrderTrainTicketEntity) {
    let amount = 0;
    if (this.order && this.order.OrderItems) {
      const flighttripKeys = orderTrainTicket.OrderTrainTrips && orderTrainTicket.OrderTrainTrips.map(it => it.Key) || [];
      const keys = this.order.OrderInsurances && this.order.OrderInsurances
        .filter(it => flighttripKeys.includes(it.AdditionKey)).map(it => it.Key) || [];
      amount = this.order.OrderItems
        .filter(it => keys.includes(it.Key))
        .reduce((acc, it) => { acc = AppHelper.add(acc, +it.Amount); return acc; }, 0);
    }
    return amount;
  }
}
