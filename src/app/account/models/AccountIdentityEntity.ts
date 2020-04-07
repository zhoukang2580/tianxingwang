import { BaseEntity } from '../../models/BaseEntity';
import { AccountEntity } from './AccountEntity';

export class AccountIdentityEntity extends BaseEntity {
    /// <summary>
    /// 名称
    /// </summary>
    Name: string;
    /// <summary>
    /// OpenId
    /// </summary>
    Number: string;
    /// <summary>G
    /// 对应账户
    /// </summary>
    Account: AccountEntity;
}