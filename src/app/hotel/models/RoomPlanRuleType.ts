export enum RoomPlanRuleType {
  /// <summary>
  /// 下线判断
  /// </summary>
  Offline = 1,
  /// <summary>
  /// 线上判断
  /// </summary>
  Online = 2,
  /// <summary>
  /// 提前预订
  /// </summary>
  BookingAdvance = 3,
  /// <summary>
  /// 连续入住
  /// </summary>
  BookingContinuation = 4,
  /// <summary>
  /// 起订房间数
  /// </summary>
  BookingMinCount = 5,
  /// <summary>
  /// 最多预订间数
  /// </summary>
  BookingMaxCount = 6,
  /// <summary>
  /// 必须提供客人国籍
  /// </summary>
  BookingNeedNationality = 7,
  /// <summary>
  /// 外宾需要留英文名称
  /// </summary>
  BookingForeignerNeedEnName = 8,
  /// <summary>
  /// 几点到几点不接受预订
  /// </summary>
  BookingRejectPeriod = 9,
  /// <summary>
  /// 预订需要客人手机号
  /// </summary>
  BookingNeedMobile = 10,
  /// <summary>
  /// 首晚房费担保
  /// </summary>
  GuaranteeFirstNight = 100,
  /// <summary>
  /// 全额担保
  /// </summary>
  GuaranteeAllNight = 101,
  /// <summary>
  /// 定额担保
  /// </summary>
  GuaranteeAmount = 102,
  /// <summary>
  /// 首晚房费担保
  /// </summary>
  PrepayPenaltyFirstNight = 200,

  /// <summary>
  /// 定额担保
  /// </summary>
  PrepayPenaltyAmount = 201,
  /// <summary>
  /// 比例
  /// </summary>
  PrepayPenaltyPercent = 202,

  /// <summary>
  /// 不可取消
  /// </summary>
  CancelNo = 300,
  /// <summary>
  /// 入住前多少小时可以免费取消
  /// </summary>
  CancelFreeBeforeHours = 301,
  /// <summary>
  /// 入住前多少小时可以免费取消
  /// </summary>
  CancelFreeBeforeTime = 302,
  /// <summary>
  /// 什么点后不能取消
  /// </summary>
  CancelNoAfterTime = 303,
  /// <summary>
  /// 房间保留在什么时间点前
  /// </summary>
  CancelHoldBeforeTime = 304
}
