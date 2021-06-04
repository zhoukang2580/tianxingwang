
import { AccountEntity } from "./AccountEntity";
import { CredentialsType } from "./CredentialsType";
import { PassengerType } from "./PassengerType";


export class PassengerEntity {
    Id:string;
    /// <summary>
    /// 账户
    /// </summary>
    AccountEntity: AccountEntity;
    /// <summary>
    /// 类型
    /// </summary>
    CredentialsType: CredentialsType;
    /// <summary>
    /// 乘客类型
    /// </summary>
    PassengerType: PassengerType;

    Mobile: string;

    Email: string;
    /// <summary>
    /// 证件号
    /// </summary>
    Number: string;

    /// <summary>
    /// 姓
    /// </summary>
    Surname: string;

    /// <summary>
    /// 名
    /// </summary>
    Givenname: string;


    /// <summary>
    /// 登机姓名
    /// </summary>
    Name : string;

    /// <summary>
    /// 到期时间
    /// </summary>
    ExpirationDate: string;

    /// <summary>
    /// 国家
    /// </summary>
    Country: string;

    /// <summary>
    /// 发证国家
    /// </summary>
    IssueCountry: string;

    /// <summary>
    /// 出生日期
    /// </summary>
    Birthday: string;

    /// <summary>
    /// 性别
    /// </summary>
    Gender: string;

    /// <summary>
    /// 类型
    /// </summary>
    CredentialsTypeName: string;

    /// <summary>
    /// 乘客类型
    /// </summary>
    PassengerTypeName: string;

    Variables:any;
}