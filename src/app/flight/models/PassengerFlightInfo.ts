import { FlightCabinEntity } from "./flight/FlightCabinEntity";
import { FlightSegmentEntity } from "./flight/FlightSegmentEntity";
import { TripType } from "src/app/tmc/models/TripType";
import { PassengerBookInfo } from "src/app/tmc/tmc.service";
import { OrderFlightTripEntity } from "src/app/order/models/OrderFlightTripEntity";

export interface IFlightSegmentInfo {
  flightSegment: FlightSegmentEntity;
  flightPolicy: FlightPolicy;
  isDontAllowBook?: boolean;
  tripType?: TripType;
  id?: string;
  lowerSegmentInfo?: {
    lowestCabin: FlightPolicy;
    lowestFlightSegment: FlightSegmentEntity;
    tripType: TripType;
  };
  originalBookInfo?: PassengerBookInfo<IFlightSegmentInfo>;
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
  LowestCabinId; // String 最低价舱位
  LowestDiscount; // Decimal 最低价折扣
  IsStop: boolean; // Bool 是否经停
  Cabins: FlightCabinEntity[];
}
export interface FlightPolicy {
  OrderTravelPays?: string;
  OrderTravelPayNames?: string;
  Cabin: FlightCabinEntity; // 记录原始的cabin
  FlightNo: string; // String Yes 航班号
  Id: string; // String Yes 航班号
  CabinCode: string; // string Yes 舱位代码
  IsAllowBook: boolean; // Bool Yes 是否可预订
  Discount: string; // Decimal Yes 折扣率
  LowerSegment: FlightSegmentModel;
  Rules: string[]; // List<string> No 违反的差标信息
  color: "secondary" | "success" | "danger" | "warning";
}
