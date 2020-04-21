import { OrderEntity } from "./OrderEntity";
import { BaseVariablesEntity } from 'src/app/models/BaseVariablesEntity';

export class OrderNumberEntity extends BaseVariablesEntity {
  /// <summary>
  /// 总订单标识Id
  /// </summary>
  Order: OrderEntity;
  /// <summary>
  /// 编号
  /// </summary>
  Key: string;
  /// <summary>
  /// 标签
  /// </summary>
  Tag: string;
  /// <summary>
  /// 快递名称
  /// </summary>
  Name: string;
  /// <summary>
  /// 快递编号
  /// </summary>
  Number: string;
  /// <summary>
  /// 备注
  /// </summary>
  Remark: string;
  /// <summary>
  /// 数据实体
  /// </summary>
  DataEntity: OrderNumberEntity;
}
