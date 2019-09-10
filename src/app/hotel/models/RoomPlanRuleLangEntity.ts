import { BaseEntity } from "src/app/tmc/models/BaseEntity";
import { RoomPlanRuleEntity } from "./RoomPlanRuleEntity";
export class RoomPlanRuleLangEntity extends BaseEntity {
  /// <summary>
  /// 房型
  /// </summary>
  RoomPlanRule: RoomPlanRuleEntity;

  /// <summary>
  /// 显示价格
  /// </summary>
  Name: string;
  /// <summary>
  /// 描述
  /// </summary>
  Description: string;

  Lang: string;
}
