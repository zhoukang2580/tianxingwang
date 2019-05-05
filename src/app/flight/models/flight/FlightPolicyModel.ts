import { FlightSegmentModel } from "./FlightSegmentModel";

export class FlightPolicyModel {
  FlightNo: string; //  Yes 航班号
  CabinCode: string; //  Yes 舱位代码
  IsAllowBook: boolean; // Yes 是否可预订
  LowerSegment: FlightSegmentModel; // No 低价航班
  Rules: string[]; // List<:string;// > No 违反的差标信息
}
