import { BaseVariablesEntity } from "src/app/tmc/models/BaseVariablesEntity";
import { OrderTravelPayType, OrderTravelEntity } from "./OrderTravelEntity";
import { InsuranceBookType } from "src/app/insurance/models/InsuranceBookType";
import { OrderEntity, OrderItemEntity } from "./OrderEntity";
import { OrderPassengerEntity } from "./OrderPassengerEntity";
import { OrderFlightTicketEntity } from "./OrderFlightTicketEntity";
import { OrderFlightTripEntity } from "./OrderFlightTripEntity";
import { OrderTrainTicketEntity } from "./OrderTrainTicketEntity";
import { OrderInvoiceEntity } from "./OrderInvoiceEntity";
import { OrderInsuranceStatusType } from "./OrderInsuranceStatusType";

export class OrderInsuranceEntity extends BaseVariablesEntity {
  /// <summary>
  ///
  /// </summary>
  Order: OrderEntity;
  /// <summary>
  /// 投保人
  /// </summary>
  Passenger: OrderPassengerEntity;
  /// <summary>
  /// 状态
  /// </summary>
  Status: OrderInsuranceStatusType;
  /// <summary>
  ///
  /// </summary>
  BookType: InsuranceBookType;
  /// <summary>
  /// 保险类型
  /// </summary>
  InsuranceType: OrderInsuranceType;
  /// <summary>
  ///
  /// </summary>
  TravelPayType: OrderTravelPayType;
  /// <summary>
  ///
  /// </summary>
  BookCode: string;
  TravelKey: string;
  /// <summary>
  ///
  /// </summary>
  Key: string;
  /// <summary>
  ///
  /// </summary>
  AdditionKey: string;
  /// <summary>
  /// 保单号
  /// </summary>
  Number: string;
  /// <summary>
  /// 外部编号
  /// </summary>
  OutNumber: string;
  /// <summary>
  /// 投保单号
  /// </summary>
  InsuranceNo: string;
  /// <summary>
  /// 保单号
  /// </summary>
  PolicyNo: string;
  /// <summary>
  /// 保单号
  /// </summary>
  PolicyUrl: string;
  /// <summary>
  /// 投保时间
  /// </summary>
  BookTime: string;
  /// <summary>
  /// 退保时捷
  /// </summary>
  RefundTime: string;
  /// <summary>
  ///名称
  /// </summary>
  Name: string;
  Detail: string;
  /// <summary>
  /// 关系
  /// </summary>
  Relation: string;

  /// <summary>
  /// 既往病史
  /// </summary>
  MedicalHistory: string;
  /// <summary>
  /// 生效日期
  /// </summary>
  EffectiveDate: string;
  /// <summary>
  /// 到期日期
  /// </summary>
  ExpireDate: string;
  /// <summary>
  /// 保费
  /// </summary>
  Premium: string;
  /// <summary>
  /// 保额
  /// </summary>
  InsuredAmount: string;
  /// <summary>
  /// 数量
  /// </summary>
  Count: string;

  /// <summary>
  /// 供应商
  /// </summary>
  Supplier: string;
  /// <summary>
  ///
  /// </summary>
  Remark: string;
  /// <summary>
  /// 规则
  /// </summary>
  ContactName: string;
  /// <summary>
  /// 规则
  /// </summary>
  ContactMobile: string;
  /// <summary>
  /// 规则
  /// </summary>
  ContactEmail: string;
  /// <summary>
  /// 状态名称
  /// </summary>
  StatusName: string;
  /// <summary>
  /// 预订类型名称
  /// </summary>
  BookTypeName: string;
  /// <summary>
  /// 保险
  /// </summary>
  DataEntity: OrderInsuranceEntity;

  /// <summary>
  /// 支付信息
  /// </summary>
  OrderPays: OrderPayEntity;
  /// <summary>
  /// 发票信息
  /// </summary>
  OrderInvoices: OrderInvoiceEntity;
  /// <summary>
  /// 订单项
  /// </summary>
  OrderItems: OrderItemEntity;
  /// <summary>
  /// 投保人
  /// </summary>
  OrderFlightTicket: OrderFlightTicketEntity;
  /// <summary>
  /// 投保人
  /// </summary>
  OrderFlightTrip: OrderFlightTripEntity;
  /// <summary>
  /// 投保人
  /// </summary>
  OrderTrainTicket: OrderTrainTicketEntity;
  /// <summary>
  /// 投保人
  /// </summary>
  OrderTravel: OrderTravelEntity;
  PenaltyAmount: string;

  PenaltyCost: string;
}
export class OrderPayEntity extends BaseVariablesEntity {
  /// <summary>
  /// 订单
  /// </summary>
  Order: OrderEntity;

  /// <summary>
  /// 编号
  /// </summary>
  Key: string;
  /// <summary>
  /// 标签
  /// </summary>
  Tag: string;
  /// <summary>
  /// 渠道
  /// </summary>
  Channel: string;
  /// <summary>
  /// 类型
  /// </summary>
  Type: string;
  /// <summary>
  /// 类型
  /// </summary>
  Name: string;
  /// <summary>
  ///
  /// </summary>
  Number: string;
  /// <summary>
  /// 收款金额
  /// </summary>
  Amount: string;
  /// <summary>
  /// 手续费
  /// </summary>
  Fee: string;
  /// <summary>
  /// 支付时间
  /// </summary>
  PayTime: string;

  /// <summary>
  /// 备注
  /// </summary>
  Remark: string;
  /// <summary>
  /// 支付状态
  /// </summary>
  Status: OrderPayStatusType;
  /// <summary>
  /// 支付状态
  /// </summary>
  StatusName: string;

  /// <summary>
  /// 数据
  /// </summary>
  DataEntity: OrderPayEntity;
}
export enum OrderPayStatusType {
  /// <summary>
  /// 有效
  /// </summary>
  Effective = 1,
  /// <summary>
  /// 无效
  /// </summary>
  Invalid = 2,
  /// <summary>
  /// 审核中
  /// </summary>
  Auditting = 3
}
export enum OrderInsuranceType {
  /// <summary>
  /// 火车意外险
  /// </summary>
  TrainAccident = 1,
  /// <summary>
  /// 航空意外险
  /// </summary>
  FlightAccident = 2,
  /// <summary>
  /// 航空延误
  /// </summary>
  FlightDelay = 3
}
