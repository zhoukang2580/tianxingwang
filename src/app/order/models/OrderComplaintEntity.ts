import { OrderEntity } from './OrderEntity';
import { BaseVariablesEntity } from 'src/app/models/BaseVariablesEntity';

export class OrderComplaintEntity extends BaseVariablesEntity {
  /// <summary>
  /// 总订单标识Id
  /// </summary>
  public Order: OrderEntity;
  /// 关键字
  /// </summary>
  Key: string;
  /// <summary>
  /// 问题
  /// </summary>
  Question: string;
  /// <summary>
  /// 答案
  /// </summary>
  Answer: string;
  /// <summary>
  /// 回答时间
  /// </summary>
  AnswerTime: string;

  /// <summary>
  /// 是否回复
  /// </summary>
  IsReply: boolean;
  /// <summary>
  /// 评价类型
  /// </summary>
  Type: OrderComplaintType;

  /// <summary>
  /// 回复名称
  /// </summary>
  IsReplyName: string;
  /// <summary>
  /// 评价类型
  /// </summary>
  TypeName: string;
}
export enum OrderComplaintType{
    /// <summary>
        /// 未回复
        /// </summary>
        None=1,
        /// <summary>
        /// 好评
        /// </summary>
        Good = 2,
        /// <summary>
        /// 一般
        /// </summary>
        General = 3,
        /// <summary>
        /// 差评
        /// </summary>
        Bad = 4
}