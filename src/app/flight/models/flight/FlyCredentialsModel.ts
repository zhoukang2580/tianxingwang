import { CredentialsTypeEnum } from "./../CredentialsTypeEnum";
import { AccountModel } from "./AccountModel";
export class FlyCredentialsModel {
  Account: AccountModel; // Yes 账户
  Type: CredentialsTypeEnum; // Yes 证件类型
  Number: string; //  Yes 证件号码
  FirstName: string; //  Yes 姓
  LastName: string; //  Yes 名
  CheckFirstName: string; //  Yes 登机姓
  CheckLastName: string; //  Yes 登机名
  Gender: string; //  Yes 性别（男 M 女 F）
  ExpirationDate: string; //  No 证件有效期
  Country: string; //  No 国籍（中国 CN）
  IssueCountry: string; //  No 发证国家代码
  Birthday: string; //  No 出生日期
}
