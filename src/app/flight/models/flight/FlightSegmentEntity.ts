import { FlightCabinType } from "./FlightCabinType";
import { FlightCabinFareType } from "./FlightCabinFareType";
import { FlightStopCityEntity } from "./FlightStopCityEntity";
import { FlightCabinEntity } from "./FlightCabinEntity";
import { FlightMealType } from "../../pipes/flight-meal-type.pipe";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { FlightPolicy } from "../PassengerFlightInfo";
import { FlightFareType } from "./FlightFareType";

export class FlightSegmentEntity {
  isLowestPrice: boolean;
  // flightSegment:FlightSegmentEntity;
  Id: string;
  /// <summary>
  /// 航班最低价
  /// </summary>
  LowestFare: string;
  /// <summary>
  /// 航班最低价舱位
  /// </summary>
  LowestCabinCode: string;
  LowestCabinId: string;
  /// <summary>
  /// 航班最低价舱位折扣
  /// </summary>
  LowestDiscount: string;
  /// <summary>
  /// 航班最低价舱位类型
  /// </summary>
  LowestCabinType: FlightCabinType;
  /// <summary>
  /// 最低价舱位价格类型
  /// </summary>
  LowestCabinFareType: FlightFareType;
  /// <summary>
  /// 税收 = FuelSurcharge + AirportTax
  /// </summary>
  Tax: string;
  /// <summary>
  /// 燃油附加费(新增)
  /// </summary>
  FuelFee: string;
  /// <summary>
  /// 机场建设费(新增)
  /// </summary>
  AirportFee: string;
  /// <summary>
  /// 经济舱全价
  /// </summary>
  YFare: string;
  /// <summary>
  /// 公务舱全价
  /// </summary>
  CFare: string;
  /// <summary>
  /// 头等舱全价
  /// </summary>
  FFare: string;
  /// <summary>
  /// 航班号
  /// </summary>
  Number: string;
  /// <summary>
  ///航空公司
  /// </summary>
  Airline: string;
  /// <summary>
  /// 航空公司图标
  /// </summary>
  AirlineSrc: string;
  /// <summary>
  /// 航空公司名称
  /// </summary>
  AirlineName: string;
  /// <summary>
  /// 机型
  /// </summary>
  PlaneType: string;
  /// <summary>
  /// 餐食
  /// M   Meal        不特定餐食
  /// B   Breakfast   早餐
  /// L   Lunch       午餐
  /// C   Alcoholic Beverages Complimentary   免费酒精饮料
  /// K   Continental Breakfast   大陆式早餐
  /// D   Dinner      晚餐
  /// S   Snack Or Brunch 点心或早午餐
  /// O   Cold Meal   冷食
  /// H   Hot Meal    热食
  /// R   Refreshment 茶点或小吃
  /// </summary>
  MealType: FlightMealType;
  /// <summary>
  /// 餐食
  /// </summary>
  Meal: string;
  /// <summary>
  /// 连接级别
  /// DS# 无缝连接级
  /// AS# 近期有航班变更
  /// </summary>
  Link: string;
  /// <summary>
  /// 接受选座
  /// ASR=^
  /// </summary>
  IsChooseSeat: boolean;
  /// <summary>
  /// 机型描述
  /// </summary>
  PlaneTypeDescribe: string;
  /// <summary>
  /// 代码共享实际承运航班号
  /// </summary>
  CodeShareNumber: string;
  /// <summary>
  /// 承运
  /// </summary>
  Carrier: string;
  /// <summary>
  /// 承运名称
  /// </summary>
  CarrierName: string;
  /// <summary>
  /// 出发机场
  /// </summary>
  FromAirport: string;
  /// <summary>
  /// 到达机场
  /// </summary>
  ToAirport: string;
  /// <summary>
  /// 出发机场
  /// </summary>
  FromAirportName: string;
  /// <summary>
  /// 出发机场
  /// </summary>
  FromCityName: string;
  /// <summary>
  /// 到达机场
  /// </summary>
  ToAirportName: string;
  /// <summary>
  /// 到达机场
  /// </summary>
  ToCityName: string;
  /// <summary>
  /// 起飞时间
  /// </summary>
  TakeoffTime: string;
  /// <summary>
  /// 到达时间
  /// </summary>
  ArrivalTime: string;
  /// <summary>
  /// 始发航站楼
  /// </summary>
  FromTerminal: string;
  /// <summary>
  /// 到达航站楼
  /// </summary>
  ToTerminal: string;
  /// <summary>
  /// 是否经停
  /// 经停 True
  /// 直飞 False
  /// </summary>
  IsStop: boolean;
  //Normal价
  BasicPrice: string;
  //前后航班最低价
  LowerPrice: string;
  //前后最低价航班
  LowerFlightNumber: string;
  //当前航班最低价
  CurrentLowestFare: string;
  //退政策
  RefundRule: string;
  //改政策
  ChangeRule: string;
  //Ei政策
  EiRule: string;
  /// <summary>
  /// 经停城市
  /// </summary>
  StopCities: FlightStopCityEntity[];
  /// <summary>
  /// 变量数据
  /// </summary>
  Variables: { [key: string]: string };
  /// <summary>
  /// 飞行距离
  /// </summary>
  Distance: string;
  /// <summary>
  /// 获得飞行时间
  /// </summary>
  /// <returns></returns>
  FlyTime: string;
  FlyTimeName: string;
  MealTypeName: string;
  TakeoffTimeStamp: number;
  ArrivalTimeStamp: number;
  AddOneDayTip: string;
  PassengerKeys: string[];
  FromCity: TrafficlineEntity;
  ToCity: TrafficlineEntity;
  // PoliciedCabins: FlightPolicy[];
  Cabins: FlightCabinEntity[];

  TakeoffShortTime: string;

  ArrivalShortTime: string;
  TrackById: number;
}
