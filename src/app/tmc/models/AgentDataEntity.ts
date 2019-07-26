import { AgentEntity } from "./AgentEntity";

export class AgentDataEntity {
  /// <summary>
  /// 账户
  /// </summary>
  Agent: AgentEntity;
  /// <summary>
  /// 中文名称
  /// </summary>
  Name: string;
  /// <summary>
  /// 简称
  /// </summary>
  Nickname: string;
  /// <summary>
  /// 联系人
  /// </summary>
  Linkman: string;
  /// <summary>
  /// 联系号码
  /// </summary>
  Telephone: string;
  /// <summary>
  /// 邮编
  /// </summary>
  Postcode: string;
  /// <summary>
  /// 地址
  /// </summary>
  Address: string;
  /// <summary>
  /// 备注
  /// </summary>
  Remark: string;
  /// <summary>
  /// 酒店订房联系人电话
  /// </summary>
  HotelBookMobile: string;
  /// <summary>
  /// 酒店订房联系人电话
  /// </summary>
  HotelBookEmail: string;

  /// <summary>
  /// 酒店订房联系人电话
  /// </summary>
  FlightExceptionMobile: string;
  /// <summary>
  /// 酒店订房联系人电话
  /// </summary>
  FlightExceptionEmail: string;
  /// <summary>
  /// 酒店订房联系人电话
  /// </summary>
  InsuranceBookMobile: string;
  /// <summary>
  /// 酒店订房联系人电话
  /// </summary>
  InsuranceBookEmail: string;

  PayFailureMessageWechatTemplateId: string;
}
