import { StaffEntity } from "src/app/hr/staff.service";
import { CredentialsType } from "src/app/member/pipe/credential.pipe";
import { AccountEntity } from 'src/app/account/models/AccountEntity';

export class CredentialsEntity {
  Id: string;
  /// <summary>
  /// 账户
  /// </summary>
  Account: AccountEntity;

  /// <summary>
  /// 类型
  /// </summary>
  Type: CredentialsType;

  /// <summary>
  /// 证件号
  /// </summary>
  Number: string;

  HideNumber: string;

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
  Name: string;

  /// <summary>
  /// 登机姓
  /// </summary>
  // CheckFirstName: string;

  /// <summary>
  /// 登机名
  /// </summary>
  // CheckLastName: string;

  // CheckName: string;
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

  Remark: string;

  /// <summary>
  /// 类型
  /// </summary>
  TypeName: string;

  /// <summary>
  /// 证件
  /// </summary>
  DataEntity: CredentialsEntity;

  /// <summary>
  /// 员工
  /// </summary>
  Staff: StaffEntity;
}
