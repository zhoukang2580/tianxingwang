export enum AgentRegionType {
  /// <summary>
  /// 机票
  /// </summary>
  // [Description("国内机票")]
  Flight = 1,
  /// <summary>
  /// 酒店
  /// </summary>
  // [Description("国内酒店")]
  Hotel = 2,
  /// <summary>
  /// 火车票
  /// </summary>
  // [Description("火车票")]
  Train = 4,
  /// <summary>
  /// 租车
  /// </summary>
  // [Description("租车")]
  Car = 8,
  /// <summary>
  /// 国际*港澳台机票
  /// </summary>
  // [Description("国际*港澳台机票")]
  InternationalFlight = 16,
  /// <summary>
  /// 国际酒店
  /// </summary>
  // [Description("港澳台*海外酒店")]
  InternationalHotel = 32,
  /// <summary>
  /// 国际酒店
  /// </summary>
  // [Description("保险")]
  Insurance = 64,
}
