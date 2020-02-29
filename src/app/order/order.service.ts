import { TaskModel } from "./models/TaskModel";
import { TaskEntity } from "src/app/workflow/models/TaskEntity";
import { HistoryEntity } from "./models/HistoryEntity";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { Injectable } from "@angular/core";
import { ApiService } from "../services/api/api.service";
import { OrderModel } from "./models/OrderModel";
import { OrderEntity, OrderStatusType } from "./models/OrderEntity";
import { map, switchMap } from "rxjs/operators";
import { from, Observable } from "rxjs";
import * as moment from "moment";
import { OrderTravelPayType } from './models/OrderTravelEntity';
import { OrderFlightTicketStatusType } from './models/OrderFlightTicketStatusType';
import { OrderTrainTicketStatusType } from './models/OrderTrainTicketStatusType';
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
  constructor(private apiService: ApiService) { }
  getOrderList(searchCondition: OrderModel) {
    const req = new RequestEntity();
    // req.IsShowLoading = true;
    const type = searchCondition.Type;
    req.Data = searchCondition;
    req.Method = `TmcApiOrderUrl-Order-List`;
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
    const result = this.apiService.getPromiseData<OrderDetailModel>(req);
    return result;
  }
  getOrderTasks(data: OrderModel, isShowLoading = false): Observable<TaskEntity[]> {
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
  getMyTrips(data: OrderModel) {
    const req = new RequestEntity();
    // req.IsShowLoading = true;
    req.Data = data;
    req.Method = `TmcApiOrderUrl-Travel-List`;
    if (data.Type) {
      req['Type'] = data.Type;
    }
    const result = this.apiService.getResponse<OrderModel>(req);
    return result;
  }
}
