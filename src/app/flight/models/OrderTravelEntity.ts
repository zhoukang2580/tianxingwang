import { AccountEntity } from "./AccountEntity";

export enum OrderTravelPayType {
  /// 公司

  Company = 1,

  /// 个人

  Person = 2,

  /// 余额支付

  Balance = 3,

  /// 信用支付

  Credit = 4
}
export enum OrderTravelType {
  /// 公司

  Business = 1,

  /// 个人

  Person = 2
}
export class OrderEntity {
  Id: string;

  /// 订单编号

  Number: string;

  ///来源

  Channel: string;

  /// 订单类型

  Type: string;

  /// 下单日期

  OrderDate: string;

  /// 保留时长

  HoldTime: string;

  /// 应收金额

  TotalAmount: string;

  /// 可开具发票金额

  TotalInvoiceAmount: string;

  /// 总共成本

  TotalCostAmount: string;

  /// 可开具发票金额

  TotalInvoiceCostAmount: string;

  /// 实收金额

  PayAmount: string;

  /// 已开发票金额

  PayInvoiceAmount: string;

  /// 成本金额

  PayCostAmount: string;

  /// 已开发票金额

  PayInvoiceCostAmount: string;

  /// 支付方式

  PayTypes: string;

  /// 所属账户

  Account: AccountEntity;

  /// 备注

  Remark: string;
  PayTypeArray: string[];
  RouteId: string;

  /// 订单明细

  OrderItems: OrderItemEntity[];

  /// 收款纪录

  OrderPays: any[];

  /// 收款纪录

  OrderPayCosts: any[];

  /// 订单发票

  OrderInvoices: any[];

  /// 收款纪录

  OrderInvoiceCosts: any[];

  /// 维护记录

  OrderNotes: any[];

  /// 订单标签

  OrderTags: any[];

  /// 订单锁

  OrderLockers: any[];

  /// 附件

  OrderAttachments: any[];

  /// 快递信息

  OrderExpresses: any[];

  /// 火车票订单

  OrderCards: any[];

  /// 订单投诉

  OrderComplaints: any[];

  /// 机票

  OrderFlightTickets: any[];

  /// 机票

  OrderTrainTickets: any[];

  /// 酒店

  OrderHotels: any[];

  /// 订单联系人

  OrderLinkmans: any[];

  /// 乘客信息

  OrderPassengers: any[];

  /// OrderTravel

  OrderTravels: OrderTravelEntity[];

  /// OrderInsurances

  OrderInsurances: any[];
  AccountItem: any[];

  /// 原数据

  DataEntity: OrderEntity;
}
export class OrderItemEntity {
  /// 订单

  Order: OrderEntity;

  /// 标签

  Tag: string;

  /// 编号

  Key: string;

  /// 编号

  Number: string;

  /// 名称

  Name: string;

  /// 金额

  Amount: string;

  /// 成本金额

  CostAmount: string;

  /// 发票金额

  InvoiceAmount: string;

  /// 成本发票

  InvoiceCostAmount: string;

  /// 数据

  DataEntity: OrderItemEntity;

  /// 备注

  Remark: string;

  /// 机票客户扣率

  TmcRate: string;

  /// 机票结算扣率

  SettleRate: string;

  ///

  IsCreateUatp: boolean;
}
export enum OrderStatusType {
  /// 交易取消

  Cancel = 1,

  /// 交易完成

  Finish = 2,

  /// 等待处理

  WaitHandle = 3,

  /// 等待支付

  WaitPay = 4,

  /// 等待发货

  WaitDelivery = 5,

  /// 等待签收

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

  /// 订单编号

  Order: OrderEntity;

  /// 订单类型

  OrderType: string;
  Key: string;

  /// 成本中心

  CostCenterCode: string;

  /// 成本中心

  CostCenterName: string;

  /// 组织名称

  OrganizationName: string;

  /// 组织代码

  OrganizationCode: string;

  /// 违反差旅政策内容

  IllegalPolicy: string;

  /// 违反差旅政策原因

  IllegalReason: string;

  /// 提醒

  Tips: string;
}
