export enum OrderInsuranceStatusType {
  /// <summary>
  /// 投保中
  /// </summary>
  Booking = 1,
  /// <summary>
  /// 投保成功
  /// </summary>
  Booked = 2,
  /// <summary>
  /// 等待支付
  /// </summary>
  WaitPay = 3,
  /// <summary>
  /// 支付中
  /// </summary>
  Paying = 4,
  /// <summary>
  /// 支付失败
  /// </summary>
  PayFailure = 5,
  /// <summary>
  /// 退保
  /// </summary>
  Refunded = 6,
  /// <summary>
  /// 废除中
  /// </summary>
  Abolishing = 7,
  /// <summary>
  /// 废除
  /// </summary>
  Abolish = 8,
  /// <summary>
  /// 异常
  /// </summary>
  Exception = 9
}
