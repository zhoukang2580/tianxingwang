import { BaseVariablesEntity } from '../../models/BaseVariablesEntity';
import { AccountEntity } from './AccountEntity';

export class AccountTagEntity extends BaseVariablesEntity {
    /// <summary>
    /// 账户信息 
    /// </summary>
    Account: AccountEntity;
    /// <summary>
    /// 名称
    /// </summary>
    Name: string;
    /// <summary>
    /// 标签
    /// </summary>
    Tag: string;
    /// <summary>
    /// 卡号
    /// </summary>
    Number: string;
}