import { AccountEntity } from "src/app/tmc/models/AccountEntity";
import { OrderEntity } from "./OrderEntity";
import { OrderTagEntity } from "./OrderTagEntity";

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
