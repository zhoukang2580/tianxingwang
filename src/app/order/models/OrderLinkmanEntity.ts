import { BaseVariablesEntity } from "./../../tmc/models/BaseVariablesEntity";
import { OrderEntity } from "./OrderEntity";
export class OrderLinkmanEntity extends BaseVariablesEntity {
  /// <summary>
  /// 总订单标识Id
  /// </summary>
  Order: OrderEntity;
  /// <summary>
  /// 编号
  /// </summary>
  Key: string;

  /// <summary>
  /// 联系人姓名
  /// </summary>
  Name: string;

  /// <summary>
  /// 手机号码
  /// </summary>
  Mobile: string;

  /// <summary>
  /// 邮件
  /// </summary>
  Email: string;

  DataEntity: OrderLinkmanEntity;
}
