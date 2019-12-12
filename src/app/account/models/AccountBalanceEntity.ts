import { AccountBalanceType } from "./AccountBalanceType";
import { AccountEntity } from './AccountEntity';

export class AccountBalanceEntity {
  /// <summary>
  /// 账户
  /// </summary>
  Account: AccountEntity;
  /// <summary>
  /// 名称
  /// </summary>
  Type: AccountBalanceType;
  /// <summary>
  /// 是否启用
  /// </summary>
  Balance: string;

  TypeName: string;
} 
