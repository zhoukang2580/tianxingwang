import { StopCityModel } from "./StopCityModel";
export class FlightBookSegmentModel {
  Airline: string; //  Yes 航空公司
  AirlineName: string; //  Yes 航空公司名称
  Number: string; //  Yes 航班号
  Carrier: string; //  Yes 承运航空公司
  CarrierName: string; //  Yes 承运航空公司名称
  CodeShareNumber: string; //  No 代码共享航班号
  FromCity: string; //  Yes 始发城市
  FromCityName: string; //  Yes 始发城市名称
  FromAirport: string; //  Yes 始发机场
  FromAirportName: string; //  Yes 始发机场名称
  FromTerminal: string; //  Yes 始发航站楼
  ToCity: string; //  Yes 到达城市
  ToCityName: string; //  Yes 到达城市名称
  ToAirport: string; //  Yes 到达机场
  ToAirportName: string; //  Yes 到达机场名称
  ToTerminal: string; //  Yes 到达航站楼
  TakeoffTime: string; //  Yes 起飞时间
  ArrivalTime: string; //  Yes 到达时间
  PlaneType: string; //  Yes 机型
  PlaneTypeName: string; //  No 机型描述
  Distance: number; //  No 距离
  FlyTime: number; //  No 飞行时间（分钟）
  FlyTimeName: string; //  No 飞行时间描述
  StopCities: StopCityModel[]; // List<StopCity> Yes 经停城市列表
  YFare: string; //  Yes 经济舱全价
  CFare: string; //  Yes 公务舱全价
  FFare: string; //  Yes 头等舱全价
  Tax: string; //  Yes 税收
  LowestFare: string; //  Yes 最低价
  LowestCabinCode: string; //  Yes 最低价舱位
  LowestDiscount: string; //  Yes 最低价折扣
  Variables: string; // Json Yes {"FlightRph":"01010701","FlightKey":"***"}
}
