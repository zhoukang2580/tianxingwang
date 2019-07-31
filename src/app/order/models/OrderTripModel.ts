export class OrderTripModel {
  /// <summary>
  /// 行程类型 Flight Train Hotel
  /// </summary>
  Type: string;
  /// <summary>
  /// 订单号
  /// </summary>
  OrderId: string;
  /// <summary>
  /// 事务号
  /// </summary>
  OrderTicketId: string;
  /// <summary>
  /// 状态
  /// </summary>
  Status: string;
  /// <summary>
  /// 开始时间
  /// </summary>
  StartTime: string;
  /// <summary>
  /// 到达时间
  /// </summary>
  EndTime: string;
  /// <summary>
  /// 车次 航班号
  /// </summary>
  Number: string;
  /// <summary>
  /// 始发
  /// </summary>
  FromName: string;
  /// <summary>
  /// 到达
  /// </summary>
  ToName: string;
}
