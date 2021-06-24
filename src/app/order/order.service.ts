import { IResponse } from "./../services/api/IResponse";
import { TaskModel } from "./models/TaskModel";
import { TaskEntity } from "src/app/workflow/models/TaskEntity";
import { HistoryEntity } from "./models/HistoryEntity";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { Injectable } from "@angular/core";
import { ApiService } from "../services/api/api.service";
import { OrderModel } from "./models/OrderModel";
import { OrderEntity, OrderStatusType } from "./models/OrderEntity";
import { finalize, map, switchMap } from "rxjs/operators";
import { from, Observable, of } from "rxjs";
import * as moment from "moment";
import { OrderTravelPayType } from "./models/OrderTravelEntity";
import { OrderFlightTicketStatusType } from "./models/OrderFlightTicketStatusType";
import { OrderTrainTicketStatusType } from "./models/OrderTrainTicketStatusType";
import { environment } from "src/environments/environment";
import { MOCK_CAR_DATA, MOCK_FLIGHT_ORDER_DETAIL } from "./mock-data";
import { OrderFlightTripEntity } from "./models/OrderFlightTripEntity";
// import { SelectDateComponent } from "../tmc/components/select-date/select-date.component";
import { ModalController } from "@ionic/angular";
import { TripType } from "../tmc/models/TripType";
import {
  FlightHotelTrainType,
  PassengerBookInfo,
  PassengerBookInfoGp,
  TmcEntity,
} from "../tmc/tmc.service";
import { DayModel } from "../tmc/models/DayModel";
import { TrafficlineEntity } from "../tmc/models/TrafficlineEntity";
import { IFlightSegmentInfo } from "../flight/models/PassengerFlightInfo";
import { AppHelper } from "../appHelper";
import { OrderFlightTicketEntity } from "./models/OrderFlightTicketEntity";
import { OrderTrainTicketEntity } from "./models/OrderTrainTicketEntity";
import { TravelModel } from "./models/TravelModel";
import { StaffEntity } from "../hr/hr.service";
import { CalendarService } from "../tmc/calendar.service";
import { OrderPassengerEntity } from "./models/OrderPassengerEntity";
import { IPayWayItem, PayComponent } from "../components/pay/pay.component";
import { PayService } from "../services/pay/pay.service";
import { OpenUrlComponent } from "../pages/components/open-url-comp/open-url.component";
export class OrderDetailModel {
  Histories: HistoryEntity[];
  Tasks: TaskEntity[];
  Order: OrderEntity;
  OrderPassengers: OrderPassengerEntity[];
  TravelPayType: string;
  TravelType: string;
  orderTotalAmount: number;
  insuranceAmount: number;
}
@Injectable({
  providedIn: "root",
})
export class OrderService {
  constructor(
    private apiService: ApiService,
    private modalCtrl: ModalController,
    private payService: PayService,
    private calendarService: CalendarService
  ) { }
  getOrderList(searchCondition: OrderModel) {
    const req = new RequestEntity();
    // req.IsShowLoading = true;
    const type = searchCondition.Type;
    req.Data = searchCondition;
    req.Method = `TmcApiOrderUrl-Order-List`;
    // if (type == 'Car' && !environment.production) {
    //   return of({ Data: MOCK_CAR_DATA as any, Status: true } as IResponse<OrderModel>)
    // }
    return this.apiService.getResponse<OrderModel>(req);
  }
  // getOrderListAsync(searchCondition: OrderModel): Promise<OrderModel> {
  //   const req = new RequestEntity();
  //   req.IsShowLoading = true;
  //   req.Data = searchCondition;
  //   req.Method = `TmcApiOrderUrl-Order-List`;
  //   const result = this.apiService.getPromiseData<OrderModel>(req);
  //   return result;
  // }
  async getOrderDetailAsync(id: string): Promise<OrderDetailModel> {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiOrderUrl-Order-Detail`;
    req.Data = {
      Id: id,
    };
    return new Promise<OrderDetailModel>((rsv, rej) => {
      const sub = this.getOrderDetail(id)
        .pipe(
          finalize(() => {
            setTimeout(() => {
              sub.unsubscribe();
            }, 200);
          })
        )
        .subscribe(
          (r) => {
            if (r && r.Status) {
              rsv(r && r.Data);
            } else {
              rej(r && r.Message);
            }
          },
          (e) => {
            rej(e);
          }
        );
    });
  }
  getOrderTotalAmount(order: OrderEntity, tmc: TmcEntity) {
    let amount = 0;
    if (order && tmc && order.OrderItems) {
      let fee = 0;
      const sFee = order.OrderItems.filter((it) =>
        (it.Tag || "").toLowerCase().endsWith("fee")
      ).reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
      amount = order.OrderItems.filter(
        (it) => !(it.Tag || "").toLowerCase().endsWith("fee")
      ).reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
      fee = sFee;
      if (
        order.TravelPayType == OrderTravelPayType.Balance ||
        order.TravelPayType == OrderTravelPayType.Company
      ) {
        if (tmc && !tmc.IsShowServiceFee) {
          fee = 0;
        }
      }
      amount += fee;
    }
    amount = amount < 0 ? 0 : amount;
    return `${amount}`;
  }
  getOrderDetail(id: string) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiOrderUrl-Order-Detail`;
    req.Data = {
      Id: id,
    };
    return this.apiService.getResponse<OrderDetailModel>(req).pipe(
      map((it) => {
        if (it.Data && it.Data.Order) {
          it.Data.Order.OrderPassengers = it.Data.OrderPassengers;
        }
        return it;
      })
    );
  }
  async payOrder(
    orderId: string,
    key = "",
    giveup = false,
    payways?: { label: string; value: string }[]
  ): Promise<boolean> {
    if (giveup) {
      return Promise.resolve(false);
    }
    let payResult = false;
    const payWay = await this.selectPayWay(payways);
    console.log("payway", payWay);
    if (!payWay) {
      return payResult;
    } else {
      if (payWay.value.toLowerCase().includes("ali")) {
        payResult = await this.aliPay(orderId, key);
      }
      if (payWay.value.toLowerCase().includes("wechat")) {
        payResult = await this.wechatPay(orderId, key);
      }
      if (payWay.value.toLowerCase().includes("quickexpress")) {
        payResult = await this.quickexpressPay(orderId, key)
      }
    }
    return payResult;
  }
  private async wechatPay(
    tradeNo: string,
    key: string = "",
    method: string = "TmcApiOrderUrl-Pay-Create"
  ) {
    let res = false;
    const req = new RequestEntity();
    req.Method = method;
    req.Version = "2.0";
    req.Data = {
      Channel: "App",
      Type: "3",
      OrderId: tradeNo,
      IsApp: AppHelper.isApp(),
    };
    if (key) {
      req.Data["Key"] = key;
    }
    const r = await this.payService.wechatpay(req, "").catch((_) => {
      AppHelper.alert(_);
    });
    if (r) {
      const req1 = new RequestEntity();
      req1.Method = "TmcApiOrderUrl-Pay-Process";
      req1.Version = "2.0";
      req1.Data = {
        OutTradeNo: r,
        Type: "3",
      };
      const result = await this.payService.process(req1).catch((_) => {
        AppHelper.alert(_);
      });
      if (result) {
        // AppHelper.alert("支付完成");
        res = true;
      } else {
        // AppHelper.alert("订单处理支付失败");
        res = false;
      }
    } else {
      // AppHelper.alert("微信支付失败");
      res = false;
    }
    return res;
  }
  private async quickexpressPay(
    tradeNo: string,
    key: string = "",
    method: string = "TmcApiOrderUrl-Pay-Create"
  ) {
    let res = false;
    try {
      const req = new RequestEntity();
      req.Method = method;
      req.Version = "2.0";
      req.Data = {
        Channel: "App",
        Type: "6",
        OrderId: tradeNo,
        IsApp: AppHelper.isApp(),
      };
      if (key) {
        req.Data["Key"] = key;
      }
      const r = await this.apiService.getPromiseData<{ Url: string }>(req);
      if (r && r.Url) {
        const m = await AppHelper.modalController.create({
          component: OpenUrlComponent,
          componentProps: {
            url: r.Url,
            isOpenAsModal: true,
          }
        });
        m.present();
        res = true;
        // const req1 = new RequestEntity();
        // req1.Method = "TmcApiOrderUrl-Pay-Process";
        // req1.Version = "2.0";
        // req1.Data = {
        //   OutTradeNo: r,
        //   Type: "6",
        // };
        // const result = await this.payService.process(req1).catch((_) => {
        //   AppHelper.alert(_);
        // });
        // if (result) {
        //   // AppHelper.alert("支付完成");
        //   res = true;
        // } else {
        //   // AppHelper.alert("订单处理支付失败");
        //   res = false;
        // }
      } else {
        // AppHelper.alert("微信支付失败");
        res = false;
      }
    } catch (e) {
      console.error(e);
    }
    return res;
  }
  private async aliPay(
    tradeNo: string,
    key: string = "",
    method: string = "TmcApiOrderUrl-Pay-Create"
  ) {
    let res = false;
    const req = new RequestEntity();
    req.Method = method;
    req.Version = "2.0";
    req.Data = {
      Channel: "App",
      Type: "2",
      IsApp: AppHelper.isApp(),
      OrderId: tradeNo,
    };
    if (key) {
      req.Data["Key"] = key;
    }
    const r = await this.payService.alipay(req, "").catch((e) => {
      AppHelper.alert(e);
    });
    if (r) {
      const req1 = new RequestEntity();
      req1.Method = "TmcApiOrderUrl-Pay-Process";
      req1.Version = "2.0";
      req1.Data = {
        OutTradeNo: tradeNo,
        Type: "2",
      };
      const result = await this.payService.process(req1).catch((_) => {
        AppHelper.alert(_);
      });
      if (result) {
        res = true;
        // AppHelper.alert("支付完成");
      } else {
        res = false;
        // AppHelper.alert("订单处理支付失败");
      }
    } else {
      // AppHelper.alert("支付宝支付失败");
      res = false;
    }
    return res;
  }
  async selectPayWay(
    paytypes?: { label: string; value: string }[]
  ): Promise<IPayWayItem> {
    const m = await AppHelper.popoverController.create({
      component: PayComponent,
      componentProps: {
        payWays: paytypes,
      },
    });
    m.backdropDismiss = false;
    await m.present();
    const result = await m.onDidDismiss();
    return result && result.data;
  }
  getOrderPays(orderId: string) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiOrderUrl-Pay-GetOrderPays`;
    req.Data = {
      Id: orderId,
    };
    return this.apiService.getPromiseData<any>(req).then((r) => {
      return Object.keys(r).map((k) => ({ Name: r[k], Value: k }));
    });
  }
  getOrderTasks(
    data: TaskModel,
    isShowLoading = false
  ): Observable<TaskEntity[]> {
    const req = new RequestEntity();
    req.IsShowLoading = isShowLoading;
    req.Data = data;
    req.Method = `TmcApiOrderUrl-Task-List`;
    const result = this.apiService.getResponse<TaskEntity[]>(req).pipe(
      map((res) => {
        if (res.Data && res.Data) {
          return res.Data.map((it) => {
            it.VariablesJsonObj =
              (it.Variables && JSON.parse(it.Variables)) || {};
            it.VariablesJsonObj["TaskUrl"] = it.HandleUrl;
            return it;
          });
        }
        return [];
      })
    );
    return result;
  }
  checkPay(order: OrderEntity) {
    if (order.Status == OrderStatusType.WaitHandle) {
      return false;
    }
    let rev =
      order.PayAmount < order.TotalAmount &&
      (order.GetVariable<number>("TravelPayType") ==
        OrderTravelPayType.Credit ||
        order.GetVariable<number>("TravelPayType") ==
        OrderTravelPayType.Person) &&
      order.Status != OrderStatusType.Cancel;
    if (!rev) {
      return false;
    }
    rev =
      !order.OrderFlightTickets ||
      order.OrderFlightTickets.filter(
        (it) =>
          it.Status == OrderFlightTicketStatusType.Booking ||
          it.Status == OrderFlightTicketStatusType.BookExchanging
      ).length == 0;
    if (!rev) {
      return false;
    }
    rev =
      !order.OrderTrainTickets ||
      order.OrderTrainTickets.filter(
        (it) =>
          it.Status == OrderTrainTicketStatusType.Booking ||
          it.Status == OrderTrainTicketStatusType.BookExchanging
      ).length == 0;
    return rev;
  }
  getMyTrips(data: OrderModel) {
    const req = new RequestEntity();
    req.IsShowLoading = data.PageIndex <= 1;
    req.Data = data;
    req.Method = `TmcApiOrderUrl-Travel-List`;
    if (data.Type) {
      req["Type"] = data.Type;
    }
    const result = this.apiService.getResponse<TravelModel>(req).pipe(
      map((it) => {
        if (it && it.Data && it.Data.Trips && it.Data.Trips.length) {
          it.Data.Trips.forEach((t) => {
            if (t.Passenger && t.HideCredentialsNumber) {
              if (!t.Passenger.HideCredentialsNumber) {
                t.Passenger.HideCredentialsNumber = t.HideCredentialsNumber;
              }
            }
          });
        }
        return it;
      })
    );
    return result;
  }
  refundFlightTicket(data: {
    orderId: string;
    ticketId: string;
    IsVoluntary: boolean;
    FileName: string;
    FileValue: string;
  }) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Data = {
      OrderFlightTicketId: data.ticketId,
      OrderId: data.orderId,
      IsVoluntary: data.IsVoluntary,
      FileName: data.FileName,
    };
    if (data.FileValue) {
      req["FileValue"] = data.FileValue.includes(",")
        ? data.FileValue.split(",")[1]
        : data.FileValue;
    }
    req.Method = `TmcApiOrderUrl-Order-RefundFlight`;
    return this.apiService.getPromiseData<any>(req);
  }
  abolishTrainOrder(data: {
    OrderId: string;
    TicketId: string;
    Channel: string;
  }) {
    return this.abolishOrder({ ...data, Tag: "train" });
  }
  exchangeInfoFlightTrip(bookInfo: PassengerBookInfo<IFlightSegmentInfo>) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Data = {
      OrderId: bookInfo.exchangeInfo.order.Id,
      OrderFlightTicketId: bookInfo.exchangeInfo.ticket.Id,
      ExchangeDate: bookInfo.bookInfo.flightSegment.TakeoffTime.substr(0, 10),
      FlightNumber: bookInfo.bookInfo.flightSegment.Number,
      CabinName: bookInfo.bookInfo.flightPolicy.Cabin.TypeName,
      SalesPrice: bookInfo.bookInfo.flightPolicy.Cabin.SalesPrice,
    };
    req.Method = `TmcApiOrderUrl-Order-ExchangeInfo`;
    return this.apiService.getPromiseData<{
      trip: OrderFlightTripEntity;
      fromCity: TrafficlineEntity;
      toCity: TrafficlineEntity;
    }>(req);
  }
  exchangeInfoFlightGpTrip(bookInfo: PassengerBookInfoGp) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Data = {
      OrderId: bookInfo.exchangeInfo.order.Id,
      OrderFlightTicketId: bookInfo.exchangeInfo.ticket.Id,
      ExchangeDate: bookInfo.flightSegment.TakeoffTime.substr(0, 10),
      FlightNumber: bookInfo.flightSegment.Number,
      CabinName: bookInfo.Cabin.TypeName,
      SalesPrice: bookInfo.Cabin.SalesPrice,
    };
    req.Method = `TmcApiOrderUrl-Order-ExchangeInfo`;
    return this.apiService.getPromiseData<{
      trip: OrderFlightTripEntity;
      fromCity: TrafficlineEntity;
      toCity: TrafficlineEntity;
    }>(req);
  }
  getExchangeFlightTrip(data: {
    OrderId: string;
    TicketId: string;
    ExchangeDate: string;
  }) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Data = {
      OrderId: data.OrderId,
      OrderFlightTicketId: data.TicketId,
      ExchangeDate: data.ExchangeDate,
    };
    req.Method = `TmcApiOrderUrl-Order-ExchangeFlight`;
    return this.apiService.getPromiseData<{
      trip: OrderFlightTripEntity;
      fromCity: TrafficlineEntity;
      toCity: TrafficlineEntity;
      order: OrderEntity;
      credentails: {
        CredentialsNumber: string;
        HideCredentialsNumber: string;
      }[];
    }>(req);
  }

  abolishFlightOrder(data: {
    OrderId: string;
    TicketId: string;
    Channel: string;
  }) {
    return this.abolishOrder({ ...data, Tag: "flight" });
  }
  abolishTraninOrder(data: {
    OrderId: string;
    TicketId: string;
    Channel: string;
  }) {
    return this.abolishOrder({ ...data, Tag: "train" });
  }

  abolishHotelsOrder(data: {
    OrderId: string;
    orderHotelId: string;
    Channel: string;
  }) {
    return this.abolishHotelOrder({ ...data });
  }
  onGetVerifySMSCode(data: { Mobile: string; OrderHotelId: string }) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Data = data;
    req.Method = `TmcApiOrderUrl-Order-SendVerifyOrderHotelSMSCode`;
    return this.apiService.getPromiseData<any>(req);
  }
  onVerifySMSCode(data: { SmsCode: string; OrderHotelId: string }) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Data = {
      ProductId: data.OrderHotelId,
      SmsCode: data.SmsCode,
    };
    req.Method = `TmcApiOrderUrl-Order-ConfirmVerifyOrderHotelSMSCode`;
    return this.apiService.getPromiseData<any>(req);
  }
  private abolishOrder(data: {
    OrderId: string;
    TicketId: string;
    Tag: string;
    Channel: string;
  }) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Data = data;
    req.Method = `TmcApiOrderUrl-Order-AbolishOrder`;
    return this.apiService.getPromiseData<any>(req);
  }

  private abolishHotelOrder(data: {
    OrderId: string;
    orderHotelId: string;
    Channel: string;
  }) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Data = {
      ...data,
      OrderHotelId: data.orderHotelId,
    };
    req.Method = `TmcApiOrderUrl-Order-CancelOrderHotel`;
    return this.apiService.getPromiseData<any>(req);
  }

  async getExchangeDate(startTime: string) {
    return this.calendarService.openCalendar({
      goArrivalTime: startTime,
      tripType: TripType.departureTrip,
      forType: FlightHotelTrainType.Flight,
      isMulti: false,
      beginDate: startTime,
      endDate: "",
    });
  }
  private getmockOrderDetail(): OrderDetailModel {
    return MOCK_FLIGHT_ORDER_DETAIL as any;
  }
  checkIfOrderTrainTicketShow(ticket: OrderTrainTicketEntity[]) {
    if (ticket) {
      const statusArr = [
        OrderTrainTicketStatusType.ChangeTicket,
        // OrderFlightTicketStatusType.Refunded
      ];
      ticket = ticket.map((t) => {
        if (t.Variables) {
          t.VariablesJsonObj =
            t.VariablesJsonObj || JSON.parse(t.Variables) || {};
        }
        if (t.VariablesJsonObj) {
          const isShow = !statusArr.some((s) => s == t.Status);
          t.VariablesJsonObj.isShow = !t.VariablesJsonObj.IsScrap && isShow;
        }
        return t;
      });
    }
    return ticket;
  }
  checkIfOrderFlightTicketShow(ticket: OrderFlightTicketEntity[]) {
    if (ticket) {
      const statusArr = [
        OrderFlightTicketStatusType.ChangeTicket,
        // OrderFlightTicketStatusType.Refunded
      ];
      ticket = ticket.map((t) => {
        t.VariablesJsonObj =
          t.VariablesJsonObj ||
          (t.Variables ? JSON.parse(t.Variables) : null) ||
          {};
        if (t.VariablesJsonObj) {
          const isShow = !statusArr.some((s) => s == t.Status);
          t.VariablesJsonObj.isShow = !t.VariablesJsonObj.IsScrap && isShow;
        }
        return t;
      });
    }
    return ticket;
  }
}
