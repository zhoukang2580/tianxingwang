import { OrderEntity } from "src/app/order/models/OrderEntity";
import { TaskEntity } from "src/app/workflow/models/TaskEntity";
import { HistoryEntity } from "./models/HistoryEntity";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { Injectable } from "@angular/core";
import { ApiService } from "../services/api/api.service";
import { OrderModel } from "./models/OrderModel";
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
    req.IsShowLoading = true;
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
  getOrderTasksAsync(data: OrderModel): Promise<OrderModel> {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Data = data;
    req.Method = `TmcApiOrderUrl-Order-Tasks`;
    const result = this.apiService.getPromiseData<OrderModel>(req);
    return result;
  }
  getMyTripsAsync(data: OrderModel): Promise<OrderModel> {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Data = data;
    req.Method = `TmcApiOrderUrl-Order-Trips`;
    const result = this.apiService.getPromiseData<OrderModel>(req);
    return result;
  }
}
