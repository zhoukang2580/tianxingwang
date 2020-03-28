import { AccountEntity } from './AccountEntity';
import { BaseEntity } from '../../models/BaseEntity';

export class AccountNumberEntity extends BaseEntity {
    Name: string;
    Number: string;
    Variables: string;
    Tag: string;
    VariablesDictionary: any;
    IsIdentity: boolean;
    Account: AccountEntity;
    NumberEntity: BaseEntity;
}