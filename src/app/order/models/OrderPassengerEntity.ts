import { BaseVariablesEntity } from "./../../tmc/models/BaseVariablesEntity";
import { CredentialsType } from "src/app/member/pipe/credential.pipe";
import { PassengerType } from "src/app/tmc/models/PassengerDto";
import { OrderEntity } from './OrderEntity';

export class OrderPassengerEntity extends BaseVariablesEntity {
  /// <summary>
  /// 所属申请单
  /// </summary>
  Order: OrderEntity;
  /// <summary>
  /// 编号
  /// </summary>
  Key: string;

  /// <summary>
  /// 登机名
  /// </summary>
  Name: string;

  /// <summary>
  /// 登机名
  /// </summary>
  CheckName: string;
  /// <summary>
  /// 乘客类型
  /// </summary>
  PassengerType: PassengerType;
  /// <summary>
  /// 证件类型
  /// </summary>
  CredentialsType: CredentialsType;
  /// <summary>
  /// 证件号码
  /// </summary>
  CredentialsNumber: string;
  /// <summary>
  /// 性别
  /// </summary>
  Gender: string;
  /// <summary>
  /// 手机号码
  /// </summary>
  Mobile: string;
  /// <summary>
  /// 邮箱
  /// </summary>
  Email: string;
  /// <summary>
  /// 备注
  /// </summary>
  Remark: string;

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
  /// 乘客类型
  /// </summary>
  PassengerTypeName: string;
  /// <summary>
  /// 到期时间
  /// </summary>
  ExpirationDateName: string; // => ExpirationDate == .Now.GetDefault() ? "" : ExpirationDate.ToString("yyyy-MM-dd");
  BirthdayName: string;
  /// <summary>
  /// 证件类型
  /// </summary>
  CredentialsTypeName: string;
}
