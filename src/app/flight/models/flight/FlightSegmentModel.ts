import { CabinTypeEnum } from './CabinTypeEnum';
import { StopCityModel } from "./StopCityModel";
import { CabinModel } from "./CabinModel";
import { FareTypeEnum } from './FareTypeEnum';
export class FlightSegmentModel {
  Airline: string; //  航空公司
  AirlineName: string; //  航空公司名称
  Number: string; //  航班号
  Carrier: string; //  承运航空公司
  CarrierName: string; //  承运航空公司名称
  CodeShareNumber: string; //  代码共享航班号
  FromCity: string; //  始发城市
  FromCityName: string; //  始发城市名称
  FromAirport: string; //  始发机场
  FromAirportName: string; //  始发机场名称
  FromTerminal: string; //  始发航站楼
  ToCity: string; //  到达城市
  ToCityName: string; //  到达城市名称
  ToAirport: string; //  到达机场
  ToAirportName: string; //  到达机场名称
  ToTerminal: string; //  到达航站楼
  TakeoffTime: string; //  起飞时间
  ArrivalTime: string; //  到达时间
  PlaneType: string; //  机型
  PlaneTypeName: string; //  机型描述
  Distance: number; //  距离
  FlyTime: number; //  飞行时间（分钟）
  FlyTimeName: string; //  飞行时间描述
  StopCities: StopCityModel[]; // List<StopCity> 经停城市列表
  YFare: string; //  经济舱全价
  CFare: string; //  公务舱全价
  FFare: string; //  头等舱全价
  Tax: string; //  税收
  LowestFare: string; //  最低价
  LowestCabinCode: string; //  最低价舱位
  LowestDiscount: string; //  最低价折扣
  // todo:尚未找到对应的类型
  LowestCabinType: CabinTypeEnum; // int 最低价舱位类型
  // todo:尚未找到对应的类型
  LowestCabinFareType: FareTypeEnum; // int 最低价舱位价格类型
  Variables: string; // Json {"FlightRph":"01010701","FlightKey":"***"}
  Cabins: CabinModel[]; // List<Cabin> 舱位列表
}
