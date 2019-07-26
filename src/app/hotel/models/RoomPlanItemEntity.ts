import { RoomPlanEntity } from "./RoomPlanEntity";
import { RoomPlanItemLangEntity } from './RoomPlanItemLangEntity';

export class RoomPlanItemEntity {
  Variables: string;
  /// <summary>
  /// 房型
  /// </summary>
  RoomPlan: RoomPlanEntity;

  /// <summary>
  /// 显示价格
  /// </summary>
  Name: string;
  /// <summary>
  /// 标签
  /// </summary>
  Tag: string;
  /// <summary>
  /// 价格
  /// </summary>
  Price: string;
  /// <summary>
  /// 价格
  /// </summary>
  Cost: string;
  /// <summary>
  /// 是否启用
  /// </summary>
  IsUsed: boolean;

  /// <summary>
  /// 是否启用
  /// </summary>
  IsUsedName: string;

  DataEntity: RoomPlanItemEntity;

  Langs: RoomPlanItemLangEntity[];
}
