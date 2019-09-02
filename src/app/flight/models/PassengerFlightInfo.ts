import { FlightCabinEntity } from './flight/FlightCabinEntity';
import { FlightSegmentEntity } from './flight/FlightSegmentEntity';
import { TripType } from 'src/app/tmc/models/TripType';

export interface CurrentViewtFlightSegment {
  flightSegment: FlightSegmentEntity;
  flightSegments: FlightSegmentEntity[];
  totalPolicyFlights: PassengerPolicyFlights[];
}

export interface IFlightSegmentInfo {
  flightSegment: FlightSegmentEntity;
  flightPolicy: FlightPolicy;
  tripType?: TripType;
  id?: string;
  isLowerSegmentSelected?: boolean;
}

export interface PassengerPolicyFlights {
  PassengerKey: string; // accountId
  FlightPolicies: FlightPolicy[];
}

export interface FlightSegmentModel {
  AirlineName; // String 航空公司名称
  Number; // String 航班号
  TakeoffTime; // Datetime 起飞时间
  FlyTime; // Int 飞行时间（分钟）
  LowestFare; // Decimal 最低价
  LowestCabinCode; // String 最低价舱位
  LowestDiscount; // Decimal 最低价折扣
  IsStop: boolean; // Bool 是否经停
}
export interface FlightPolicy {
  Cabin: FlightCabinEntity; // 记录原始的cabin
  FlightNo: string; // String Yes 航班号
  CabinCode: string; // string Yes 舱位代码
  IsAllowBook: boolean; // Bool Yes 是否可预订
  Discount: string; // Decimal Yes 折扣率
  LowerSegment: FlightSegmentModel;
  Rules: string[]; // List<string> No 违反的差标信息
}
