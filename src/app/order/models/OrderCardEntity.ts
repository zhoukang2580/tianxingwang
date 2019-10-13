import { BaseVariablesEntity } from "src/app/tmc/models/BaseVariablesEntity";
import { OrderEntity } from "./OrderEntity";

export class OrderCardEntity extends BaseVariablesEntity {
  /// <summary>
  /// 订单信息
  /// </summary>
  Order: OrderEntity;
  /// <summary>
  /// 关键字
  /// </summary>
  Key: string;
  /// <summary>
  /// 名称
  /// </summary>
  Name: string;
  /// <summary>
  /// 标签
  /// </summary>
  Tag: string;
  /// <summary>
  /// 卡号
  /// </summary>
  Number: string;
  /// <summary>
  /// 描述
  /// </summary>
  Description: string;
  DataEntity: OrderCardEntity;
  SetVariable(key: string, value: any) {
    this.Variables = this.Variables || ({} as any);
    this.Variables[key] = value || "";
  }
}
