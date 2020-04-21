import { OrderEntity, OrderItemEntity } from "./OrderEntity";
import { OrderPassengerEntity } from "./OrderPassengerEntity";
import { TrainBookType } from "src/app/train/models/TrainBookType";
import { OrderTravelEntity } from "./OrderTravelEntity";
import { OrderPayEntity, OrderInsuranceEntity } from "./OrderInsuranceEntity";
import { TrainSeatType } from "src/app/train/models/TrainEntity";
import { OrderTrainTicketStatusType } from "./OrderTrainTicketStatusType";
import { OrderTrainTripEntity } from "./OrderTrainTripEntity";
import { OrderInvoiceEntity } from "./OrderInvoiceEntity";
import { BaseVariablesEntity } from "src/app/models/BaseVariablesEntity";
export class OrderTrainTicketEntity extends BaseVariablesEntity {
  /// <summary>
  /// 乘客
  /// </summary>
  Passenger: OrderPassengerEntity;
  /// <summary>
  /// 所属申请单
  /// </summary>
  Order: OrderEntity;
  /// <summary>
  ///
  /// </summary>
  BookType: TrainBookType;
  /// <summary>
  ///
  /// </summary>
  BookCode: string;
  /// <summary>
  /// 供应商
  /// </summary>
  Supplier: string;

  /// <summary>
  ///
  /// </summary>
  Number: string;
  /// <summary>
  /// 取票单号
  /// </summary>
  TicketOrderNumber: string;

  /// <summary>
  /// 外部单号
  /// </summary>
  OutNumber: string;

  /// <summary>
  /// 编号
  /// </summary>
  Key: string;

  /// <summary>
  /// 坐位
  /// </summary>
  SeatType: TrainSeatType;

  /// <summary>
  /// 坐位名称
  /// </summary>
  SeatTypeName: string;
  isShowOriginalTicket: boolean;
  /// <summary>
  /// 出发站名
  /// </summary>
  TicketNo: string;

  /// <summary>
  /// 出发站名
  /// </summary>
  Detail: string;
  /// <summary>
  /// 出票时间
  /// </summary>
  BookTime: string;
  Explain: string;
  /// <summary>
  /// 出票时间
  /// </summary>
  IssueTime: string;

  RefundTime: string;
  /// <summary>
  /// 退改签日期
  /// </summary>
  ExchangeTime: string;
  /// <summary>
  /// 票面价
  /// </summary>
  TicketPrice: string;

  /// <summary>
  /// 状态
  /// </summary>
  Status: OrderTrainTicketStatusType;
  /// <summary>
  /// 状态
  /// </summary>
  StatusName: string;
  Remark: string;
  OrderTrainTrips: OrderTrainTripEntity[];

  OrderPays: OrderPayEntity[];
  OrderItems: OrderItemEntity[];

  OrderInvoices: OrderInvoiceEntity[];
  OrderInsurances: OrderInsuranceEntity[];
  OrderTravel: OrderTravelEntity;
}
