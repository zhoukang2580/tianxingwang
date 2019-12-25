import { finalize } from 'rxjs/operators';
import { Subject, from, Subscription } from "rxjs";
import { MemberCredential } from "src/app/member/member.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { ApiService } from "src/app/services/api/api.service";
import { Injectable } from "@angular/core";
import { TaskType } from "../workflow/models/TaskType";
import { BaseSettingEntity } from '../models/BaseSettingEntity';
import { AccountEntity } from '../account/models/AccountEntity';

@Injectable({
  providedIn: "root"
})
export class StaffService {
  private staff: StaffEntity;
  private fetchingReqStaffCredentials: { isFetching: boolean; promise: Promise<any> } = {} as any;;
  private fetchingReq: { isFetching: boolean; promise: Promise<any> } = {} as any;
  staffCredentials: MemberCredential[];
  constructor(
    private apiService: ApiService,
    private identityService: IdentityService
  ) {
    this.identityService.getIdentitySource().subscribe(id => {
      this.disposal();
    });
  }
  private disposal() {
    this.staff = null;
    this.staffCredentials = null;
  }
  async isSelfBookType(isShowLoading = true) {
    const t = (await this.getBookType()) === StaffBookType.Self;
    console.log("isSelfbooktype ", await this.getBookType(isShowLoading), t);
    return t;
  }
  async isAllBookType() {
    const t = await this.getBookType();
    return t === StaffBookType.All;
  }
  async isSecretaryBookType() {
    const t = await this.getBookType();
    return t == StaffBookType.Secretary;
  }
  private async getBookType(isShowLoading = true): Promise<StaffBookType> {
    const s = await this.getStaff(false, isShowLoading).catch(_ => null);
    return s && s.BookType;
  }

  async getStaff(forceRefresh: boolean = false, isShowLoading = false): Promise<StaffEntity> {
    const id = await this.identityService.getIdentityAsync().catch(_ => null);
    if (!id || !id.Id || !id.Ticket) {
      return this.staff;
    }
    forceRefresh = forceRefresh || !this.staff;
    if (!forceRefresh) {
      if (this.staff) {
        return this.staff;
      }
    }
    // if (this.staff) {
    //   if (
    //     !forceRefresh ||
    //     (this.staff.BookType === undefined && id.Numbers && id.Numbers.AgentId)
    //   ) {
    //     if (this.staff.BookType == StaffBookType.Self) {
    //       this.staff.AccountId = this.staff.AccountId || id.Id;
    //       this.staff.Name = this.staff.Name || id.Name;
    //     } {
    //       return this.staff;
    //     }
    //   }
    // }
    const req = new RequestEntity();
    req['forceRefresh'] = forceRefresh;
    req.Method = "HrApiUrl-Staff-Get";
    req.IsShowLoading = isShowLoading;
    // this.staffSubscription.unsubscribe();
    const existing = this.fetchingReq.isFetching;
    if (existing) {
      return this.fetchingReq.promise;
    }
    this.fetchingReq = {
      isFetching: true,
      promise: this.apiService
        .getPromiseData<StaffEntity>(req)
        .then(staff => {
          this.fetchingReq = {} as any;
          console.log("staff ", staff, `forceFetch=${forceRefresh}`, `isfetching=${this.fetchingReq.isFetching}`);
          this.staff = staff;
          if (this.staff.BookType == StaffBookType.Self) {
            this.staff.AccountId = this.staff.AccountId || id.Id;
            this.staff.Name = this.staff.Name || id.Name;
          }
          return staff
        }).catch(_ => {
          this.fetchingReq = {} as any;
          return null as StaffEntity;
        })
    };
    return this.fetchingReq.promise;
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
      .getPromiseData<any>(req)
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
  async getStaffCredentials(AccountId: string, forceFetch = false): Promise<MemberCredential[]> {
    const req = new RequestEntity();
    req.Method = `TmcApiHomeUrl-Staff-Credentials`;
    req.IsShowLoading = true;
    req.Data = {
      AccountId
    };
    if (!forceFetch) {
      if (this.staffCredentials && this.staffCredentials.length) {
        return Promise.resolve(this.staffCredentials);
      }
    }
    if (this.fetchingReqStaffCredentials&&this.fetchingReqStaffCredentials.promise) {
      return this.fetchingReqStaffCredentials.promise;
    }
    this.fetchingReqStaffCredentials = {
      isFetching: true,
      promise: this.apiService
        .getPromiseData<MemberCredential[]>(req)
        .then(res => {
          this.staffCredentials = res;
          return res;
        })
        .catch(_ => [] as MemberCredential[])
        .finally(() => {
          this.fetchingReqStaffCredentials = null;
        })
    }
    return this.fetchingReqStaffCredentials.promise;
  }
}
export enum StaffBookType {
  /// <summary>
  /// 秘书
  /// </summary>
  Secretary = "Secretary",
  /// <summary>
  /// 自己
  /// </summary>
  Self = "Self",
  /// <summary>
  /// 全部
  /// </summary>
  All = "All"
}
export class OrganizationEntity {
  Id: string;
  ParentId: string;
  Hr: HrEntity;
  Parent: OrganizationEntity;
  Code: string;
  Name: string;
  Sequence: number;
  ShortName: string;
  Children: OrganizationEntity[];
}
export class CostCenterEntity {
  /// <summary>
  ///
  /// </summary>
  Hr: HrEntity;
  /// <summary>
  ///名称
  /// </summary>
  Name: string;
  /// <summary>
  /// 代码
  /// </summary>
  Code: string;
  /// <summary>
  /// 是否启用
  /// </summary>
  IsUsed: boolean;
  /// <summary>
  /// 启用状态
  /// </summary>
  IsUsedName: string;
}
export enum PolicyType {
  /// <summary>
  /// 无需判断
  /// </summary>
  None = 1,
  /// <summary>
  /// 违规预订
  /// </summary>
  IllegalOrder = 2,
  /// <summary>
  /// 违规不可预订
  /// </summary>
  IllegalUnOrder = 3,
  /// <summary>
  /// 不可预订
  /// </summary>
  UnOrder = 4
}
export class PolicyEntity extends BaseSettingEntity {
  Setting: string;
  /// <summary>
  ///
  /// </summary>
  Hr: HrEntity;
  /// <summary>
  // 名称
  /// </summary>
  Name: string;
  /// <summary>
  /// 是否启用
  /// </summary>
  IsUsed: boolean;
  /// <summary>
  /// 启用状态
  /// </summary>
  IsUsedName: string;
  /// <summary>
  /// 是需要审批
  /// </summary>
  IsNeedAudit: boolean;
  // ============== 国内机票配置 start============
  //  机票保险金额
  FlightInsuranceAmount: number;
  FlightIsForceInsurance: boolean;
  FlightIsCabinIllegalBook: boolean;
  FlightIsMustBookLowestPrice: boolean;
  FlightDescription: string;
  FlightType: PolicyType;
  FlightTypeName: string;
  // 飞行时间多久升级到F舱
  FlightFlyTimeToF: number;
  FlightLowerFare: number;
  FlightLowerFareStartTime: string;
  FlightLowerFareEndTime: string;
  FlightCabinLevel: string;
  FlightIllegalTip: string;
  FlightLegalTip: string;
  FlightAdvanceBook: string;
  FlightDiscountLimit: string;
  // ============== 国内机票配置 end ============
  // ============== 火车站 start ============

  TrainType: PolicyType;
  TrainDescription: string;
  // ============== 火车站 end ============
  TrainIllegalTip: string;
  TrainSeatType: string;
  TrainSeatTypeName: string;
  TrainUpperSeatType: string;
  TrainUpperSeatTypeName: string;
  TrainUpperSeatTypeArray: string[];
  //
  HotelIllegalTip: string;
  HotelDescription: string;
  InternationalFlightIllegalTip: string;
}
export class StaffApprover {
  RealName: string;
  Tag: string;
  Type: TaskType;
  Account: AccountEntity;
}
export class StaffEntity {
  isNotWhiteList: boolean;
  /// <summary>
  ///
  /// </summary>
  Hr: HrEntity;
  /// <summary>
  /// 账户
  /// </summary>
  Account: AccountEntity;
  /// <summary>
  /// 组织
  /// </summary>
  Organization: OrganizationEntity;
  /// <summary>
  /// 成本中心
  /// </summary>
  CostCenter: CostCenterEntity;
  /// <summary>
  /// 政策
  /// </summary>
  Policy: PolicyEntity;
  StaffNumber: string;
  BookTypeName: string;
  Password: string;
  ApproveId: string; // ApproveId Id
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
  Setting: string; // json string
  Approvers: StaffApprover[];
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