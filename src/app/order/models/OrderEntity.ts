import { OrderPayCostEntity } from "./OrderPayCostEntity";
import {
  OrderTravelEntity,
  OrderTravelPayType,
  OrderTravelType
} from "./OrderTravelEntity";
import { OrderFlightTicketEntity } from "./OrderFlightTicketEntity";
import { OrderTrainTicketEntity } from "./OrderTrainTicketEntity";
import { OrderHotelEntity } from "./OrderHotelEntity";
import { OrderLinkmanEntity } from "./OrderLinkmanEntity";
import { OrderPassengerEntity } from "./OrderPassengerEntity";
import { OrderInsuranceEntity, OrderPayEntity } from "./OrderInsuranceEntity";
import { AccountItemEntity } from "src/app/account/models/AccountItemEntity";
import { OrderNoteEntity } from "./OrderNoteEntity";
import { OrderInvoiceCostEntity } from "./OrderInvoiceCostEntity";
import { OrderTagEntity } from "./OrderTagEntity";
import { OrderLockerEntity } from "./OrderLockerEntity";
import { OrderAttachmentEntity } from "./OrderAttachmentEntity";
import { OrderExpressEntity } from "./OrderExpressEntity";
import { OrderCardEntity } from "./OrderCardEntity";
import { OrderComplaintEntity } from "./OrderComplaintEntity";
import { OrderInvoiceEntity } from "./OrderInvoiceEntity";
import { OrderProductEntity } from "./OrderProductEntity";
import { OrderNumberEntity } from "./OrderNumberEntity";
import { TaskEntity } from 'src/app/workflow/models/TaskEntity';
import { BaseVariablesEntity } from 'src/app/models/BaseVariablesEntity';
import { AccountEntity } from 'src/app/account/models/AccountEntity';
import { OrderCarEntity } from './OrderCarEntity';

export class OrderEntity extends BaseVariablesEntity {

  Id: string;
  vmIsCheckPay: boolean;
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

  /// <summary>
  /// 支付方式
  /// </summary>
  PayTypeArray: string[];

  /// <summary>
  /// 路由编号
  /// </summary>
  RouteId: string;

  /// <summary>
  /// 订单明细
  /// </summary>
  OrderItems: OrderItemEntity[];
  /// <summary>
  /// 收款纪录
  /// </summary>
  OrderPays: OrderPayEntity[];
  /// <summary>
  /// 收款纪录
  /// </summary>
  OrderPayCosts: OrderPayCostEntity[];

  /// <summary>
  /// 订单发票
  /// </summary>
  OrderInvoices: OrderInvoiceEntity[];
  /// <summary>
  /// 收款纪录
  /// </summary>
  OrderInvoiceCosts: OrderInvoiceCostEntity[];

  /// <summary>
  /// 维护记录
  /// </summary>
  OrderNotes: OrderNoteEntity[];
  /// <summary>
  /// 订单标签
  /// </summary>
  OrderTags: OrderTagEntity[];
  /// <summary>
  /// 订单锁
  /// </summary>
  OrderLockers: OrderLockerEntity[];

  /// <summary>
  /// 附件
  /// </summary>
  OrderAttachments: OrderAttachmentEntity[];
  /// <summary>
  /// 快递信息
  /// </summary>
  OrderExpresses: OrderExpressEntity[];
  /// <summary>
  /// 火车票订单
  /// </summary>
  OrderCards: OrderCardEntity[];

  /// <summary>
  /// 订单投诉
  /// </summary>
  OrderComplaints: OrderComplaintEntity[];

  /// <summary>
  /// 机票
  /// </summary>
  OrderFlightTickets: OrderFlightTicketEntity[];

  /// <summary>
  /// 机票
  /// </summary>
  OrderTrainTickets: OrderTrainTicketEntity[];

  /// <summary>
  /// 酒店
  /// </summary>
  OrderHotels: OrderHotelEntity[];
  /// <summary>
  /// 订单联系人
  /// </summary>
  OrderLinkmans: OrderLinkmanEntity[];
  /// <summary>
  /// 乘客信息
  /// </summary>
  OrderPassengers: OrderPassengerEntity[];

  /// <summary>
  /// OrderTravel
  /// </summary>
  OrderTravels: OrderTravelEntity[];
  /// <summary>
  /// OrderInsurances
  /// </summary>
  OrderInsurances: OrderInsuranceEntity[];
  AccountItem: AccountItemEntity;

  /// <summary>
  /// 原数据
  /// </summary>
  DataEntity: OrderEntity;

  /// <summary>
  /// 状态
  /// </summary>
  Status: OrderStatusType;
  /// <summary>
  /// 状态名称
  /// </summary>
  StatusName: string;
  /// <summary>
  /// 出差类型
  /// </summary>
  TravelType: OrderTravelType;
  /// <summary>
  /// 支付方式
  /// </summary>
  TravelPayType: OrderTravelPayType;
  /// <summary>
  /// 是否VIP
  /// </summary>
  IsVip: boolean;

  /// <summary>
  /// 订单商品
  /// </summary>
  OrderProducts: OrderProductEntity[];

  /// <summary>
  /// 订单编号
  /// </summary>
  OrderNumbers: OrderNumberEntity[];

  /// <summary>
  /// 订单任务
  /// </summary>
  Tasks: TaskEntity[];
  OrderCars: OrderCarEntity[];


  Queues: any[];

}
export class OrderItemEntity extends BaseVariablesEntity {
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
