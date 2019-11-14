import { OrderStatusType, OrderEntity } from "./OrderEntity";
import { TmcEntity } from "src/app/tmc/tmc.service";
import { HistoryEntity } from "./HistoryEntity";
import { OrderTripModel } from "./OrderTripModel";
import { OrderTaskModel } from "./OrderTaskModel";

export class OrderModel {
  /// <summary>
  /// 当前页
  /// </summary>
  PageIndex: number;
  /// <summary>
  /// 分页大小
  /// </summary>
  PageSize: number;

  /// <summary>
  /// 页大小
  /// </summary>
  PageCount: number;

  /// <summary>
  /// 数据
  /// </summary>
  DataCount: number;
  Type: "Flight" | "Train" | "Hotel";
  /// <summary>
  /// 开始日期
  /// </summary>
  StartDate: string;
  /// <summary>
  /// 开始日期
  /// </summary>
  EndDate: string;
  /// <summary>
  /// 状态
  /// </summary>
  Status: OrderStatusType;

  /// <summary>
  /// 订单编号
  /// </summary>
  Id: string;

  // OrderEntity Order :string;

  Tmc: TmcEntity;
  /// <summary>
  /// 审批历史
  /// </summary>
  Histories: HistoryEntity[];

  Orders: OrderEntity[];
  /// <summary>
  /// 订单行程
  /// </summary>
  OrderTrips: OrderTripModel[];
  Trips: OrderTripModel[];
  OrderTasks: OrderTaskModel[];
  Passenger: string;
  FromCityName: string;
  ToCityName: string;
}
