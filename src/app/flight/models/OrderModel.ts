import { OrderTripModel } from "./OrderTripModel";
import { HistoryInfoModel } from "./HistoryInfoModel";
import { OrderInfoModel } from "./OrderInfoModel";
import { OrderTaskModel } from "./OrderTaskModel";
import { OrderStatusEnum } from "./flight/OrderStatusEnum";
export class OrderModel {
  PageIndex: number; //  页码
  PageSize: number; //  每页条数
  Type: "flight" | "train" | string; // 订单类型(flight train)
  StartDate: string; //  开始日期
  EndDate: string; //  结束日期
  Status: OrderStatusEnum; // 订单状态
  DataCount: number; //  总数
  Orders: OrderInfoModel[]; // 订单
  Histories: Array<HistoryInfoModel>; // 历史
  OrderTrips: Array<OrderTripModel>; // 我的行程
  OrderTasks: Array<OrderTaskModel>; // 订单审批流
}
