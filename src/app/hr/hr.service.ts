import { RequestEntity } from "src/app/services/api/Request.entity";
import { ApiService } from "src/app/services/api/api.service";
import { Injectable } from "@angular/core";
export interface StaffEntity {
  IsConfirmInfo: boolean;
  IsModifyPassword: boolean;
  BookType: string;
  StaffNumber: string;
  CostCenterName: string;
  CostCenterCode: string;
  OrganizationName: string;
  BookTypeName: string;
  Password: string;
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
  constructor(private apiService: ApiService) {}
  async getStaff(): Promise<StaffEntity> {
    if (this.staff) {
      return Promise.resolve(this.staff);
    }
    const req = new RequestEntity();
    req.Method = "HrApiUrl-Staff-Get";
    return this.apiService.getPromiseResponse<StaffEntity>(req).catch(_ => {
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
    return this.apiService
      .getPromiseResponse<any>(req)
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
