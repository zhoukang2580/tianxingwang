import { CredentialsTypeEnum } from "./CredentialsTypeEnum";
export class CredentialsModel {
  Id: number; //  Id
  AccountId: number; //  帐号 id
  Type: CredentialsTypeEnum; // 证件类型
  Number: string; //  证件号码
  FirstName: string; //  姓
  LastName: string; //  名
  CheckName: string; //  登机名字
  CheckFirstName: string; //  登机姓
  CheckLastName: string; //  登机名
  ExpirationDate: string; //  证件有效期
  Country: string; //  国籍（中国 CN）
  IssueCountry: string; //  发证国家代码
  Birthday: string; //  出生日期
  Gender: string; //  性别(M: 男 F: 女)
}
