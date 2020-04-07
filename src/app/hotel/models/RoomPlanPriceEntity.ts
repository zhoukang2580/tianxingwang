import { RoomPlanEntity } from "./RoomPlanEntity";

export class RoomPlanPriceEntity {
  Variables: string;
  /// <summary>
  /// 房型
  /// </summary>
  RoomPlan: RoomPlanEntity;
  /// <summary>
  /// 描述
  /// </summary>
  Date: string;
  /// <summary>
  ///
  /// </summary>
  Count: string;
  /// <summary>
  /// 价格
  /// </summary>
  Price: string;
  /// <summary>
  /// 成本
  /// </summary>
  Cost: string;
  /// <summary>
  /// 价格计划
  /// </summary>
  IsUsed: boolean;

  /// <summary>
  /// 早餐
  /// </summary>
  Breakfast: string;

  DataEntity: RoomPlanPriceEntity;
}
