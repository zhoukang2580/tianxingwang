import { IdentityService } from "src/app/services/identity/identity.service";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { ApiService } from "src/app/services/api/api.service";
import { Injectable } from "@angular/core";
import { StaffBookType } from "../tmc/models/StaffBookType";
export interface StaffEntity {
  StaffNumber: string;
  BookTypeName: string;
  Password: string;
  Id: string; // Long Id
  TmcId: string; // Long 客户 id
  AccountId: string; // Long 帐号 id
  OrganizationId: string; // Long 所属部门 Id
  OrganizationCode: string; // String 所属部门
  OrganizationName: string; // String 所属部门
  Number: string; // String 工号
  Name: string; // String 姓名
  Nickname: string; // String 昵称
  Email: string; // String 邮箱
  Mobile: string; // String 手机号码
  ExtensionNumber: string; // String 分机号
  CcQueue: string; // Datetime 队列
  Penalty: string; // Int 优先级
  OutNumber: string; // String 外部编号
  IsVip: boolean; // 是否 Vip
  IsConfirmInfo: boolean; // 是否确认信息
  IsModifyPassword: boolean; // 是否修改密码
  CostCenterId: string; // Long 成本中心 Id
  CostCenterCode: string; // String 成本中心代码
  CostCenterName: string; // String 成本中心名称
  CredentialsInfo: string; // String 证件信息
  IsUsed: boolean; // 是否启用
  BookType: StaffBookType; // int 预订类型
  BookCodes: string; // String 预订代码
}
export interface HrEntity {
  Account: {
    Name: string; //
    /// <summary>
    /// 密码
    /// </summary>
    Password: string; //
    /// <summary>
    /// 支付密码
    /// </summary>
    Payword: string; //
    /// <summary>
    /// 真实姓名
    /// </summary>
    RealName: string; //
    /// <summary>
    /// 手机号码
    /// </summary>
    Mobile: string; //
    /// <summary>
    /// 邮箱
    /// </summary>
    Email: string; //
    /// <summary>
    /// 是否启用
    /// </summary>
    IsUsed: boolean; //
    /// <summary>
    /// 是否激活手机
    /// </summary>
    IsActiveMobile: boolean; //
    /// <summary>
    /// 是否激活邮箱
    /// </summary>
    IsActiveEmail: boolean; //
    /// <summary>
    /// 是否实名
    /// </summary>
    IsReality: boolean; //
  }; //
  Name: string; //
}
@Injectable({
  providedIn: "root"
})
export class HrService {
  private staff: StaffEntity;
  constructor(
    private apiService: ApiService,
    private identityService: IdentityService
  ) {
    this.identityService.getIdentity().subscribe(id => {
      if (!id || !id.Id || !id.Ticket) {
        this.staff = null;
      }
    });
  }
  async getStaff(forceRefresh: boolean = false): Promise<StaffEntity> {
    const id = await this.identityService.getIdentityAsync();
    if (!id || !id.Id || !id.Ticket) {
      this.staff = null;
    }
    forceRefresh =
      forceRefresh ||
      (this.staff && !this.staff.IsConfirmInfo) ||
      (this.staff && !this.staff.IsModifyPassword);
    if (this.staff && !forceRefresh) {
      if (this.staff.BookType == StaffBookType.Self) {
        this.staff.AccountId = this.staff.AccountId || id.Id;
        this.staff.Name = this.staff.Name || id.Name;
      }
      return this.staff;
    }
    const req = new RequestEntity();
    req.Method = "HrApiUrl-Staff-Get";
    req.IsShowLoading = true;
    return this.apiService
      .getResponseAsync<StaffEntity>(req)
      .then(s => {
        console.log("staff ", s);
        this.staff = s;
        if (this.staff.BookType == StaffBookType.Self) {
          this.staff.AccountId = this.staff.AccountId || id.Id;
          this.staff.Name = this.staff.Name || id.Name;
        }
        return s;
      })
      .catch(_ => {
        console.error(_);
        return null;
      });
  }
  async comfirmInfo(data: {
    IsModifyPassword: boolean;
    IsModifyCredentials: boolean;
  }) {
    const req = new RequestEntity();
    req.Method = "HrApiUrl-Staff-ComfirmInfo";
    req.Data = data;
    req.IsShowLoading = true;
    return this.apiService
      .getResponseAsync<any>(req)
      .then(_ => true)
      .catch(_ => false);
  }
  async comfirmInfoModifyPassword() {
    return this.comfirmInfo({
      IsModifyPassword: true,
      IsModifyCredentials: false
    });
  }
  async comfirmInfoModifyCredentials() {
    return this.comfirmInfo({
      IsModifyPassword: false,
      IsModifyCredentials: true
    });
  }
}
