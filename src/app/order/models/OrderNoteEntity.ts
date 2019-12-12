import { OrderEntity } from "./OrderEntity";
import { BaseVariablesEntity } from 'src/app/models/BaseVariablesEntity';
import { AccountEntity } from 'src/app/account/models/AccountEntity';
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
