import { BaseVariablesEntity } from "./../../tmc/models/BaseVariablesEntity";
import { OrderFlightTicketEntity } from "./OrderFlightTicketEntity";
import { OrderInsuranceEntity } from "./OrderInsuranceEntity";
import { OrderFlightTripStatusType } from "./OrderFlightTripStatusType";
export class OrderFlightTripEntity extends BaseVariablesEntity {
  /// <summary>
  /// 订单机票
  /// </summary>
  OrderFlightTicket: OrderFlightTicketEntity; //

  /// <summary>
  /// 所属行程组
  /// </summary>
  Key: string; //

  /// <summary>
  /// /
  /// </summary>
  FlightNumber: string;
  /// <summary>
  /// 承运人
  /// </summary>
  Carrier: string; //
  /// <summary>
  /// 承运人名称
  /// </summary>
  CarrierName: string; //
  /// <summary>
  /// 基础舱位
  /// </summary>
  CabinType: string; //
  /// <summary>
  /// 共享航班
  /// </summary>
  CodeShareNumber: string; //
  /// <summary>
  /// 舱位
  /// </summary>

  /// <summary>
  /// /
  /// </summary>
  CabinCode: string;

  /// <summary>
  /// 舱位
  /// </summary>

  /// <summary>
  /// /
  /// </summary>
  ShowCabinCode: string;
  /// <summary>
  /// 折扣
  /// </summary>
  Discount: string; //
  /// <summary>
  /// 始发机场
  /// </summary>
  FromAirport: string; //
  /// <summary>
  /// 城市名称
  /// </summary>
  FromCityName: string; //
  /// <summary>
  /// 机场名称
  /// </summary>
  FromAirportName: string; //
  /// <summary>
  /// 到达机场
  /// </summary>
  ToAirport: string; //
  /// <summary>
  /// 城市名称
  /// </summary>
  ToCityName: string; //
  /// <summary>
  /// 机场名称
  /// </summary>
  ToAirportName: string; //
  /// <summary>
  /// 起飞时间
  /// </summary>
  TakeoffTime: string; //
  TakeoffDate: string;
  TakeoffShortTime: string;
  /// <summary>
  /// 到达时间
  /// </summary>
  ArrivalTime: string; //
  ArrivalDate: string;
  ArrivalShortTime: string;
  IsSelfBook: boolean; // 是否代订
  /// <summary>
  /// 始发航站楼
  /// </summary>
  FromTerminal: string; //
  /// <summary>
  /// 到达航站楼
  /// </summary>
  ToTerminal: string; //
  /// <summary>
  /// 机型
  /// </summary>
  PlaneType: string; //
  /// <summary>
  /// 机型大小描述
  /// </summary>
  PlaneTypeDescribe: string; //
  /// <summary>
  /// 飞行距离
  /// </summary>
  Distance: string; //
  /// <summary>
  /// Y舱价格
  /// </summary>
  YPrice: string; //
  /// <summary>
  /// 基础舱位价格
  /// </summary>
  BasicPrice: string; //
  /// <summary>
  /// 票面价
  /// </summary>
  TicketPrice: string; //
  /// <summary>
  ///  机票 chengb
  /// </summary>
  TicketCost: string; //
  /// <summary>
  /// 税收
  /// </summary>
  Tax: string; //
  /// <summary>
  /// 税收
  /// </summary>
  TaxCost: string; //
  /// <summary>
  /// 奖励
  /// </summary>
  Reward: string; //

  /// <summary>
  /// 退票规则
  /// </summary>
  RefundRule: string; //
  /// <summary>
  /// 更改规则
  /// </summary>
  ChangeRule: string; //
  /// <summary>
  /// 签转规则
  /// </summary>
  EiRule: string; //
  /// <summary>
  /// 始发目的地
  /// </summary>
  IsFromDestination: boolean; //
  /// <summary>
  /// 到达目的地
  /// </summary>
  IsToDestination: boolean; // :string;//

  /// <summary>
  /// 备注
  /// </summary>
  Remark: string;

  /// <summary>
  /// 机票服务费类型
  /// </summary>
  FareType: string;
  /// <summary>
  /// 机票服务费类型
  /// </summary>
  CurrentLowestFare: string;
  /// <summary>
  /// 机票服务费类型
  /// </summary>
  CurrentLowestCabinCode: string;
  /// <summary>
  /// 是否经停
  /// </summary>
  StopCities: string;
  IsStop: boolean;

  /// <summary>
  /// 最低价
  /// </summary>
  LowerPrice: string;
  /// <summary>
  /// 最低价航班
  /// </summary>
  LowerFlightNumber: string;

  /// <summary>
  /// 最低价舱位
  /// </summary>
  LowestCabinCode: string;

  /// <summary>
  /// 最低价折扣
  /// </summary>
  LowerDiscount: string;
  /// <summary>
  /// 最低价起飞时间
  /// </summary>
  LowerTakeOffTime: string;

  OrderInsurances: OrderInsuranceEntity;

  /// <summary>
  /// 航段状态
  /// </summary>
  Status: OrderFlightTripStatusType;

  StatusName: string; //  Status.GetName();
  tripDesc: string;
  /// <summary>
  /// 起飞城市机场名称
  /// </summary>
  FromCityAirportName: string;

  /// <summary>
  /// 到达城市机场名称
  /// </summary>
  ToCityAirportName: string;

  /// <summary>
  /// 获得飞行时间
  /// 2h30m
  /// </summary>
  /// <returns></returns>
  FlyTime: string;
}
