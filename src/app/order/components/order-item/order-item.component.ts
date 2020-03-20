import { OrderFlightTripEntity } from "./../../models/OrderFlightTripEntity";
import { PassengerBookInfo } from "src/app/tmc/tmc.service";
import { TrainService, ITrainInfo } from "./../../../train/train.service";
import { CalendarService } from "./../../../tmc/calendar.service";
import { AppHelper } from "src/app/appHelper";
import { TmcEntity } from "src/app/tmc/tmc.service";
import { TmcService } from "./../../../tmc/tmc.service";
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
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
import { TripType } from "src/app/tmc/models/TripType";
import * as moment from "moment";
import { Router } from "@angular/router";
import { OrderPassengerEntity } from "../../models/OrderPassengerEntity";
import { OrderFlightTicketType } from "../../models/OrderFlightTicketType";
import { OrderPayStatusType } from "../../models/OrderInsuranceEntity";
import { PopoverController } from '@ionic/angular';
import { RefundFlightTicketTipComponent } from '../refund-flight-ticket-tip/refund-flight-ticket-tip.component';
@Component({
  selector: "app-order-item",
  templateUrl: "./order-item.component.html",
  styleUrls: ["./order-item.component.scss"]
})
export class OrderItemComponent implements OnInit, OnChanges {
  private bookChannals = `Eterm  BlueSky  Android  客户H5  IOS  外购PC  客户PC  代理PC`;
  private selfBookChannals = `Android  客户H5  IOS 客户PC`;
  TrainSupplierType = TrainSupplierType;
  OrderFlightTicketType = OrderFlightTicketType;
  OrderTravelPayType = OrderTravelPayType;
  @Input() order: OrderEntity;
  @Input() isAgent = false;
  @Output() payaction: EventEmitter<OrderEntity>;
  @Output() refundTicket: EventEmitter<OrderEntity>;
  OrderStatusType = OrderStatusType;
  OrderFlightTripStatusType = OrderFlightTripStatusType;
  OrderFlightTicketStatusType = OrderFlightTicketStatusType;
  OrderTrainTicketStatusType = OrderTrainTicketStatusType;
  OrderHotelStatusType = OrderHotelStatusType;
  HotelPaymentType = HotelPaymentType;
  TrainBookType = TrainBookType;
  tmc: TmcEntity;
  constructor(
    private tmcService: TmcService,
    private calendarService: CalendarService,
    private router: Router,
    private popoverCtrl: PopoverController,
    private trainService: TrainService
  ) {
    this.payaction = new EventEmitter();
    this.refundTicket = new EventEmitter();
  }
  onPay(evt: CustomEvent) {
    if (this.order) {
      this.payaction.emit(this.order);
    }
    evt.preventDefault();
    evt.stopPropagation();
  }
  private sortFlightTickets(flightTickets: OrderFlightTicketEntity[]) {
    if (flightTickets) {
      flightTickets = flightTickets.map(t => {
        t.VariablesJsonObj = t.VariablesJsonObj || {};
        t.VariablesJsonObj.maxTimeStamp = Math.max(
          AppHelper.getDate(t.RefundTime).getTime(),
          AppHelper.getDate(t.BookTime).getTime(),
          AppHelper.getDate(t.IssueTime).getTime(),
          AppHelper.getDate(t.ExchangeTime).getTime()
        );
        return t;
      });
      flightTickets.sort(
        (t1, t2) =>
          t1.VariablesJsonObj.maxTimeStamp - t2.VariablesJsonObj.maxTimeStamp
      );
    }
    return flightTickets;
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
              t.VariablesJsonObj.isTicketCanRefund = this.isTicketCanRefund(t);
              t.VariablesJsonObj.isShowExchangeBtn = this.isShowExchangeBtn(t);
              t.VariablesJsonObj.isShowCancelBtn = this.isShowCancelBtn(t);
              return t;
            }
          );
        }
        this.initPassengers();
        this.checkIfOrderFlightTicketShow();
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
  private checkIfOrderFlightTicketShow() {
    if (this.order && this.order.OrderFlightTickets) {
      const originalTicketIdToTickets: {
        [originalId: string]: OrderFlightTicketEntity[];
      } = {};
      this.order.OrderFlightTickets.forEach(t => {
        if (
          t.VariablesJsonObj &&
          t.VariablesJsonObj.OriginalTicketId &&
          !t.VariablesJsonObj.IsScrap
        ) {
          if (originalTicketIdToTickets[t.VariablesJsonObj.OriginalTicketId]) {
            originalTicketIdToTickets[t.VariablesJsonObj.OriginalTicketId].push(
              t
            );
          } else {
            originalTicketIdToTickets[t.VariablesJsonObj.OriginalTicketId] = [
              t
            ];
          }
        }
      });
      Object.keys(originalTicketIdToTickets).forEach(k => {
        originalTicketIdToTickets[k] = this.sortFlightTickets(
          originalTicketIdToTickets[k]
        );
      });
      this.order.OrderFlightTickets = this.order.OrderFlightTickets.map(t => {
        if (t.VariablesJsonObj) {
          const ts = originalTicketIdToTickets[t.Id];
          const last = ts && ts[ts.length - 1];
          const isShow = last
            ? t.VariablesJsonObj.maxTimeStamp ==
              last.VariablesJsonObj.maxTimeStamp
            : true;
          t.VariablesJsonObj.isShow = !t.VariablesJsonObj.IsScrap && isShow;
        }
        return t;
      });
      this.initOrderFlightTicketPassengerIndex();
    }
  }
  private initOrderFlightTicketPassengerIndex() {
    if (this.order && this.order.OrderFlightTickets) {
      let showArr = this.order.OrderFlightTickets.filter(
        it => it.VariablesJsonObj.isShow
      );
      const unShowArr = this.order.OrderFlightTickets.filter(
        it => !it.VariablesJsonObj.isShow
      );
      showArr = this.sortOrderFlightTicketsByTime(showArr);
      if (showArr.length > 2) {
        showArr.forEach((t, idx) => {
          t.VariablesJsonObj.idx = idx + 1;
        });
      }
      this.order.OrderFlightTickets = [...showArr, ...unShowArr];
    }
  }
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
  async onExchangeTrainTicket(evt: CustomEvent, orderTrainTicket: OrderTrainTicketEntity) {
    if (evt) {
      evt.stopPropagation();
    }
    return this.trainService.onExchange(orderTrainTicket);
  }
  private isTicketCanRefund(orderFlightTicket: OrderFlightTicketEntity) {
    if (
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
      this.isAfterTomorrow(orderFlightTicket.OrderFlightTrips[0].TakeoffTime)
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
    return (
      orderFlightTicket &&
      [
        OrderFlightTicketStatusType.Booked,
        OrderFlightTicketStatusType.BookExchanged
      ].includes(orderFlightTicket.Status)
    );
  }
  private isShowExchangeBtn(orderFlightTicket: OrderFlightTicketEntity) {
    if (
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
          return t;
        });
      }
    }
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
  private getFlightInsuranceAmount() {
    if (
      !this.order ||
      !this.order.OrderInsurances ||
      !this.order.OrderItems ||
      !this.order.OrderFlightTickets
    ) {
      return 0;
    }
    const flightTripkeys: string[] = [];
    this.order.OrderFlightTickets.forEach(t => {
      if (t.OrderFlightTrips) {
        t.OrderFlightTrips.forEach(trip => {
          if (!flightTripkeys.find(k => k == trip.Key)) {
            flightTripkeys.push(trip.Key);
          }
        });
      }
    });
    const keys = this.order.OrderInsurances.filter(
      it => !!flightTripkeys.find(k => k == it.AdditionKey)
    ).map(it => it.Key);
    const insuranceAmount = this.order.OrderItems.filter(it =>
      keys.find(k => k == it.Key && it.Tag == "Insurance")
    ).reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
    return insuranceAmount;
  }
  async onRefundFlightTicket(
    //退票弹框
    evt: CustomEvent,
    ticket: OrderFlightTicketEntity
  ) {
    if (evt) {
      evt.stopPropagation();
    }
    if (ticket) {
      const popover = await this.popoverCtrl.create({
        component: RefundFlightTicketTipComponent,
        translucent: true
      });
      return await popover.present();
      // AppHelper.toast()
      // const isRefund = await this.trainService.refund(orderTrainTicket.Id);
      // if (isRefund) {
      //   this.refundTicket.emit();
      // }
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
        this.refundTicket.emit();
      }
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
    rev =
      !order.OrderFlightTickets ||
      order.OrderFlightTickets.filter(
        it =>
          it.Status == OrderFlightTicketStatusType.Booking ||
          it.Status == OrderFlightTicketStatusType.BookExchanging
      ).length == 0;
    if (!rev) {
      return false;
    }
    rev =
      !order.OrderTrainTickets ||
      order.OrderTrainTickets.filter(
        it =>
          it.Status == OrderTrainTicketStatusType.Booking ||
          it.Status == OrderTrainTicketStatusType.BookExchanging
      ).length == 0;
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
  getPassengerTrips(p: OrderPassengerEntity, ticket: OrderFlightTicketEntity) {
    return (
      ticket.OrderFlightTrips &&
      ticket.OrderFlightTrips.filter(
        it => it.OrderFlightTicket && it.OrderFlightTicket.Id
      )
    );
  }
}
