import { OrderTrainTicketEntity } from "./OrderTrainTicketEntity";
import { BaseVariablesEntity } from 'src/app/models/BaseVariablesEntity';
export class OrderTrainTripEntity extends BaseVariablesEntity {
  /// <summary>
  /// 所属申请单
  /// </summary>
  public OrderTrainTicket: OrderTrainTicketEntity;
  /// <summary>
  /// 编号
  /// </summary>
  Key: string;
  // GroupKey:string;
  /// <summary>
  /// 出发时间
  /// </summary>
  StartTime: string;
  /// <summary>
  /// 到达时间
  /// </summary>
  ArrivalTime: string;
  /// <summary>
  /// 订单总数
  /// </summary>
  FromStationCode: string;
  /// <summary>
  /// 出发站名
  /// </summary>
  FromStationName: string;
  /// <summary>
  /// 到达
  /// </summary>
  ToStationCode: string;
  /// <summary>
  /// 到达
  /// </summary>
  ToStationName: string;
  /// <summary>
  /// 车次
  /// </summary>
  TrainCode: string;
  /// <summary>
  /// 行程时间
  /// </summary>
  TravelMinutes: string;
  /// <summary>
  /// 行程号
  /// </summary>
  TrainNo: string;
}
