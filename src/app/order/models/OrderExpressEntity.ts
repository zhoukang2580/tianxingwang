import { BaseVariablesEntity } from "src/app/tmc/models/BaseVariablesEntity";
import { OrderEntity } from "./OrderEntity";

export class OrderExpressEntity extends BaseVariablesEntity {
  /// <summary>
  /// 总订单标识Id
  /// </summary>
  Order: OrderEntity;
  /// <summary>
  /// 交货日期
  /// </summary>
  DeliveryDate: string;
  /// <summary>
  /// 关键字
  /// </summary>
  Key: string;
  /// <summary>
  /// 快递名称
  /// </summary>
  Name: string;
  /// <summary>
  /// 金额
  /// </summary>
  Amount: string;
  /// <summary>
  /// 成本
  /// </summary>
  Cost: string;
  /// <summary>
  /// 快递编号
  /// </summary>
  Number: string;
  /// <summary>
  /// 备注
  /// </summary>
  Remark: string;

  /// <summary>
  /// 接收人
  /// </summary>
  Recipient: string;
  /// <summary>
  /// 手机号码
  /// </summary>
  Mobile: string;
  /// <summary>
  /// 邮政编码
  /// </summary>
  Postcode: string;
  /// <summary>
  /// 接收地址
  /// </summary>
  Address: string;

  /// <summary>
  /// 邮箱
  /// </summary>
  Email: string;

  /// <summary>
  /// 数据
  /// </summary>
  DataEntity: OrderExpressEntity;
}
