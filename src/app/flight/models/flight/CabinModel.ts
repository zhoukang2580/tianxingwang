import { CabinTypeEnum } from './CabinTypeEnum';
import { FlightSegmentModel } from "./FlightSegmentModel";
import { FlightPolicyModel } from "./FlightPolicyModel";
import { FareTypeEnum } from "./FareTypeEnum";
import { RefundChangeModel } from "./RefundChangeModel";
export class CabinModel {
  FlightNumber: string; //  航班号
  Name: string; //  未启用
  SupplierType: number; //  供应商类型
  SupplierTypeName: string; //  供应商类型名称
  FareType: FareTypeEnum; //  运价类型
  FareTypeName: string; //  运价类型名称
  Type: CabinTypeEnum; //  舱位类型
  TypeName: string; //  舱位类型名称
  PolicyId: string; //  未启用
  FlightPolicy: FlightPolicyModel; //  未启用
  LowerSegment: FlightSegmentModel; //  未启用
  IsAllowOrder: boolean; //  允许预订
  Code: string; //  舱位代码
  Count: number; //  座位数
  Discount: string; //  折扣率（例如 0.85，表示 85 折）
  TicketPrice: string; //  票面价
  SalesPrice: string; //  销售价
  SettlePrice: string; //  结算价
  Tax: string; //  税收
  Reward: string; //  奖励
  Rules: { [key: string]: string }; // Dictionary<:string;// ,:string;// > 违反差旅规则
  Variables: string; //  {"FareBasis": "HDM97","Ei": "不得签转","AccountCode": "9942022"}
  RefundChange: RefundChangeModel; //  退改签信息
}
