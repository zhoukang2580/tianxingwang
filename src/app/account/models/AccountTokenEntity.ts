import { BaseEntity } from '../../models/BaseEntity';
import { AccountEntity } from './AccountEntity';

export class AccountTokenEntity extends BaseEntity {
    /// <summary>
    /// 账户信息 
    /// </summary>
    Account: AccountEntity;
    /// <summary>
    /// 编号
    /// </summary>
    Number: string;
    /// <summary>
    /// 设备
    /// </summary>
    Device: string;

    /// <summary>
    /// 过期时间
    /// </summary>
    ExpiredTime: string;
}