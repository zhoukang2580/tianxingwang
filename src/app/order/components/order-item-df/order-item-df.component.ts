import { LangService } from "src/app/services/lang.service";
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
  OnDestroy,
} from "@angular/core";
import { OrderEntity, OrderStatusType } from "src/app/order/models/OrderEntity";
import { OrderFlightTripStatusType } from "src/app/order/models/OrderFlightTripStatusType";
import { OrderTravelPayType } from "../../models/OrderTravelEntity";
import { OrderFlightTicketStatusType } from "../../models/OrderFlightTicketStatusType";
import { OrderTrainTicketStatusType } from "../../models/OrderTrainTicketStatusType";
import { OrderFlightTicketEntity } from "../../models/OrderFlightTicketEntity";
import { OrderTrainTicketEntity } from "../../models/OrderTrainTicketEntity";
import { TrainBookType } from "src/app/train/models/TrainBookType";
import {
  OrderHotelEntity,
  OrderHotelStatusType,
} from "../../models/OrderHotelEntity";
import { HotelPaymentType } from "src/app/hotel/models/HotelPaymentType";
import { TrainSupplierType } from "src/app/train/models/TrainSupplierType";
import { Router } from "@angular/router";
import { OrderPassengerEntity } from "../../models/OrderPassengerEntity";
import { OrderFlightTicketType } from "../../models/OrderFlightTicketType";
import {
  PopoverController,
  PickerController,
  IonDatetime,
} from "@ionic/angular";
import { RefundFlightTicketTipComponent } from "../refund-flight-ticket-tip/refund-flight-ticket-tip.component";
import { OrderService } from "../../order.service";
import { LanguageHelper } from "src/app/languageHelper";
import { DayModel } from "src/app/tmc/models/DayModel";
import { tick } from "@angular/core/testing";
import { TrainSeatEntity } from "src/app/train/models/TrainSeatEntity";
@Component({
  selector: "app-order-item-df",
  templateUrl: "./order-item-df.component.html",
  styleUrls: ["./order-item-df.component.scss"],
})
export class OrderItemDfComponent implements OnInit, OnChanges {
  private selfBookChannals = `Android  ??????H5  IOS ??????PC`;
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
  @Output() exchangeFlightGpTicket: EventEmitter<{
    orderId: string;
    ticketId: string;
    trip: OrderFlightTripEntity;
  }>;
  @Output() abolishOrder: EventEmitter<{
    orderId: string;
    ticketId: string;
    tag: "flight" | "train";
  }>;
  @Output() abolishHotelOrder: EventEmitter<{
    orderId: string;
    orderHotelId: string;
  }>;
  @Output() verifySMSCode: EventEmitter<any>;
  @Output() getVerifySMSCode: EventEmitter<any>;

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
    private orderService: OrderService,
    private LangService: LangService
  ) {
    this.payaction = new EventEmitter();
    this.refundTrainTicket = new EventEmitter();
    this.refundFlightTicket = new EventEmitter();
    this.abolishOrder = new EventEmitter();
    this.abolishHotelOrder = new EventEmitter();
    this.verifySMSCode = new EventEmitter();
    this.getVerifySMSCode = new EventEmitter();
    this.exchangeFlightTicket = new EventEmitter();
    this.exchangeFlightGpTicket = new EventEmitter();
  }
  onPay(evt: CustomEvent) {
    if (this.order) {
      this.payaction.emit(this.order);
    }
    evt.preventDefault();
    evt.stopPropagation();
  }
  onVerifySMSCode(evt: CustomEvent, orderHotel) {
    evt.stopPropagation();
    this.verifySMSCode.emit({
      orderId: this.order.Id,
      orderHotel,
    });
  }
  onGetVerifySMSCode(evt: CustomEvent, orderHotel) {
    evt.stopPropagation();
    this.getVerifySMSCode.emit({
      orderId: this.order.Id,
      orderHotel
    });
  }
  onAbolishHotelOrder(evt: CustomEvent, orderId) {
    //OrderHotels
    evt.stopPropagation();
    AppHelper.alert("???????????????????", true, "??????", "??????").then((ok) => {
      if (ok) {
        this.abolishHotelOrder.emit({
          orderId: this.order.Id,
          orderHotelId: orderId,
        });
      }
    });
  }

  onHelp(evt: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
    }
    if (this.LangService.isEn) {
      AppHelper.alert("It takes 3-15 days for refund and 7-10 days for refund");
    }
    AppHelper.alert("???????????????3-15??????????????????????????????7-10????????????");
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.order && changes.order.currentValue) {
      if (this.order) {
        this.order.InsertDateTime = (this.order.InsertDateTime || "")
          .replace("T", " ")
          .substr(0, 19);
        this.order["checkPay"] = this.checkPay();
        this.order.VariablesJsonObj =
          this.order.VariablesJsonObj ||
          (this.order.Variables ? JSON.parse(this.order.Variables) : {});
        if (this.order.OrderFlightTickets) {
          this.order.OrderFlightTickets = this.order.OrderFlightTickets.map(
            (ticket) => {
              ticket.VariablesJsonObj =
                ticket.VariablesJsonObj ||
                (ticket.Variables ? JSON.parse(ticket.Variables) : {});
              if (ticket.OrderFlightTrips) {
                ticket.OrderFlightTrips = ticket.OrderFlightTrips.map(
                  (trip) => {
                    if (trip.TakeoffDate) {
                      trip["dateWeekName"] = this.getDateWeekName(
                        trip.TakeoffDate
                      );
                    }
                    trip["isTakeoffTimeGtNow"] =
                      this.calendarService
                        .getMoment(0, trip.TakeoffTime)
                        .diff(
                          this.calendarService
                            .getMoment(0)
                            .format("YYYY-MM-DD"),
                          "days"
                        ) > 0;
                    if (
                      !trip.OrderFlightTicket ||
                      !trip.OrderFlightTicket.Passenger
                    ) {
                      trip.OrderFlightTicket = {
                        Id: ticket.Id,
                        Passenger: ticket.Passenger,
                      } as any;
                    }
                    return trip;
                  }
                );
                ticket.OrderFlightTrips.sort((t1, t2) => {
                  return (
                    AppHelper.getDate(t1.TakeoffTime).getTime() -
                    AppHelper.getDate(t2.TakeoffTime).getTime()
                  );
                });
              }
              // ticket.VariablesJsonObj.isShowBtnByTimeAndTicketType = this.showBtnByTimeAndTicketType(
              //   ticket
              // );
              // ticket.VariablesJsonObj.isTicketCanRefund = this.isTicketCanRefund(
              //   ticket
              // );
              // ticket.VariablesJsonObj.isShowExchangeBtn = this.isShowExchangeBtn(
              //   ticket
              // );
              // ticket.VariablesJsonObj.isShowCancelButton = this.isShowFlightCancelBtn(
              //   ticket
              // );
              return ticket;
            }
          );
        }
        if (this.order.OrderTrainTickets) {
          this.order.OrderTrainTickets = this.order.OrderTrainTickets.map(
            (t, idx) => {
              if (t.Variables && !t.VariablesJsonObj) {
                t.VariablesJsonObj =
                  t.VariablesJsonObj ||
                  (t.Variables ? JSON.parse(t.Variables) : {});
              }
              t.VariablesJsonObj.isShowCancelButton =
                this.isShowTrainCancelBtn(t) &&
                idx == this.order.OrderTrainTickets.length - 1;
              t.VariablesJsonObj.isShowRefundOrExchangeBtn = this.isShowRefundOrExchangeBtn(
                t
              );
              if (t.OrderTrainTrips) {
                t.OrderTrainTrips = t.OrderTrainTrips.map((trip) => {
                  if (trip.StartTime) {
                    trip["StartTimeGetHHmm"] = this.getHHmm(trip.StartTime);
                    // trip.StartTime = trip.StartTime.substr(0, 10);
                  }
                  return trip;
                });
              }
              return t;
            }
          );
        }
        this.initPassengers();
        // this.initInsuranceAmount();
        // this.order.OrderFlightTickets = this.orderService.checkIfOrderFlightTicketShow(
        //   this.order.OrderFlightTickets
        // );
      }
    }
  }
  private sortOrderFlightTicketsByTime(arr: OrderFlightTicketEntity[]) {
    const result = ((arr && arr.slice(0)) || []).filter(
      (t) => t.OrderFlightTrips && t.OrderFlightTrips.length > 0
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
      OrderFlightTicketStatusType.Exchanged,
    ].includes(orderFlightTicket && orderFlightTicket.Status);
  }
  private showBtnByTimeAndTicketType(
    orderFlightTicket: OrderFlightTicketEntity
  ) {
    return (
      orderFlightTicket &&
      orderFlightTicket.OrderFlightTrips &&
      orderFlightTicket.TicketType == OrderFlightTicketType.Domestic &&
      orderFlightTicket.OrderFlightTrips.some((trip) =>
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
  // private isShowFlightCancelBtn(orderFlightTicket: OrderFlightTicketEntity) {
  //   if (
  //     !orderFlightTicket ||
  //     !this.showBtnByTimeAndTicketType(orderFlightTicket)
  //   ) {
  //     return false;
  //   }
  //   return [
  //     OrderFlightTicketStatusType.Booked,
  //     OrderFlightTicketStatusType.BookExchanged,
  //   ].includes(orderFlightTicket.Status);
  // }
  private isShowRefundOrExchangeBtn(orderTrainTicket: OrderTrainTicketEntity) {
    if (!orderTrainTicket) {
      return false;
    }
    return (
      orderTrainTicket.VariablesJsonObj &&
      (orderTrainTicket.VariablesJsonObj.isShowExchangeButton ||
        orderTrainTicket.VariablesJsonObj.isShowRefundButton)
    );
  }
  private isShowTrainCancelBtn(orderTrainTicket: OrderTrainTicketEntity) {
    if (!orderTrainTicket) {
      return false;
    }
    return (
      orderTrainTicket.VariablesJsonObj &&
      orderTrainTicket.VariablesJsonObj.isShowCancelButton
    );
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
        OrderFlightTicketStatusType.Exchanged,
      ].includes(orderFlightTicket.Status)
    );
  }
  private initPassengers() {
    if (this.order) {
      if (this.order.OrderFlightTickets) {
        this.order.OrderFlightTickets = this.order.OrderFlightTickets.map(
          (t) => {
            t.Passenger = this.getTicketPassenger(t);
            return t;
          }
        );
      }
      if (this.order.OrderTrainTickets) {
        this.order.OrderTrainTickets = this.order.OrderTrainTickets.map((t) => {
          t.Passenger = this.getTicketPassenger(t);
          return t;
        });
      }
      if (this.order.OrderHotels) {
        this.order.OrderHotels = this.order.OrderHotels.map((t) => {
          if (t.BeginDate) {
            t.BeginDate = t.BeginDate.substr(0, 10);
          }
          t.Passenger = this.getTicketPassenger(t);
          t.countDay =
            (AppHelper.getDate(t.EndDate).getTime() -
              AppHelper.getDate(t.BeginDate).getTime()) /
            86400000;
          if (t.Variables && !t.VariablesJsonObj) {
            try {
              t.VariablesJsonObj = JSON.parse(t.Variables);
            } catch (e) {
              console.error(e);
            }
          }
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
      trip,
    });
  }
  async onExchangeFlightGpTicket(
    evt: CustomEvent,
    ticket: OrderFlightTicketEntity,
    trip: OrderFlightTripEntity
  ) {
    evt.stopPropagation();
    this.exchangeFlightGpTicket.emit({
      orderId: this.order.Id,
      ticketId: ticket.Id,
      trip,
    });
  }
  onAbolishFlightOrder(evt: CustomEvent, ticket: OrderFlightTicketEntity) {
    evt.stopPropagation();
    AppHelper.alert(
      this.LangService.isCn ? "???????????????????" : "Confirm order cancellation",
      true,
      LanguageHelper.getConfirmTip(),
      LanguageHelper.getCancelTip()
    ).then((ok) => {
      if (ok) {
        this.abolishOrder.emit({
          orderId: this.order.Id,
          ticketId: ticket.Id,
          tag: "flight",
        });
      }
    });
  }
  onAbolishTraninOrder(evt: CustomEvent, train: OrderTrainTicketEntity) {
    evt.stopPropagation();
    AppHelper.alert(
      this.LangService.isCn ? "???????????????????" : "Confirm order cancellation",
      true,
      LanguageHelper.getConfirmTip(),
      LanguageHelper.getCancelTip()
    ).then((ok) => {
      if (ok) {
        this.abolishOrder.emit({
          orderId: this.order.Id,
          ticketId: train.Id,
          tag: "train",
        });
      }
    });
  }
  private getTicketPassenger(ticket: { Passenger: OrderPassengerEntity }) {
    const p = (this.order && this.order.OrderPassengers) || [];
    return p.find((it) => it.Id == (ticket.Passenger && ticket.Passenger.Id));
  }
  private getDateWeekName(date: string) {
    if (!date) {
      return "";
    }
    const d = this.calendarService.generateDayModelByDate(date);
    return d.dayOfWeekName;
  }
  async onRefundFlightTicket(
    // ????????????
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
        translucent: true,
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
          ticketId: ticket.Id,
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
  async ngOnInit() { }
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
      order.VariablesJsonObj ||
      (order.Variables ? JSON.parse(order.Variables) : {});
    if (order.Status == OrderStatusType.WaitHandle) {
      return false;
    }
    if (order.Status == OrderStatusType.WaitPay) {
      return true;
    }
    let rev = order.VariablesJsonObj["isPay"];
    return rev;
  }
  // getTotalAmount(order: OrderEntity, key: string) {
  //   let amount = 0;
  //   const Tmc = this.tmc;
  //   if (!order || !order.OrderItems || !Tmc) {
  //     return amount;
  //   }
  //   if (Tmc.IsShowServiceFee) {
  //     amount = order.OrderItems.filter((it) => it.Key == key).reduce(
  //       (acc, it) => (acc = AppHelper.add(acc, +it.Amount)),
  //       0
  //     );
  //   } else {
  //     amount = order.OrderItems.filter(
  //       (it) => it.Key == key && !(it.Tag || "").endsWith("Fee")
  //     ).reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
  //   }
  //   return amount > 0 ? amount : 0;
  // }
  ticketIsReject(orderFlightTicket: {
    Variables: string;
    VariablesJsonObj: any;
  }) {
    orderFlightTicket.VariablesJsonObj =
      orderFlightTicket.VariablesJsonObj ||
      (orderFlightTicket.Variables
        ? JSON.parse(orderFlightTicket.Variables)
        : {});
    return orderFlightTicket && orderFlightTicket.VariablesJsonObj["IsReject"];
  }
  flightInsuranceAmount(orderFlightTicket: OrderFlightTicketEntity) {
    let amount = 0;
    if (orderFlightTicket && this.order && this.order.OrderItems) {
      const flighttripKeys =
        (orderFlightTicket.OrderFlightTrips &&
          orderFlightTicket.OrderFlightTrips.map((it) => it.Key)) ||
        [];
      const keys =
        (this.order.OrderInsurances &&
          this.order.OrderInsurances.filter((it) =>
            flighttripKeys.some((fk) => fk == it.AdditionKey)
          ).map((it) => it.Key)) ||
        [];
      amount = this.order.OrderItems.filter((it) =>
        keys.some((k) => k == it.Key)
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
          orderTrainTicket.OrderTrainTrips.map((it) => it.Key)) ||
        [];
      const keys =
        (this.order.OrderInsurances &&
          this.order.OrderInsurances.filter((it) =>
            flighttripKeys.includes(it.AdditionKey)
          ).map((it) => it.Key)) ||
        [];
      amount = this.order.OrderItems.filter((it) =>
        keys.includes(it.Key)
      ).reduce((acc, it) => {
        acc = AppHelper.add(acc, +it.Amount);
        return acc;
      }, 0);
    }
    return amount;
  }
  getPassengerTicketStatus(p: OrderPassengerEntity) {
    const tickets =
      this.order &&
      this.order.OrderFlightTickets &&
      this.order.OrderFlightTickets.filter(
        (t) => t.Passenger && t.Passenger.Id == (p && p.Id)
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
        (it) => it.OrderFlightTicket && it.OrderFlightTicket.Id
      )
    );
  }
  // initInsuranceAmount(){
  //   this.order.OrderTrainTickets.forEach((it, idx) => {
  //     // it.VariablesJsonObj.isShow
  //     this.getTicketOrderInsurances(it.Key);
  //   });
  // }
  // private getTicketOrderInsurances(tkey: string) {
  //   return (
  //     (this.order &&
  //       this.order.OrderInsurances &&
  //       this.order.OrderInsurances.filter(
  //         it => it.TravelKey == tkey
  //       )) ||
  //     []
  //   ).length>0;
  // }
}
