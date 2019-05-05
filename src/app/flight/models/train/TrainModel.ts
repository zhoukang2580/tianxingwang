import { TrainSeatModel } from "./TrainSeatModel";
import { SeatTypeEnum } from "./SeatTypeEnum";
import { TrainScheduleModel } from "./TrainScheduleModel";
import { TrainTypeEnum } from "./TrainTypeEnum";

export class TrainModel {
  SupplierType: number; //  Yes 供应商 0
  SaleTime: string; //  Yes 开售时间
  ArriveDays: number; // Yes 列车从出发站到达目的站的运行天数 0:当日到达 1:次 日到达 2:三日到达 3:四日到达 以此类推
  IsBook: boolean; //  Yes 是否可以预订
  TrainCode: string; //  Yes 车次
  IsAccessByIdCard: boolean; //  Yes 可凭二代身份证直接进
  TrainNo: string; //  Yes 列车号
  TrainType: TrainTypeEnum; //  Yes 列车类型
  FromStationName: string; //  Yes 上车车站名称
  FromStationCode: string; //  Yes 上车车站代码
  ToStationName: string; //  Yes 下车车站名称
  ToStationCode: string; //  Yes 下车车站代码
  StartStationName: string; //  Yes 始发车站名称
  EndStationName: string; //  Yes 到达车站名称
  StartTime: string; //  Yes 发车时间
  ArrivalTime: string; //  Yes 到达时间
  Distance: number; //  No 行驶里程
  Remark: string; //  No 备注
  TravelTime: number; //  Yes 运行分钟数
  TravelTimeName: string; //  Yes 运行时间名称(1h23m)
  TrainTypeName: string; //  Yes 列车类型名称
  IsAllowOrder: boolean; //  Yes 是否允许预订
  Rules: { [key: string]: string }; //  违规原因
  BookSeatType: SeatTypeEnum; //  Yes 预订座位类型
  BookSeatLocation: string; //  Yes 预订座位编号
  Seats: TrainSeatModel[]; // List<TrainSeatEntity> Yes 座席信息列表
  Schedules: TrainScheduleModel[]; // List<TrainScheduleEntity> Yes 时刻表列表(预订时无效)
}
