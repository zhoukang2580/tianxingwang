import { FlightPatFareSegmentModel } from "./FlightPatFareSegmentModel";
export class FareModel {
  AccountCode: string; //  Yes 三方协议代码
  PassengerType: number; // Yes 乘客类型
  Segments: FlightPatFareSegmentModel[]; // List< FlightPatFareSegment > Yes 验价的航段
  MatchTicketPrice: string; //  Yes 用于匹配票面
  MatchTax: string; //  Yes 用于匹配税收
  FareBasis: string; //  返回值 运价基础
  RealTicketPrice: string; //  返回值 实际票面价格
  RealTax: string; //  返回值 实际税收
  Reward: string; //  返回值 航段奖励
}
