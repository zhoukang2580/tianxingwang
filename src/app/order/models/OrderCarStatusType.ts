export enum OrderCarStatusType {
    /// <summary>
    /// 用车中
    /// </summary>
    Booking = 1,

    /// <summary>
    /// 完成
    /// </summary>
    Booked = 2,

    /// <summary>
    /// 已退单
    /// </summary>
    Refunded = 3,
    /// <summary>
    /// 等待支付
    /// </summary>
    Paying = 4,
    /// <summary>
    /// 支付失败
    /// </summary>
    PayFailure = 5,
    /// <summary>
    /// 废除中
    /// </summary>
    Abolishing = 14,
    /// <summary>
    /// 废除
    /// </summary>
    Abolish = 15,
    /// <summary>
    /// 异常
    /// </summary>
    Exception = 16

}