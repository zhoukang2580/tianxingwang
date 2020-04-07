export class HotelPolicyModel {
  /// <summary>
  /// 酒店Id
  /// </summary>
  HotelId: string;
  /// <summary>
  /// 价格计划Id
  /// </summary>
  Number: string;
  UniqueIdId: string;
  /// <summary>
  /// 是否可预订
  /// </summary>
  IsAllowBook: boolean;
  /// <summary>
  /// 违反具体的差标
  /// </summary>
  Rules: string[];
}
