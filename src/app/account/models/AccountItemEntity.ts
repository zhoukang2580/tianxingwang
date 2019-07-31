import { BaseEntity } from "src/app/tmc/models/BaseEntity";
import { AccountEntity } from "src/app/tmc/models/AccountEntity";
import { AccountBalanceType } from "./AccountBalanceType";
import { AccountItemStatusType } from "./AccountItemStatusType";
import { AccountBalanceEntity } from "./AccountBalanceEntity";

export class AccountItemEntity extends BaseEntity {
  /// <summary>
  /// 名称
  /// </summary>
  Name: string;
  /// <summary>
  /// 账户信息
  /// </summary>
  Account: AccountEntity;

  /// <summary>
  /// 标签
  /// </summary>
  Type: AccountBalanceType;
  /// <summary>
  /// 单价编号
  /// </summary>
  Number: string;
  /// <summary>
  /// 金额
  /// </summary>
  Amount: string;
  /// <summary>
  ///备注
  /// </summary>
  Remark: string;
  TypeName: string;
  /// <summary>
  /// 状态
  /// </summary>
  Status: AccountItemStatusType;
  /// <summary>
  /// 原始数据
  /// </summary>
  DataEntity: AccountItemEntity;

  /// <summary>
  /// 原始数据
  /// </summary>
  AccountBalance: AccountBalanceEntity;

  /// <summary>
  /// 类型名称
  /// </summary>
  StatusName: string;
}
