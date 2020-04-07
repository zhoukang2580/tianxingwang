import { OrderEntity, OrderStatusType } from './OrderEntity';

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


export class OrderTravelEntity {
  Status: OrderStatusType;
  TravelType: OrderStatusType;
  TravelPayType: OrderTravelPayType;
  ExpenseType: string;
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
