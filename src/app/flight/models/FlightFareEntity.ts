import { FlightBookType } from "./flight/FlightBookType";
import { FlightSupplierType } from "./flight/FlightSupplierType";
import { FlightFareType } from "./flight/FlightFareType";
import { FlightCabinType } from "./flight/FlightCabinType";
import { FlightPolicyEntity } from "./flight/FlightPolicyEntity";
import { FlightSegmentEntity } from "./flight/FlightSegmentEntity";
import { InsuranceProductEntity } from "src/app/insurance/models/InsuranceProductEntity";
import { FlightFareRuleEntity } from "./FlightFareRuleEntity";

export class FlightFareEntity {
  /// <summary>
  ///
  /// </summary>
  Id: string;
  Explain: string;
  refundChangeDetail?: FlightFareEntity[];
  /// <summary>
  ///
  /// </summary>
  FlightRouteIds: string[];
  FlightFareRules: FlightFareRuleEntity[];
  /// <summary>
  ///
  /// </summary>
  BookType: FlightBookType;
  BookCode: string;
  /// <summary>
  /// 航班号
  /// </summary>
  FlightNumber: string;
  /// <summary>
  /// z
  /// </summary>
  PolicyId: string;
  policy: {
    IsAllowOrder: boolean;
    IsIllegal: boolean;
    Message: string;
    FlightFare?: FlightFareEntity;
  };
  /// <summary>
  /// 来源
  /// </summary>
  SupplierType: FlightSupplierType;
  /// <summary>
  /// 价格类型
  /// </summary>
  /// <seealso cref="FlightFareType"/>
  FareType: FlightFareType;
  /// <summary>
  /// 名称
  /// </summary>
  Name: string;
  /// <summary>
  /// 舱位类型
  /// </summary>
  /// <see cref="FlightCabinType"/>
  Type: FlightCabinType;
  /// <summary>
  /// 舱位代码
  /// </summary>
  Code: string;

  /// <summary>
  /// 票面价格
  /// </summary>
  TicketPrice: string;
  /// <summary>
  /// 结算价格
  /// </summary>
  SettlePrice: string;
  /// <summary>
  /// 售价
  /// </summary>
  SalesPrice: string;

  /// <summary>
  /// 税收
  /// </summary>
  Tax: string;
  /// <summary>
  /// 税收
  /// </summary>
  SettleTax: string;
  /// <summary>
  /// 航段返利
  /// </summary>
  Reward: string;
  /// <summary>
  /// 折扣
  /// </summary>
  Discount: string;
  /// <summary>
  /// 数量
  /// </summary>
  Count: string; //
  /// <summary>
  /// 变量体
  /// </summary>
  Variables: { [key: string]: string };
  /// <summary>
  /// 退改签规则
  /// </summary>
  RefundChange: FlightFareRuleEntity;
  /// <summary>
  /// 政策
  /// </summary>
  FlightPolicy: FlightPolicyEntity;
  /// <summary>
  /// 低价航班
  /// </summary>
  LowerSegment: FlightSegmentEntity;

  InsuranceProducts: InsuranceProductEntity[];

  /// <summary>
  ///  名称
  /// </summary>
  TypeName: string;
  /// <summary>
  /// 运价类型名称
  /// </summary>
  FareTypeName: string;
  /// <summary>
  /// 来源名称
  /// </summary>
  SupplierTypeName: string;

  /// <summary>
  /// 是否允许预订
  /// </summary>
  IsAllowOrder: boolean;
  /// <summary>
  /// 违规
  /// </summary>
  Rules: { [key: string]: string };
  ruleMessage?: string;
  CabinCodes: any;
  // ruleExplain: string;
}
