export class FlightPatFareSegmentModel {
  FlightNo: string; //  Yes 航班号
  DepartureDateTime: string; //  Yes 起飞时间
  ArrivalDateTime: string; //  Yes 到达时间
  DepartureCode: string; //  Yes 始发机场代码
  ArrivalCode: string; //  Yes 到达机场代码
  CabinCode: string; //  Yes 舱位代码
  OperatingFlightNo: string; //  No 代码共享航班号
  PlaneType: string; //  Yes 机型
  Status: string; //  Yes HK
}
