export enum OrderTrainTicketStatusType
{
    /// <summary>
    /// 预订中
    /// </summary>
    Booking = 1,
    /// <summary>
    /// 预订成功
    /// </summary>
    Booked = 2,
    /// <summary>
    /// 出票中
    /// </summary>
    Issuing = 3,
    /// <summary>
    /// 已出票
    /// </summary>
    Issued = 4,
    /// <summary>
    /// 退票申请中
    /// </summary>
    Refunding = 5,
    /// <summary>
    /// 退票
    /// </summary>
    Refunded = 6,
    /// <summary>
    /// 预订修改中
    /// </summary>
    BookExchanging = 7,
    /// <summary>
    /// 预订修改成功
    /// </summary>
    BookExchanged = 8,
    /// <summary>
    /// 改签出票中
    /// </summary>
    Exchanging = 9,
    /// <summary>
    /// 改签
    /// </summary>
    Exchanged = 10,
    /// <summary>
    /// 换开
    /// </summary>
    ChangeTicket = 11,
    /// <summary>
    /// 出票使用
    /// </summary>
    IssueUsed = 12,
    /// <summary>
    /// 改签使用
    /// </summary>
    ExchangeUsed = 13,
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
    Exception = 16,
    /// <summary>
    /// 改签废除中
    /// </summary>
    ExchangeAbolishing = 17

}