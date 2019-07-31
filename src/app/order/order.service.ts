import { RequestEntity } from "src/app/services/api/Request.entity";
import { Injectable } from "@angular/core";
import { ApiService } from "../services/api/api.service";
import { OrderModel } from "./models/OrderModel";

@Injectable({
  providedIn: "root"
})
export class OrderService {
  constructor(private apiService: ApiService) {}
  getOrderListAsync(searchCondition: OrderModel): Promise<OrderModel> {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Data = searchCondition;
    req.Method = `TmcApiOrderUrl-Order-List`;
    const result = this.apiService.getPromiseData<OrderModel>(req);
    return result;
  }
  getOrderDetailAsync(id: string): Promise<OrderModel> {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiOrderUrl-Order-Detail`;
    req.Data = {
      Id: id
    };
    const result = this.apiService.getPromiseData<OrderModel>(req);
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
