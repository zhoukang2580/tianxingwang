import { BaseVariablesEntity } from "./../../tmc/models/BaseVariablesEntity";
import { OrderEntity } from "./OrderEntity";
import { AccountEntity } from "src/app/tmc/models/AccountEntity";
export class OrderNoteEntity extends BaseVariablesEntity {
  /// <summary>
  /// 订单
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
  /// 内容
  /// </summary>
  Content: string;
  /// <summary>
  /// 用户
  /// </summary>
  Account: AccountEntity;
}
