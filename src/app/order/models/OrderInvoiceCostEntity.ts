import { BaseVariablesEntity } from "src/app/tmc/models/BaseVariablesEntity";
import { OrderEntity } from "./OrderEntity";

export class OrderInvoiceCostEntity extends BaseVariablesEntity {
  /// <summary>
  /// 订单
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
  /// 收款金额
  /// </summary>
  Amount: string;

  /// <summary>
  /// 备注
  /// </summary>
  Remark: string;

  /// <summary>
  /// 收款记录
  /// </summary>
  Number: string;

  /// <summary>
  /// 数据
  /// </summary>
  DataEntity: OrderInvoiceCostEntity;
}
