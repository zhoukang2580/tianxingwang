import { IResponse } from "./../services/api/IResponse";
import { TaskModel } from "./models/TaskModel";
import { TaskEntity } from "src/app/workflow/models/TaskEntity";
import { HistoryEntity } from "./models/HistoryEntity";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { Injectable } from "@angular/core";
import { ApiService } from "../services/api/api.service";
import { OrderModel } from "./models/OrderModel";
import { OrderEntity, OrderStatusType } from "./models/OrderEntity";
import { map, switchMap } from "rxjs/operators";
import { from, Observable, of } from "rxjs";
import * as moment from "moment";
import { OrderTravelPayType } from "./models/OrderTravelEntity";
import { OrderFlightTicketStatusType } from "./models/OrderFlightTicketStatusType";
import { OrderTrainTicketStatusType } from "./models/OrderTrainTicketStatusType";
import { environment } from "src/environments/environment";
import { MOCK_CAR_DATA, MOCK_FLIGHT_ORDER_DETAIL } from "./mock-data";
import { OrderFlightTripEntity } from "./models/OrderFlightTripEntity";
import { SelectDateComponent } from "../tmc/components/select-date/select-date.component";
import { ModalController } from "@ionic/angular";
import { TripType } from "../tmc/models/TripType";
import { FlightHotelTrainType, PassengerBookInfo } from "../tmc/tmc.service";
import { DayModel } from "../tmc/models/DayModel";
import { TrafficlineEntity } from "../tmc/models/TrafficlineEntity";
import { IFlightSegmentInfo } from "../flight/models/PassengerFlightInfo";
import { AppHelper } from "../appHelper";
export class OrderDetailModel {
  Histories: HistoryEntity[];
  Tasks: TaskEntity[];
  Order: OrderEntity;
  TravelPayType: string;
  TravelType: string;
}
@Injectable({
  providedIn: "root"
})
export class OrderService {
  constructor(
    private apiService: ApiService,
    private modalCtrl: ModalController
  ) {}
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
  getOrderDetailAsync(id: string): Promise<OrderDetailModel> {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiOrderUrl-Order-Detail`;
    req.Data = {
      Id: id
    };
    if(!environment.production){
      return Promise.resolve(this.getmockOrderDetail())
    }
    const result = this.apiService.getPromiseData<OrderDetailModel>(req);
    return result;
  }
  getOrderDetail(id: string) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiOrderUrl-Order-Detail`;
    req.Data = {
      Id: id
    };
    return this.apiService.getResponse<OrderDetailModel>(req);
  }
  getOrderTasks(
    data: OrderModel,
    isShowLoading = false
  ): Observable<TaskEntity[]> {
    const req = new RequestEntity();
    req.IsShowLoading = isShowLoading;
    req.Data = data;
    req.Method = `TmcApiOrderUrl-Task-List`;
    const result = this.apiService.getResponse<TaskModel>(req).pipe(
      map(res => {
        if (res.Data && res.Data.Tasks) {
          return res.Data.Tasks.map(it => {
            it.VariablesJsonObj =
              (it.Variables && JSON.parse(it.Variables)) || {};
            it.VariablesJsonObj["TaskUrl"] = it.HandleUrl;
            it.InsertTime = moment(it.InsertTime).format("YYYY-MM-DD HH:mm");
            it.ExpiredTime = moment(it.ExpiredTime).format("YYYY-MM-DD HH:mm");
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
  getMyTrips(data: OrderModel) {
    const req = new RequestEntity();
    // req.IsShowLoading = true;
    req.Data = data;
    req.Method = `TmcApiOrderUrl-Travel-List`;
    if (data.Type) {
      req["Type"] = data.Type;
    }
    const result = this.apiService.getResponse<OrderModel>(req);
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
      FileName: data.FileName
    };
    if (data.FileValue) {
      req["FileValue"] = data.FileValue.includes(",")
        ? data.FileValue.split(",")[1]
        : data.FileValue;
    }
    req.Method = `TmcApiOrderUrl-Order-RefundFlight`;
    return this.apiService.getPromiseData<any>(req);
  }
  abolishTrainOrder(data: { OrderId: string; TicketId: string }) {
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
      SalesPrice: bookInfo.bookInfo.flightPolicy.Cabin.SalesPrice
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
      ExchangeDate: data.ExchangeDate
    };
    req.Method = `TmcApiOrderUrl-Order-ExchangeFlight`;
    return this.apiService.getPromiseData<{
      trip: OrderFlightTripEntity;
      fromCity: TrafficlineEntity;
      toCity: TrafficlineEntity;
    }>(req);
  }
  abolishFlightOrder(data: { OrderId: string; TicketId: string }) {
    return this.abolishOrder({ ...data, Tag: "flight" });
  }
  private abolishOrder(data: {
    OrderId: string;
    TicketId: string;
    Tag: string;
  }) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Data = data;
    req.Method = `TmcApiOrderUrl-Order-AbolishOrder`;
    return this.apiService.getPromiseData<any>(req);
  }
  async getExchangeDate(startTime: string) {
    const m = await this.modalCtrl.create({
      component: SelectDateComponent,
      componentProps: {
        goArrivalTime: startTime,
        tripType: TripType.departureTrip,
        forType: FlightHotelTrainType.Flight,
        isMulti: false
      }
    });
    await m.present();
    const d = await m.onDidDismiss();
    return d && (d.data as DayModel[]);
  }
 private getmockOrderDetail():OrderDetailModel{
  return MOCK_FLIGHT_ORDER_DETAIL as any;
  }
}
