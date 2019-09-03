export class RoomPlanModel {
  /// <summary>
  /// 酒店Id
  /// </summary>
  HotelId: string;
  /// <summary>
  /// 价格计划Id
  /// </summary>
  RoomPlanId: string;
  /// <summary>
  /// 是否允许预订
  /// </summary>
  IsAllowOrder: boolean;
  /// <summary>
  /// 违规
  /// </summary>
  Rules: { [key: string]: string };
}
