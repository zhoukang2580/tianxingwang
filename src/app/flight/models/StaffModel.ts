import { BookTypeEnum } from "./BookTypeEnum";
export class StaffModel {
  Id: number; //  Id
  TmcId: number; //  客户 id
  AccountId: number; //  帐号 id
  OrganizationId: number; //  所属部门 Id
  OrganizationCode: string; //  所属部门
  OrganizationName: string; //  所属部门
  Number: string; //  工号
  Name: string; //  姓名
  Nickname: string; //  昵称
  Email: string; //  邮箱
  Mobile: string; //  手机号码
  ExtensionNumber: string; //  分机号
  CcQueue: string; //  队列
  Penalty: number; //  优先级
  OutNumber: string; //  外部编号
  IsVip: boolean; //  是否 Vip
  IsConfirmInfo: boolean; //  是否确认信息
  IsModifyPassword: boolean; //  是否修改密码
  CostCenterId: number; //  成本中心 Id
  CostCenterCode: string; //  成本中心代码
  CostCenterName: string; //  成本中心名称
  CredentialsInfo: string; //  证件信息
  IsUsed: boolean; //  是否启用
  BookType: BookTypeEnum; // 预订类型
  BookCodes: string; //  预订代码
}
