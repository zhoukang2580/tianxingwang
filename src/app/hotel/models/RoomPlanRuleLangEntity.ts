import { RoomPlanRuleEntity } from "./RoomPlanRuleEntity";
import { BaseEntity } from 'src/app/models/BaseEntity';
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
