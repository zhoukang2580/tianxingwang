import { BaseEntity } from 'src/app/models/BaseEntity';
import { BaseVariablesEntity } from '../../models/BaseVariablesEntity';
import { AccountEntity } from './AccountEntity';
export class AccountSetupEntity extends BaseVariablesEntity {
    /// <summary>
    /// 账户
    /// </summary>
    Account: AccountEntity;
    /// <summary>
    /// 标签
    /// </summary>
    Name: string;
    /// <summary>
    /// 标签
    /// </summary>
    Tag: string;
    /// <summary>
    /// 关键字
    /// </summary>
    Key: string;
    /// <summary>
    /// 是否启用
    /// </summary>
    IsUsed: boolean;
}