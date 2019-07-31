import { BaseVariablesEntity } from "./../../tmc/models/BaseVariablesEntity";
import { OrderTravelEntity } from "./OrderTravelEntity";
import { OrderCardEntity } from "./OrderCardEntity";
import { OrderInvoiceEntity } from "./OrderInvoiceEntity";
import { OrderItemEntity, OrderEntity } from "./OrderEntity";
import { OrderPayEntity } from "./OrderInsuranceEntity";
import { HotelBookType } from "src/app/hotel/models/HotelBookType";
import { HotelPaymentType } from "src/app/hotel/models/HotelPaymentType";
import { OrderPassengerEntity } from "./OrderPassengerEntity";
import { RoomPlanEntity } from "src/app/hotel/models/RoomPlanEntity";

export class OrderHotelEntity extends BaseVariablesEntity {
  /// <summary>
  /// 所属申请单
  /// </summary>
  Order: OrderEntity;
  /// <summary>
  /// 乘客
  /// </summary>
  Passenger: OrderPassengerEntity;
  /// <summary>
  /// 酒店联系信息
  /// </summary>
  CityName: string;
  /// <summary>
  /// 酒店联系信息
  /// </summary>
  CityCode: string;

  /// <summary>
  /// 编号
  /// </summary>
  Key: string;
  /// <summary>
  /// 供应商
  /// </summary>
  Supplier: string;
  /// <summary>
  /// 酒店编号
  /// </summary>
  HotelNumber: string;
  /// <summary>
  /// 房型编号
  /// </summary>
  RoomNumber: string;
  /// <summary>
  /// 房型编号
  /// </summary>
  PlanNumber: string;
  /// <summary>
  /// 酒店编号
  /// </summary>
  HotelName: string;
  /// <summary>
  /// 酒店联系信息
  /// </summary>
  HotelContact: string;
  /// <summary>
  /// 酒店地址
  /// </summary>
  HotelAddress: string;
  /// <summary>
  /// 酒店星际
  /// </summary>
  HotelStar: string;
  /// <summary>
  /// 酒店分类
  /// </summary>
  HotelCategory: string;
  /// <summary>
  /// 酒店品牌
  /// </summary>
  HotelBrand: string;
  /// <summary>
  /// 酒店品牌
  /// </summary>
  HotelPostalCode: string;
  /// <summary>
  /// 酒店品牌
  /// </summary>
  HotelFax: string;
  /// <summary>
  /// 房型编号
  /// </summary>
  RoomName: string;
  /// <summary>
  /// 价格计划
  /// </summary>
  PlanName: string;
  /// <summary>
  /// 客户姓名
  /// </summary>
  CustomerName: string;
  /// <summary>
  /// 入住日期
  /// </summary>
  BeginDate: string;
  /// <summary>
  /// 离店日期
  /// </summary>
  EndDate: string;
  /// <summary>
  /// 离店时间
  /// </summary>
  CheckoutTime: string;
  /// <summary>
  /// 到店时间
  /// </summary>
  CheckinTime: string;
  /// <summary>
  /// 房间数
  /// </summary>
  Count: string;
  /// <summary>
  ///
  /// </summary>
  Number: string;
  /// <summary>
  /// 外部单号
  /// </summary>
  OutNumber: string;
  /// <summary>
  /// 酒店类型
  /// </summary>
  Type: OrderHotelType;
  /// <summary>
  /// 预订类型
  /// </summary>
  BookType: HotelBookType;
  /// <summary>
  /// 预订代码
  /// </summary>
  BookCode: string;
  /// <summary>
  /// 预订类型
  /// </summary>
  PaymentType: HotelPaymentType;
  /// <summary>
  /// 预订时间
  /// </summary>
  BookTime: string;
  /// <summary>
  /// 确认时间
  /// </summary>
  ConfirmTime: string;
  /// <summary>
  /// 退单时间
  /// </summary>
  CancelTime: string;
  /// <summary>
  /// 最晚取消时间
  /// </summary>
  LastCancelTime: string;
  /// <summary>
  /// 免费取消时间
  /// </summary>
  FreeCancelTime: string;
  /// <summary>
  /// 最晚支付时间
  /// </summary>
  LastPayTime: string;
  /// <summary>
  /// 担保金额
  /// </summary>
  GuaranteeAmount: string;
  /// <summary>
  /// 罚金
  /// </summary>
  PenaltyAmount: string;
  /// <summary>
  /// 罚金
  /// </summary>
  PenaltyCostAmount: string;
  /// <summary>
  /// 总价
  /// </summary>
  TotalAmount: string;

  /// <summary>
  /// 总价
  /// </summary>
  TotalSalesAmount: string;

  /// <summary>
  /// 早餐
  /// </summary>
  Breakfast: string;
  /// <summary>
  /// 早餐
  /// </summary>
  PlanFacility: string;
  /// <summary>
  /// 早餐
  /// </summary>
  PlanDescription: string;
  /// <summary>
  ///
  /// </summary>
  ConfirmNumber: string;
  /// <summary>
  /// 规则
  /// </summary>
  RuleDescription: string;

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
  /// 订单状态
  /// </summary>
  Status: OrderHotelStatusType;
  /// <summary>
  /// 订单状态
  /// </summary>
  StatusName: string;
  /// <summary>
  /// 备注
  /// </summary>
  Remark: string;

  OrderPays: OrderPayEntity[];
  OrderItems: OrderItemEntity[];

  OrderInvoices: OrderInvoiceEntity[];

  OrderTravel: OrderTravelEntity;

  OrderCard: OrderCardEntity;

  RoomPlan: RoomPlanEntity;
}
export enum OrderHotelType {
  /// <summary>
  /// 国内酒店
  /// </summary>
  Domestic = 1,
  /// <summary>
  /// 国际酒店
  /// </summary>
  International = 2
}
export enum OrderHotelStatusType {
  /// <summary>
  /// 预订中
  /// </summary>
  Booking = 1,
  /// <summary>
  /// 预订成功
  /// </summary>
  Booked = 2,
  /// <summary>
  /// 离店
  /// </summary>
  Checkout = 3,
  /// <summary>
  /// 为入住
  /// </summary>
  NoShow = 4,
  /// <summary>
  /// 等待支付
  /// </summary>
  WaitPay = 5,
  /// <summary>
  /// 支付中
  /// </summary>
  Paying = 6,
  /// <summary>
  /// 支付失败
  /// </summary>
  PayFailure = 7,
  /// <summary>
  /// 退单
  /// </summary>
  Refunded = 8,
  /// <summary>
  /// 废除中
  /// </summary>
  Abolishing = 9,
  /// <summary>
  /// 废除
  /// </summary>
  Abolish = 10,
  /// <summary>
  /// 异常
  /// </summary>
  Exception = 11
}
