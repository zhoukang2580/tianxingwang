import { FlightSegmentModel } from "./FlightSegmentModel";
import { FlightPolicyModel } from "./FlightPolicyModel";
import { CabinTypeEnum } from "./CabinTypeEnum";
import { FareTypeEnum } from "./FareTypeEnum";
import { RefundChangeModel } from "./RefundChangeModel";

export class FlightBookCabinModel {
  FlightNumber: string; //   航班号
  Name: string; //   未启用
  SupplierType: number; //  Yes 供应商类型
  FareType: FareTypeEnum; //  Yes 运价类型
  Type: CabinTypeEnum; //  Yes 舱位类型
  PolicyId: string; //   未启用
  FlightPolicy: FlightPolicyModel; //   未启用
  LowerSegment: FlightSegmentModel; //   未启用
  IsAllowOrder: boolean; //   允许预订
  Code: string; //  Yes 舱位代码
  Count: number; //   座位数
  Discount: string; // ;//  Yes 折扣率（例如 0.85，表示 85 折）
  TicketPrice: string; // ;//  Yes 票面价
  SalesPrice: string; // ;//  Yes 销售价
  SettlePrice: string; // ;//  Yes 结算价
  Tax: string; // ;//  Yes 税收
  Reward: string; // ;//  Yes 奖励
  Rules: { [key: string]: string }; // Dictionary<:string;// ,:string;// > Yes 违反差旅规则
  Variables: string; // ;// Json Yes {"FareBasis": "HDM97","Ei": "不得签转","AccountCode": "9942022","CabinKey":"***"}
  RefundChange: RefundChangeModel; //  Yes 退改签信息
}
