import { FlightChangeDetailEntity } from "./flight/FlightChangeDetailEntity";
import { FlightEndorsementDetailEntity } from "./flight/FlightEndorsementDetailEntity";
import { FlightFareRuleDetailEntity } from "./FlightFareRuleDetailEntity";

export class FlightFareRuleEntity {
  Airline: string;
  Cabin: string;
  /// <summary>
  /// 退票信息
  /// </summary>
  public RefundDetail: FlightFareRuleDetailEntity;
  /// <summary>
  /// 改期信息
  /// </summary>
  public ChangeDetail: FlightChangeDetailEntity;
  /// <summary>
  /// 签转条件
  /// </summary>
  public EndorsementDetail: FlightEndorsementDetailEntity;
  /// <summary>
  /// 备注
  /// </summary>
  Remark: string;
  /// <summary>
  /// 行李额
  /// </summary>
  BaggageAllowance: string;
  Bags: {
    AllowedPieces: number; // 2;
    AllowedWeight: number; // 0;
    AllowedWeightUnit: string; // "";
    FlightNumber: string; // "MU8273";
    FreeAllowedPieces: number; // 1;
    FreeAllowedWeight: number; // 0;
    FreeAllowedWeightUnit: string; // "";
  }[];
}
