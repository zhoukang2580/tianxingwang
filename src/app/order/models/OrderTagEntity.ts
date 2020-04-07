import { OrderEntity } from "./OrderEntity";
import { AccountEntity } from 'src/app/account/models/AccountEntity';

export class OrderTagEntity {
  /// <summary>
  /// 订单
  /// </summary>
  Order: OrderEntity;

  Account: AccountEntity;
  /// <summary>
  /// 编号
  /// </summary>
  Key: string;
  /// <summary>
  /// 名称
  /// </summary>
  Tag: string;
  /// <summary>
  /// 标签
  /// </summary>
  Name: string;

  DataEntity: OrderTagEntity;
}
