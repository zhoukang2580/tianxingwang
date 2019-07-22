import { AccountEntity } from "./AccountEntity";

export enum OrderTravelPayType {
  /// <summary>
  /// 公司
  /// </summary>
  Company = 1,
  /// <summary>
  /// 个人
  /// </summary>
  Person = 2,
  /// <summary>
  /// 余额支付
  /// </summary>
  Balance = 3,
  /// <summary>
  /// 信用支付
  /// </summary>
  Credit = 4
}
export enum OrderTravelType {
  /// <summary>
  /// 公司
  /// </summary>
  Business = 1,
  /// <summary>
  /// 个人
  /// </summary>
  Person = 2
}
export class OrderEntity {
  Id: string;
  /// <summary>
  /// 订单编号
  /// </summary>
  Number: string;
  /// <summary>
  ///来源
  /// </summary>
  Channel: string;
  /// <summary>
  /// 订单类型
  /// </summary>
  Type: string;
  /// <summary>
  /// 下单日期
  /// </summary>
  OrderDate: string;
  /// <summary>
  /// 保留时长
  /// </summary>
  HoldTime: string;
  /// <summary>
  /// 应收金额
  /// </summary>
  TotalAmount: string;
  /// <summary>
  /// 可开具发票金额
  /// </summary>
  TotalInvoiceAmount: string;
  /// <summary>
  /// 总共成本
  /// </summary>
  TotalCostAmount: string;
  /// <summary>
  /// 可开具发票金额
  /// </summary>
  TotalInvoiceCostAmount: string;
  /// <summary>
  /// 实收金额
  /// </summary>
  PayAmount: string;
  /// <summary>
  /// 已开发票金额
  /// </summary>
  PayInvoiceAmount: string;
  /// <summary>
  /// 成本金额
  /// </summary>
  PayCostAmount: string;
  /// <summary>
  /// 已开发票金额
  /// </summary>
  PayInvoiceCostAmount: string;
  /// <summary>
  /// 支付方式
  /// </summary>
  PayTypes: string;
  /// <summary>
  /// 所属账户
  /// </summary>
  Account: AccountEntity;
  /// <summary>
  /// 备注
  /// </summary>
  Remark: string;
  PayTypeArray: string[];
  RouteId: string;

  /// <summary>
  /// 订单明细
  /// </summary>
  OrderItems: OrderItemEntity[];
  /// <summary>
  /// 收款纪录
  /// </summary>
  OrderPays: any[];
  /// <summary>
  /// 收款纪录
  /// </summary>
  OrderPayCosts: any[];

  /// <summary>
  /// 订单发票
  /// </summary>
  OrderInvoices: any[];
  /// <summary>
  /// 收款纪录
  /// </summary>
  OrderInvoiceCosts: any[];

  /// <summary>
  /// 维护记录
  /// </summary>
  OrderNotes: any[];
  /// <summary>
  /// 订单标签
  /// </summary>
  OrderTags: any[];
  /// <summary>
  /// 订单锁
  /// </summary>
  OrderLockers: any[];

  /// <summary>
  /// 附件
  /// </summary>
  OrderAttachments: any[];
  /// <summary>
  /// 快递信息
  /// </summary>
  OrderExpresses: any[];
  /// <summary>
  /// 火车票订单
  /// </summary>
  OrderCards: any[];

  /// <summary>
  /// 订单投诉
  /// </summary>
  OrderComplaints: any[];

  /// <summary>
  /// 机票
  /// </summary>
  OrderFlightTickets: any[];

  /// <summary>
  /// 机票
  /// </summary>
  OrderTrainTickets: any[];

  /// <summary>
  /// 酒店
  /// </summary>
  OrderHotels: any[];
  /// <summary>
  /// 订单联系人
  /// </summary>
  OrderLinkmans: any[];
  /// <summary>
  /// 乘客信息
  /// </summary>
  OrderPassengers: any[];

  /// <summary>
  /// OrderTravel
  /// </summary>
  OrderTravels: OrderTravelEntity[];
  /// <summary>
  /// OrderInsurances
  /// </summary>
  OrderInsurances: any[];
  AccountItem: any[];

  /// <summary>
  /// 原数据
  /// </summary>
  DataEntity: OrderEntity;
}
export class OrderItemEntity {
  /// <summary>
  /// 订单
  /// </summary>
  Order: OrderEntity;
  /// <summary>
  /// 标签
  /// </summary>
  Tag: string;
  /// <summary>
  /// 编号
  /// </summary>
  Key: string;
  /// <summary>
  /// 编号
  /// </summary>
  Number: string;
  /// <summary>
  /// 名称
  /// </summary>
  Name: string;
  /// <summary>
  /// 金额
  /// </summary>
  Amount: string;
  /// <summary>
  /// 成本金额
  /// </summary>
  CostAmount: string;
  /// <summary>
  /// 发票金额
  /// </summary>
  InvoiceAmount: string;
  /// <summary>
  /// 成本发票
  /// </summary>
  InvoiceCostAmount: string;

  /// <summary>
  /// 数据
  /// </summary>
  DataEntity: OrderItemEntity;
  /// <summary>
  /// 备注
  /// </summary>
  Remark: string;
  /// <summary>
  /// 机票客户扣率
  /// </summary>
  TmcRate: string;

  /// <summary>
  /// 机票结算扣率
  /// </summary>
  SettleRate: string;

  /// <summary>
  ///
  /// </summary>
  IsCreateUatp: boolean;
}
export enum OrderStatusType {
  /// <summary>
  /// 交易取消
  /// </summary>
  Cancel = 1,
  /// <summary>
  /// 交易完成
  /// </summary>
  Finish = 2,
  /// <summary>
  /// 等待处理
  /// </summary>
  WaitHandle = 3,
  /// <summary>
  /// 等待支付
  /// </summary>
  WaitPay = 4,
  /// <summary>
  /// 等待发货
  /// </summary>
  WaitDelivery = 5,
  /// <summary>
  /// 等待签收
  /// </summary>
  WaitSign = 6
}
export class OrderTravelEntity {
  Status: OrderStatusType;
  TravelType: OrderStatusType;
  TravelPayType: OrderTravelPayType;
  StatusName: string;
  IsVip: boolean;
  OrderProducts: any[];
  OrderNumbers: any[];
  Tasks: any[];
  Queues: any[];
  Variables: any;
  /// <summary>
  /// 订单编号
  /// </summary>
  Order: OrderEntity;

  /// <summary>
  /// 订单类型
  /// </summary>
  OrderType: string;
  Key: string;

  /// <summary>
  /// 成本中心
  /// </summary>
  CostCenterCode: string;
  /// <summary>
  /// 成本中心
  /// </summary>
  CostCenterName: string;
  /// <summary>
  /// 组织名称
  /// </summary>
  OrganizationName: string;
  /// <summary>
  /// 组织代码
  /// </summary>
  OrganizationCode: string;
  /// <summary>
  /// 违反差旅政策内容
  /// </summary>
  IllegalPolicy: string;
  /// <summary>
  /// 违反差旅政策原因
  /// </summary>
  IllegalReason: string;
  /// <summary>
  /// 提醒
  /// </summary>
  Tips: string;
}
