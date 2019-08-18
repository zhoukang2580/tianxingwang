import { InsuranceProductEntity } from "src/app/insurance/models/InsuranceProductEntity";
import { TrainSeatEntity } from "./TrainSeatEntity";
import { TrainScheduleEntity } from "./TrainScheduleEntity";
import { TrainType } from "./TrainType";
import { TrainBookType } from "./TrainBookType";
import { TrainSupplierType } from "src/app/train/models/TrainSupplierType";

export class TrainEntity {
  BookType: TrainBookType;
  BookCode: string;
  SupplierType: TrainSupplierType;
  /// <summary>
  /// 开售时间
  /// </summary>
  SaleTime: string;
  AddOneDayTip: string;
  /// <summary>
  /// 列车从出发站到达目的站的运行天数
  /// 0：当日到达，
  /// 1：次日到达，
  /// 2：三日到达，
  /// 3：四日到达，依此类推
  /// </summary>
  ArriveDays: number;
  /// <summary>
  /// 是否可以预订
  /// </summary>
  IsBook: boolean;
  IsForceBook: boolean;
  /// <summary>
  ///  车次
  /// </summary>
  TrainCode: string;
  /// <summary>
  /// 是否凭二代身份证直接进
  /// </summary>
  IsAccessByIdCard: boolean;
  /// <summary>
  /// 列车号
  /// </summary>
  TrainNo: string;
  /// <summary>
  /// 列车类型
  /// </summary>
  TrainType: TrainType;
  /// <summary>
  /// 列车开车车站
  /// </summary>
  FromStationName: string;
  /// <summary>
  /// 列车开车站代码
  /// </summary>
  FromStationCode: string;
  /// <summary>
  /// 列车开车车站
  /// </summary>
  ToStationName: string;
  /// <summary>
  /// 列车开车站代码
  /// </summary>
  ToStationCode: string;
  /// <summary>
  /// 始发车站名
  /// </summary>
  StartStationName: string;
  /// <summary>
  /// 终点车站名
  /// </summary>
  EndStationName: string;
  /// <summary>
  /// 发车时间
  /// </summary>
  StartTime: string;
  /// <summary>
  /// 到达时间
  /// </summary>
  ArrivalTime: string;
  StartTimeStamp: number;
  ArrivalTimeStamp: number;
  StartShortTime: string;
  ArrivalShortTime: string;
  /// <summary>
  /// 到达时间
  /// </summary>
  /// <summary>
  /// 行驶里程
  /// </summary>
  Distance: number;
  /// <summary>
  /// 备注
  /// </summary>
  Remark: string;

  IsSameDestination: boolean;

  /// <summary>
  /// 坐席信息
  /// </summary>
  Seats: TrainSeatEntity[];
  /// <summary>
  /// 时刻表
  /// </summary>
  Schedules: TrainScheduleEntity[];
  /// <summary>
  /// 预订的位置
  /// </summary>
  BookSeatType: TrainSeatType;
  /// <summary>
  /// 预订的位置
  /// </summary>
  BookSeatLocation: string;
  InsuranceProducts: InsuranceProductEntity[];
  /// <summary>
  /// 运行分钟数
  /// </summary>
  TravelTime: number;
  /// <summary>
  /// 运行时间名称
  /// </summary>
  TravelTimeName: string;
  /// <summary>
  /// 列车类型名称
  /// </summary>
  TrainTypeName: string;

  /// <summary>
  /// 是否允许预订
  /// </summary>
  IsAllowOrder: boolean;

  /// <summary>
  /// 违规
  /// </summary>
  Rules: { [key: string]: string };
}
export enum TrainSeatType {
  /// <summary>
  /// 无座 1
  /// </summary>
  NoSeat = 1,
  /// <summary>
  /// 硬座 1
  /// </summary>
  HardSeat = 2,
  /// <summary>
  /// 软座 2
  /// </summary>
  SoftSeat = 3,
  /// <summary>
  /// 硬卧上 3
  /// </summary>
  HardBerthUp = 4,
  /// <summary>
  /// 硬卧中 3
  /// </summary>
  HardBerth = 5,
  /// <summary>
  /// 硬卧下 3
  /// </summary>
  HardBerthDown = 6,
  /// <summary>
  /// 软卧上 4
  /// </summary>
  SoftBerthUp = 7,
  /// <summary>
  /// 软卧 4
  /// </summary>
  SoftBerth = 8,
  /// <summary>
  /// 高级软卧 6
  /// </summary>
  HighGradeSoftBerth = 9,
  /// <summary>
  /// 二等座 O
  /// </summary>
  SecondClassSeat = 10,
  /// <summary>
  /// 一等座 M
  /// </summary>
  FirstClassSeat = 11,
  /// <summary>
  /// 特等座 P
  /// </summary>
  SpecialSeat = 12,
  /// <summary>
  /// 商务座 9
  /// </summary>
  BusinessSeat = 13,
  /// <summary>
  /// 动卧上 F
  /// </summary>
  BusinessBerthUp = 14,
  /// <summary>
  /// 动卧下 F
  /// </summary>
  BusinessBerthDown = 15,
  /// <summary>
  /// 其他
  /// </summary>
  Other = 16,
  /// <summary>
  /// 一等卧 I
  /// </summary>
  FirstClassBerth = 17,
  /// <summary>
  /// 一等卧下 I
  /// </summary>
  FirstClassBerthDown = 18,
  /// <summary>
  /// 二等卧 J
  /// </summary>
  SecondClassBerth = 19,
  /// <summary>
  /// 二等卧中 J
  /// </summary>
  SecondClassBerthMiddle = 20,
  /// <summary>
  /// 二等卧下 J
  /// </summary>
  SecondClassBerthDown = 21
}
