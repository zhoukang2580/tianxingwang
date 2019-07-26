import { TrainSeatType } from "./TrainEntity";
export class TrainSeatEntity {
  /// <summary>
  /// 座位类型
  /// </summary>
  SeatType: TrainSeatType;
  /// <summary>
  /// 剩余数量
  /// </summary>
  Count: string;
  Price: string;
  /// <summary>
  /// 价格
  /// </summary>
  SalesPrice: string;
  /// <summary>
  /// 结算价
  /// </summary>
  SettlePrice: string;
  /// <summary>
  /// 票面价
  /// </summary>
  TicketPrice: string;
  /// <summary>
  /// 座位类型名称
  /// </summary>
  SeatTypeName: string;
}
