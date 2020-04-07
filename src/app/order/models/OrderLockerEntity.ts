import { OrderEntity } from "./OrderEntity";
import { OrderTagEntity } from "./OrderTagEntity";
import { AccountEntity } from 'src/app/account/models/AccountEntity';

export class OrderLockerEntity {
  /// <summary>
  /// 订单
  /// </summary>
  Order: OrderEntity;

  Account: AccountEntity;
  /// <summary>
  ///
  /// </summary>
  Tag: string;
  /// <summary>
  /// 编号
  /// </summary>
  Key: string;
  /// <summary>
  ///
  /// </summary>
  Name: string;
  /// <summary>
  /// 过期时间
  /// </summary>
  ExpiredTime: string;

  DataEntity: OrderTagEntity;
}
