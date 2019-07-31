import { BaseVariablesEntity } from "./../../tmc/models/BaseVariablesEntity";
import { OrderEntity } from "./OrderEntity";
export class OrderItemEntity extends BaseVariablesEntity {
  /// <summary>
  /// 订单
  /// </summary>
  public Order: OrderEntity;
  /// <summary>
  /// 标签
  /// </summary>
  Tag: string;
  /// <summary>
  /// 编号
  /// </summary>
  Key: string;
  /// <summary>
  /// 编号
  /// </summary>
  Number: string;
  /// <summary>
  /// 名称
  /// </summary>
  Name: string;

  /// <summary>
  /// 金额
  /// </summary>
  Amount: string;
  /// <summary>
  /// 成本金额
  /// </summary>
  CostAmount: string;
  /// <summary>
  /// 发票金额
  /// </summary>
  InvoiceAmount: string;
  /// <summary>
  /// 成本发票
  /// </summary>
  InvoiceCostAmount: string;

  /// <summary>
  /// 数据
  /// </summary>
  DataEntity: OrderItemEntity;
  /// <summary>
  /// 备注
  /// </summary>
  Remark: string;

  /// <summary>
  /// 机票客户扣率
  /// </summary>
  TmcRate: string;
  /// 机票结算扣率
  /// </summary>
  SettleRate: string;
  /// <summary>
  ///
  /// </summary>
  IsCreateUatp: boolean;
}
