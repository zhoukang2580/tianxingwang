import { environment } from "./../../../../environments/environment";
import { OrderFlightTripEntity } from "./../../models/OrderFlightTripEntity";
import { TrainService } from "./../../../train/train.service";
import { CalendarService } from "./../../../tmc/calendar.service";
import { AppHelper } from "src/app/appHelper";
import { TmcEntity } from "src/app/tmc/tmc.service";
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
  OnDestroy
} from "@angular/core";
import { OrderEntity, OrderStatusType } from "src/app/order/models/OrderEntity";
import { OrderFlightTripStatusType } from "src/app/order/models/OrderFlightTripStatusType";
import { OrderTravelPayType } from "../../models/OrderTravelEntity";
import { OrderFlightTicketStatusType } from "../../models/OrderFlightTicketStatusType";
import { OrderTrainTicketStatusType } from "../../models/OrderTrainTicketStatusType";
import { OrderFlightTicketEntity } from "../../models/OrderFlightTicketEntity";
import { OrderTrainTicketEntity } from "../../models/OrderTrainTicketEntity";
import { TrainBookType } from "src/app/train/models/TrainBookType";
import { OrderHotelStatusType } from "../../models/OrderHotelEntity";
import { HotelPaymentType } from "src/app/hotel/models/HotelPaymentType";
import { TrainSupplierType } from "src/app/train/models/TrainSupplierType";
import { Router } from "@angular/router";
import { OrderPassengerEntity } from "../../models/OrderPassengerEntity";
import { OrderFlightTicketType } from "../../models/OrderFlightTicketType";
import {
  PopoverController,
  PickerController,
  IonDatetime
} from "@ionic/angular";
import { RefundFlightTicketTipComponent } from "../refund-flight-ticket-tip/refund-flight-ticket-tip.component";
import { OrderService } from "../../order.service";
import { LanguageHelper } from "src/app/languageHelper";
import { DayModel } from "src/app/tmc/models/DayModel";
@Component({
  selector: "app-order-item",
  templateUrl: "./order-item.component.html",
  styleUrls: ["./order-item.component.scss"]
})
export class OrderItemComponent implements OnInit, OnChanges {
  private selfBookChannals = `Android  客户H5  IOS 客户PC`;
  TrainSupplierType = TrainSupplierType;
  OrderFlightTicketType = OrderFlightTicketType;
  OrderTravelPayType = OrderTravelPayType;
  @Input() order: OrderEntity;
  @Input() isAgent = false;
  @Output() payaction: EventEmitter<OrderEntity>;
  @Output() refundTrainTicket: EventEmitter<OrderEntity>;
  @Output() exchangeFlightTicket: EventEmitter<{
    orderId: string;
    ticketId: string;
    trip: OrderFlightTripEntity;
  }>;
  @Output() abolishFlightOrder: EventEmitter<{
    orderId: string;
    ticketId: string;
  }>;
  @Output() refundFlightTicket: EventEmitter<{
    orderId: string;
    ticketId: string;
    IsVoluntary: boolean;
    FileName: string;
    FileValue: string;
  }>;
  @Input() tmc: TmcEntity;
  @ViewChild(IonDatetime) dateTime: IonDatetime;
  OrderStatusType = OrderStatusType;
  OrderFlightTripStatusType = OrderFlightTripStatusType;
  OrderFlightTicketStatusType = OrderFlightTicketStatusType;
  OrderTrainTicketStatusType = OrderTrainTicketStatusType;
  OrderHotelStatusType = OrderHotelStatusType;
  HotelPaymentType = HotelPaymentType;
  TrainBookType = TrainBookType;
  environment = environment;
  constructor(
    private calendarService: CalendarService,
    private popoverCtrl: PopoverController,
    private trainService: TrainService,
    private orderService: OrderService
  ) {
    this.payaction = new EventEmitter();
    this.refundTrainTicket = new EventEmitter();
    this.refundFlightTicket = new EventEmitter();
    this.abolishFlightOrder = new EventEmitter();
    this.exchangeFlightTicket = new EventEmitter();
  }
  onPay(evt: CustomEvent) {
    if (this.order) {
      this.payaction.emit(this.order);
    }
    evt.preventDefault();
    evt.stopPropagation();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.order && changes.order.currentValue) {
      if (this.order) {
        this.order["checkPay"] = this.checkPay();
        this.order.VariablesJsonObj =
          this.order.VariablesJsonObj || JSON.parse(this.order.Variables);
        if (this.order.OrderFlightTickets) {
          this.order.OrderFlightTickets = this.order.OrderFlightTickets.map(
            t => {
              if (t.Variables && !t.VariablesJsonObj) {
                t.VariablesJsonObj =
                  t.VariablesJsonObj || JSON.parse(t.Variables) || {};
              }
              if (t.OrderFlightTrips) {
                t.OrderFlightTrips = t.OrderFlightTrips.map(trip => {
                  if (
                    !trip.OrderFlightTicket ||
                    !trip.OrderFlightTicket.Passenger
                  ) {
                    trip.OrderFlightTicket = {
                      Id: t.Id,
                      Passenger: t.Passenger
                    } as any;
                  }
                  return trip;
                });
                t.OrderFlightTrips.sort((t1, t2) => {
                  return (
                    AppHelper.getDate(t1.TakeoffTime).getTime() -
                    AppHelper.getDate(t2.TakeoffTime).getTime()
                  );
                });
              }
              t.VariablesJsonObj.isShowBtnByTimeAndTicketType = this.showBtnByTimeAndTicketType(
                t
              );
              t.VariablesJsonObj.isTicketCanRefund = this.isTicketCanRefund(t);
              t.VariablesJsonObj.isShowExchangeBtn = this.isShowExchangeBtn(t);
              t.VariablesJsonObj.isShowCancelBtn = this.isShowCancelBtn(t);
              return t;
            }
          );
        }
        this.initPassengers();
        this.order.OrderFlightTickets=this.orderService.checkIfOrderFlightTicketShow(this.order.OrderFlightTickets);
      }
    }
  }
  private sortOrderFlightTicketsByTime(arr: OrderFlightTicketEntity[]) {
    const result = ((arr && arr.slice(0)) || []).filter(
      t => t.OrderFlightTrips && t.OrderFlightTrips.length > 0
    );
    result.sort((t1, t2) => {
      return (
        AppHelper.getDate(t1.OrderFlightTrips[0].TakeoffDate).getTime() -
        AppHelper.getDate(t2.OrderFlightTrips[0].TakeoffDate).getTime()
      );
    });
    return result;
  }
  // private checkIfOrderFlightTicketShow() {
  //   if (this.order && this.order.OrderFlightTickets) {
  //     const statusArr = [
  //       OrderFlightTicketStatusType.ChangeTicket,
  //       // OrderFlightTicketStatusType.Refunded
  //     ];
  //     this.order.OrderFlightTickets = this.order.OrderFlightTickets.map(t => {
  //       if (t.VariablesJsonObj) {
  //         const isShow = !statusArr.some(s => s == t.Status);
  //         t.VariablesJsonObj.isShow = !t.VariablesJsonObj.IsScrap && isShow;
  //       }
  //       return t;
  //     });
  //   }
  // }
  check(orderTrainTicket: OrderTrainTicketEntity) {
    return (
      orderTrainTicket &&
      orderTrainTicket.OrderTrainTrips &&
      orderTrainTicket.OrderTrainTrips.length == 1 &&
      +this.calendarService.getMoment(
        0,
        orderTrainTicket.OrderTrainTrips[0].StartTime
      ) -
        +this.calendarService.getMoment(0) >
        0
    );
  }
  async onExchangeTrainTicket(
    evt: CustomEvent,
    orderTrainTicket: OrderTrainTicketEntity
  ) {
    if (evt) {
      evt.stopPropagation();
    }

    return this.trainService.onExchange(orderTrainTicket);
  }
  private isTicketCanRefund(orderFlightTicket: OrderFlightTicketEntity) {
    if (
      !this.tmc ||
      !this.tmc.FlightIsAllowRefund ||
      !orderFlightTicket ||
      !this.showBtnByTimeAndTicketType(orderFlightTicket)
    ) {
      return false;
    }
    return [
      OrderFlightTicketStatusType.Issued,
      OrderFlightTicketStatusType.Exchanged
    ].includes(orderFlightTicket && orderFlightTicket.Status);
  }
  private showBtnByTimeAndTicketType(
    orderFlightTicket: OrderFlightTicketEntity
  ) {
    return (
      orderFlightTicket &&
      orderFlightTicket.TicketType == OrderFlightTicketType.Domestic &&
      orderFlightTicket.OrderFlightTrips.some(trip =>
        this.isAfterTomorrow(trip.TakeoffTime)
      )
    );
  }
  private isAfterTomorrow(date: string) {
    const m = this.calendarService.getMoment(0);
    const tomorrow = this.calendarService.getMoment(1, m.format("YYYY-MM-DD"));
    const dm = this.calendarService.getMoment(0, date.substr(0, 10));
    // console.log(tomorrow.format("YYYY-MM-DD"), dm.format("YYYY-MM-DD"));
    return +dm - +tomorrow >= 0;
  }
  private isShowCancelBtn(orderFlightTicket: OrderFlightTicketEntity) {
    if (
      !orderFlightTicket ||
      !this.showBtnByTimeAndTicketType(orderFlightTicket)
    ) {
      return false;
    }
    return [
      OrderFlightTicketStatusType.Booked,
      OrderFlightTicketStatusType.BookExchanged
    ].includes(orderFlightTicket.Status);
  }
  private isShowExchangeBtn(orderFlightTicket: OrderFlightTicketEntity) {
    if (
      !this.tmc ||
      !this.tmc.FlightIsAllowRefund ||
      !orderFlightTicket ||
      !this.showBtnByTimeAndTicketType(orderFlightTicket)
    ) {
      return false;
    }
    return (
      orderFlightTicket &&
      [
        OrderFlightTicketStatusType.Issued,
        OrderFlightTicketStatusType.Exchanged
      ].includes(orderFlightTicket.Status)
    );
  }
  private initPassengers() {
    if (this.order) {
      if (this.order.OrderFlightTickets) {
        this.order.OrderFlightTickets = this.order.OrderFlightTickets.map(t => {
          t.Passenger = this.getTicketPassenger(t);
          return t;
        });
      }
      if (this.order.OrderTrainTickets) {
        this.order.OrderTrainTickets = this.order.OrderTrainTickets.map(t => {
          t.Passenger = this.getTicketPassenger(t);
          return t;
        });
      }
      if (this.order.OrderHotels) {
        this.order.OrderHotels = this.order.OrderHotels.map(t => {
          t.Passenger = this.getTicketPassenger(t);
          t.countDay =
            (AppHelper.getDate(t.EndDate).getTime() -
              AppHelper.getDate(t.BeginDate).getTime()) /
            86400000;

          return t;
        });
      }
    }
  }
  async onExchangeFlightTicket(
    evt: CustomEvent,
    ticket: OrderFlightTicketEntity,
    trip: OrderFlightTripEntity
  ) {
    evt.stopPropagation();
    this.exchangeFlightTicket.emit({
      orderId: this.order.Id,
      ticketId: ticket.Id,
      trip
    });
  }
  onAbolishFlightOrder(evt: CustomEvent, ticket: OrderFlightTicketEntity) {
    evt.stopPropagation();
    AppHelper.alert(
      "确定取消订单？",
      true,
      LanguageHelper.getConfirmTip(),
      LanguageHelper.getCancelTip()
    ).then(ok => {
      if (ok) {
        this.abolishFlightOrder.emit({
          orderId: this.order.Id,
          ticketId: ticket.Id
        });
      }
    });
  }
  private getTicketPassenger(ticket: { Passenger: OrderPassengerEntity }) {
    const p = (this.order && this.order.OrderPassengers) || [];
    return p.find(it => it.Id == (ticket.Passenger && ticket.Passenger.Id));
  }
  getDateWeekName(date: string) {
    if (!date) {
      return "";
    }
    const d = this.calendarService.generateDayModelByDate(date);
    return d.dayOfWeekName;
  }
  getFlightOrderTotalAmount() {
    let amount = 0;
    const order = this.order;
    if (!order || !order.OrderItems) {
      return amount;
    }
    amount = order.OrderItems.reduce(
      (acc, it) => (acc = AppHelper.add(acc, +it.Amount)),
      0
    );
    return amount < 0 ? 0 : amount;
  }
  async onRefundFlightTicket(
    // 退票弹框
    evt: CustomEvent,
    ticket: OrderFlightTicketEntity
  ) {
    if (evt) {
      evt.stopPropagation();
    }
    if (ticket) {
      const popover = await this.popoverCtrl.create({
        component: RefundFlightTicketTipComponent,
        cssClass: "flight-refund-comp",
        translucent: true
      });
      await popover.present();
      const res = await popover.onDidDismiss();
      if (res && res.data) {
        const result = res.data as {
          IsVoluntary: boolean;
          FileName: string;
          FileValue: string;
        };
        this.refundFlightTicket.emit({
          ...result,
          orderId: this.order.Id,
          ticketId: ticket.Id
        });
      }
      // AppHelper.toast();
    }
  }
  async onRefundTrainTicket(
    evt: CustomEvent,
    orderTrainTicket: OrderTrainTicketEntity
  ) {
    if (evt) {
      evt.stopPropagation();
    }
    if (orderTrainTicket) {
      const isRefund = await this.trainService.refund(orderTrainTicket.Id);
      if (isRefund) {
        this.refundTrainTicket.emit();
      }
    }
  }
  isSelfBook(channal: string) {
    return this.selfBookChannals.includes(channal);
  }
  async ngOnInit() {}
  getHHmm(time: string) {
    if (time) {
      return this.calendarService.getHHmm(time);
    }
  }
  private checkPay() {
    const order = this.order;
    if (!order) {
      return false;
    }
    order.VariablesJsonObj =
      order.VariablesJsonObj || JSON.parse(order.Variables) || {};
    if (order.Status == OrderStatusType.WaitHandle) {
      return false;
    }
    let rev =
      order.PayAmount < order.TotalAmount &&
      (order.VariablesJsonObj["TravelPayType"] == OrderTravelPayType.Credit ||
        order.VariablesJsonObj["TravelPayType"] == OrderTravelPayType.Person) &&
      order.Status != OrderStatusType.Cancel;
    if (!rev) {
      return false;
    }
    // rev =
    //   !order.OrderFlightTickets ||
    //   order.OrderFlightTickets.filter(
    //     it =>
    //       it.Status == OrderFlightTicketStatusType.Booking ||
    //       it.Status == OrderFlightTicketStatusType.BookExchanging
    //   ).filter(ticket => {
    //     return ticket.OrderFlightTrips.some(
    //       trip =>
    //         AppHelper.getDate(trip.TakeoffTime).getTime() -
    //           new Date().getTime() >=
    //         0
    //     );
    //   }).length == 0;
    // if (!rev) {
    //   return false;
    // }
    rev =
      !order.OrderTrainTickets ||
      order.OrderTrainTickets.filter(
        it =>
          it.Status == OrderTrainTicketStatusType.Booking ||
          it.Status == OrderTrainTicketStatusType.BookExchanging
      ).length > 0;
    return rev;
  }
  getTotalAmount(order: OrderEntity, key: string) {
    let amount = 0;
    const Tmc = this.tmc;
    if (!order || !order.OrderItems || !Tmc) {
      return amount;
    }
    if (Tmc.IsShowServiceFee) {
      amount = order.OrderItems.filter(it => it.Key == key).reduce(
        (acc, it) => (acc = AppHelper.add(acc, +it.Amount)),
        0
      );
    } else {
      amount = order.OrderItems.filter(
        it => it.Key == key && !(it.Tag || "").endsWith("Fee")
      ).reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
    }
    return amount > 0 ? amount : 0;
  }
  ticketIsReject(orderFlightTicket: {
    Variables: string;
    VariablesJsonObj: any;
  }) {
    orderFlightTicket.VariablesJsonObj =
      orderFlightTicket.VariablesJsonObj ||
      JSON.parse(orderFlightTicket.Variables) ||
      {};
    return orderFlightTicket && orderFlightTicket.VariablesJsonObj["IsReject"];
  }
  flightInsuranceAmount(orderFlightTicket: OrderFlightTicketEntity) {
    let amount = 0;
    if (orderFlightTicket && this.order && this.order.OrderItems) {
      const flighttripKeys =
        (orderFlightTicket.OrderFlightTrips &&
          orderFlightTicket.OrderFlightTrips.map(it => it.Key)) ||
        [];
      const keys =
        (this.order.OrderInsurances &&
          this.order.OrderInsurances.filter(it =>
            flighttripKeys.some(fk => fk == it.AdditionKey)
          ).map(it => it.Key)) ||
        [];
      amount = this.order.OrderItems.filter(it =>
        keys.some(k => k == it.Key)
      ).reduce((acc, it) => {
        acc = AppHelper.add(acc, +it.Amount);
        return acc;
      }, 0);
    }
    return amount;
  }
  trainInsuranceAmount(orderTrainTicket: OrderTrainTicketEntity) {
    let amount = 0;
    if (this.order && this.order.OrderItems) {
      const flighttripKeys =
        (orderTrainTicket.OrderTrainTrips &&
          orderTrainTicket.OrderTrainTrips.map(it => it.Key)) ||
        [];
      const keys =
        (this.order.OrderInsurances &&
          this.order.OrderInsurances.filter(it =>
            flighttripKeys.includes(it.AdditionKey)
          ).map(it => it.Key)) ||
        [];
      amount = this.order.OrderItems.filter(it => keys.includes(it.Key)).reduce(
        (acc, it) => {
          acc = AppHelper.add(acc, +it.Amount);
          return acc;
        },
        0
      );
    }
    return amount;
  }
  getPassengerTicketStatus(p: OrderPassengerEntity) {
    const tickets =
      this.order &&
      this.order.OrderFlightTickets &&
      this.order.OrderFlightTickets.filter(
        t => t.Passenger && t.Passenger.Id == (p && p.Id)
      );
    console.log("getPassengerTicketStatus", tickets);
    if (tickets && tickets.length) {
      return tickets[tickets.length - 1];
    }
    return null;
  }
  getPassengerTrips(ticket: OrderFlightTicketEntity) {
    return (
      ticket.OrderFlightTrips &&
      ticket.OrderFlightTrips.filter(
        it => it.OrderFlightTicket && it.OrderFlightTicket.Id
      )
    );
  }
}
