import { OrderEntity } from "./OrderEntity";
import { OrderPayStatusType } from "./OrderInsuranceEntity";
import { BaseVariablesEntity } from 'src/app/models/BaseVariablesEntity';

export class OrderPayCostEntity extends BaseVariablesEntity {
  /// <summary>
  /// 订单
  /// </summary>
  public Order: OrderEntity;

  /// <summary>
  /// 编号
  /// </summary>
  Key: string;
  /// <summary>
  /// 标签
  /// </summary>
  Tag: string;
  /// <summary>
  /// 渠道
  /// </summary>
  Channel: string;
  /// <summary>
  /// 类型
  /// </summary>
  Type: string;
  /// <summary>
  /// 类型
  /// </summary>
  Name: string;
  /// <summary>
  ///
  /// </summary>
  Number: string;
  /// <summary>
  /// 收款金额
  /// </summary>
  Amount: string;
  /// <summary>
  /// 手续费
  /// </summary>
  Fee: string;
  /// <summary>
  /// 支付时间
  /// </summary>
  PayTime: string;

  /// <summary>
  /// 备注
  /// </summary>
  Remark: string;
  /// <summary>
  /// 支付状态
  /// </summary>
  Status: OrderPayStatusType;
  /// <summary>
  /// 支付状态
  /// </summary>
  StatusName: string;

  /// <summary>
  /// 数据
  /// </summary>
  DataEntity: OrderPayCostEntity;
}
