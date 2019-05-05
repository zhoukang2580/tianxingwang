export enum OrderStatusEnum {
  // 1 Cancel 交易取消
  // 2 Finish 交易完成
  // 3 WaitHandle 等待处理
  // 4 WaitPay 等待支付
  // 5 WaitDelivery 等待发货
  // 6 WaitSign 等待签收
  Cancel = 1,
  Finish,
  WaitHandle,
  WaitPay,
  WaitDelivery,
  WaitSign
}
