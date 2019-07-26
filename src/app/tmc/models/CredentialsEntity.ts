import { StaffEntity } from "src/app/hr/staff.service";
import { AccountEntity } from "./AccountEntity";
import { CredentialsType } from "src/app/member/pipe/credential.pipe";

export class CredentialsEntity {
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

  /// <summary>
  /// 姓
  /// </summary>
  FirstName: string;

  /// <summary>
  /// 名
  /// </summary>
  LastName: string;

  /// <summary>
  /// 登机姓名
  /// </summary>
  Name: string;

  /// <summary>
  /// 登机姓
  /// </summary>
  CheckFirstName: string;

  /// <summary>
  /// 登机名
  /// </summary>
  CheckLastName: string;

  CheckName: string;
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
