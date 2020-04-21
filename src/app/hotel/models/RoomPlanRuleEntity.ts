import { RoomPlanEntity } from "./RoomPlanEntity";
import { RoomPlanRuleType } from "./RoomPlanRuleType";
import { RoomPlanRuleLangEntity } from "./RoomPlanRuleLangEntity";
import { BaseVariablesEntity } from 'src/app/models/BaseVariablesEntity';
export class RoomPlanRuleEntity extends BaseVariablesEntity {
  /// <summary>
  /// 房型
  /// </summary>
  RoomPlan: RoomPlanEntity;
  /// <summary>
  /// 类型
  /// </summary>
  Type: RoomPlanRuleType;
  /// <summary>
  /// 显示价格
  /// </summary>
  Name: string;
  /// <summary>
  /// 描述
  /// </summary>
  Description: string;

  /// <summary>
  /// 是否启用
  /// </summary>
  IsUsed: boolean;

  TypeName: string;
  /// <summary>
  /// 提前预订
  /// </summary>
  BookingAdvanceMinutes: string;
  /// <summary>
  /// 连续入住天数
  /// </summary>
  BookingContinuationDay: string;
  /// <summary>
  /// 起订数量
  /// </summary>
  BookingMinCount: string;
  /// <summary>
  /// 预订最多数量
  /// </summary>
  BookingMaxCount: string;
  /// <summary>
  /// 不能预订开始时间
  /// </summary>
  BookingRejectPeriodStartTime: string;
  /// <summary>
  /// 不能预订结束时间
  /// </summary>
  BookingRejectPeriodEndTime: string;

  /// <summary>
  /// 定额罚金金额
  /// </summary>
  PrepayPenaltyAmount: string;
  /// <summary>
  /// 定额罚金金额
  /// </summary>
  PrepayPenaltyPercent: string;
  /// <summary>
  /// 免费取消时间参考值
  /// </summary>
  PrepayBeforeCheckinTime: string;
  /// <summary>
  /// 免费取消时间提前小时数
  /// </summary>
  PrepayBeforeCheckinHours: string;

  /// <summary>
  /// 定额担保金额
  /// </summary>
  GuaranteeAmount: string;
  /// <summary>
  /// 定额担保金额
  /// </summary>
  GuaranteeRoomCount: string;
  /// <summary>
  /// 定额开始时间
  /// </summary>
  GuaranteeStartTime: string;
  /// <summary>
  /// 定额担保结束时间
  /// </summary>
  GuaranteeEndTime: string;

  /// <summary>
  /// 免费取消时间提前小时数
  /// </summary>
  CancelBeforeCheckinHours: string;

  /// <summary>
  /// 免费取消时间提前小时数
  /// </summary>
  CancelFreeBeforeTime: string;
  /// <summary>
  /// 免费取消时间提前小时数
  /// </summary>
  CancelNoAfterTime: string;
  /// <summary>
  /// 免费取消时间提前小时数
  /// </summary>
  CancelHoldBeforeTime: string;

  /// <summary>
  /// 是否启用
  /// </summary>
  IsUsedName: string;

  DataEntity: RoomPlanRuleEntity;

  Langs: RoomPlanRuleLangEntity[];
}
