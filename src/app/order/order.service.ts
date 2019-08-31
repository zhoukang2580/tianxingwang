import { TaskModel } from "./models/TaskModel";
import { TaskEntity } from "src/app/workflow/models/TaskEntity";
import { HistoryEntity } from "./models/HistoryEntity";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { Injectable } from "@angular/core";
import { ApiService } from "../services/api/api.service";
import { OrderModel } from "./models/OrderModel";
import { OrderEntity } from "./models/OrderEntity";
import { map, switchMap } from "rxjs/operators";
import { from, Observable } from "rxjs";
import * as moment from "moment";
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
  constructor(private apiService: ApiService) {}
  getOrderList(searchCondition: OrderModel) {
    const req = new RequestEntity();
    // req.IsShowLoading = true;
    req.Data = searchCondition;
    req.Method = `TmcApiOrderUrl-Order-List`;
    return this.apiService.getResponse<OrderModel>(req);
  }
  getOrderListAsync(searchCondition: OrderModel): Promise<OrderModel> {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Data = searchCondition;
    req.Method = `TmcApiOrderUrl-Order-List`;
    const result = this.apiService.getPromiseData<OrderModel>(req);
    return result;
  }
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
  getOrderTasks(data: OrderModel): Observable<TaskEntity[]> {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Data = data;
    req.Method = `TmcApiOrderUrl-Task-List`;
    const result = this.apiService.getResponse<TaskModel>(req).pipe(
      map(res => {
        if (res.Data && res.Data.Tasks) {
          return res.Data.Tasks.map(it => {
            const Name =
              it.ExpiredTime &&
              !it.ExpiredTime.startsWith("1800") &&
              new Date(it.ExpiredTime).getTime() < new Date().getTime()
                ? "已过期"
                : it.Name;
            it.VariablesJsonObj =
              (it.Variables && JSON.parse(it.Variables)) || {};
            it.VariablesJsonObj["TaskUrl"] =
              Name == "已过期" ? "" : it.HandleUrl;
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

  getMyTrips(data: OrderModel) {
    const req = new RequestEntity();
    // req.IsShowLoading = true;
    req.Data = data;
    req.Method = `TmcApiOrderUrl-Travel-List`;
    const result = this.apiService.getResponse<OrderModel>(req);
    return result;
  }
}
