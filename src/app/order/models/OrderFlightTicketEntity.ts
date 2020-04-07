import { OrderEntity, OrderItemEntity } from "./OrderEntity";
import { FlightBookType } from "src/app/flight/models/flight/FlightBookType";
import { OrderPassengerEntity } from "./OrderPassengerEntity";
import { OrderFlightTicketType } from "./OrderFlightTicketType";
import { OrderFlightTicketSettleStatusType } from "./OrderFlightTicketSettleStatusType";
import { OrderFlightTicketStatusType } from "./OrderFlightTicketStatusType";
import { OrderTravelEntity } from "./OrderTravelEntity";
import { OrderCardEntity } from "./OrderCardEntity";
import { OrderFlightTripEntity } from "./OrderFlightTripEntity";
import { OrderInsuranceEntity, OrderPayEntity } from "./OrderInsuranceEntity";
import { OrderInvoiceEntity } from "./OrderInvoiceEntity";
import { OrderAttachmentEntity } from "./OrderAttachmentEntity";
import { BaseVariablesEntity } from 'src/app/models/BaseVariablesEntity';

export class OrderFlightTicketEntity extends BaseVariablesEntity {
  BookType: FlightBookType;

  BookCode: string;

  Explain: string;
  /// <summary>
  /// 退改签政策
  /// </summary>
  Order: OrderEntity;
  /// <summary>
  /// 外部单号
  /// </summary>
  Number: string;
  /// <summary>
  /// 外部单号
  /// </summary>
  OutNumber: string;
  /// <summary>
  /// 行程编码
  /// </summary>
  // TravelNumber :string;

  /// <summary>
  /// 供应商
  /// </summary>
  Supplier: string;

  /// <summary>
  /// OfficeCode
  /// </summary>
  OfficeCode: string;

  /// <summary>
  /// 组
  /// </summary>
  Key: string;

  /// <summary>
  /// 所属旅客
  /// </summary>
  Passenger: OrderPassengerEntity;
  /// <summary>
  /// 结算代码
  /// </summary>
  SettleCode: string;
  /// <summary>
  /// 机票号码
  /// </summary>
  TicketNo: string;

  /// <summary>
  /// PNR
  /// </summary>
  Pnr: string;
  /// <summary>
  /// 票证类型
  /// </summary>
  TicketType: OrderFlightTicketType;

  SettleStatus: OrderFlightTicketSettleStatusType;
  SettleTime: string;

  /// <summary>
  /// 预订日期
  /// </summary>
  BookTime: string;

  /// <summary>
  /// 出票日期
  /// </summary>
  IssueTime: string;

  /// <summary>
  /// 退票单号
  /// </summary>
  RefundNo: string;

  /// <summary>
  /// 原始票号
  /// </summary>
  OriginalTicketNo: string;
  /// <summary>
  /// 退改签日期
  /// </summary>
  RefundTime: string;
  /// <summary>
  /// 退改签日期
  /// </summary>
  ExchangeTime: string;

  LastIssueTime: string;

  /// <summary>
  /// 机票状态
  /// </summary>
  Status: OrderFlightTicketStatusType;

  /// <summary>
  /// 备注
  /// </summary>
  Remark: string;

  /// <summary>
  /// 票证类型名称
  /// </summary>
  TicketTypeName: string;
  /// <summary>
  /// 结算状态名称
  /// </summary>
  SettleStatusName: string;

  /// <summary>
  /// 机票状态名称
  /// </summary>
  StatusName: string;

  /// <summary>
  /// 完整票号
  /// xxx-xxxxxxxxxx
  /// </summary>
  FullTicketNo: string;
  OrderFlightTrips: OrderFlightTripEntity[];

  OrderPays: OrderPayEntity[];

  OrderInvoices: OrderInvoiceEntity[];

  OrderInsurances: OrderInsuranceEntity[];
  OrderItems: OrderItemEntity[];

  /// <summary>
  /// 订单机票
  /// </summary>
  OrderCard: OrderCardEntity;
  /// <summary>
  /// 订单机票
  /// </summary>
  OrderTravel: OrderTravelEntity;

  /// <summary>
  /// 附件
  /// </summary>
  OrderAttachment: OrderAttachmentEntity;

  CanAutoRefund: boolean;

  //  退票费用
  // RefundFee :string;

  // RefundCost :string;

  // RefundTicketUsedFee :string;
  RefundDeductionAmount: string;

  RefundDeductionCostAmount: string;

  RefundUsedTicketAmount: string;
  RefundUsedTicketCostAmount: string;

  RefundUsedTicketTax: string;
  RefundUsedTicketCostTax: string;
  RefundRewardRate: string;
  RefundRewardRateCost: string;
  RefundRewardAmount: string;
  RefundRewardCostAmount: string;
  RefundRate: string;
  RefundRateCost: string;
  RefundRateAmount: string;
  RefundRateCostAmount: string;
  //  #endregion

  //  配置属性
  originalTicket: OrderFlightTicketEntity;
  isShowOriginalTicket:boolean;
  PrintNumber: string;
  UatpNumber: string;
  ActualIssueTime: string;
  vmTicketAmount: number; // 订单总价
  vmInsuranceAmount: number; // 保险总价
  vmIsAllowRefund: boolean; // 是否允许退票
  vmIsAllowExchange: boolean; // 是否允许改签
  GetVariable<T>(key: string) {
    this.VariablesJsonObj = this.VariablesJsonObj || JSON.parse(this.Variables);
    return this.VariablesJsonObj[key] as T
  }
}
