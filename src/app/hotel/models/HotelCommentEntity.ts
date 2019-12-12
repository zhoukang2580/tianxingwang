import { OrderEntity } from "src/app/order/models/OrderEntity";
import { HotelCommentType } from "./HotelCommentType";
import { HotelCommentStatusType } from "./HotelCommentStatusType";
import { HotelEntity } from "./HotelEntity";
import { BaseVariablesEntity } from 'src/app/models/BaseVariablesEntity';
import { AccountEntity } from 'src/app/account/models/AccountEntity';

export class HotelCommentEntity extends BaseVariablesEntity {
  /// <summary>
  /// 酒店
  /// </summary>
  public Hotel: HotelEntity;

  /// <summary>
  ///账户
  /// </summary>
  public Account: AccountEntity;
  /// <summary>
  /// 订单明细
  /// </summary>
  public Order: OrderEntity;
  /// <summary>
  /// 名称
  /// </summary>
  Name: string;
  /// <summary>
  /// 内容
  /// </summary>
  Detail: string;
  /// <summary>
  /// 评分级别
  /// </summary>
  public Type: HotelCommentType;
  /// <summary>
  /// 是否显示
  /// </summary>
  public Status: HotelCommentStatusType;
}
