import { AccountEntity } from "./../flight/models/AccountEntity";
import { AgentEntity } from "./../flight/models/AgentEntity";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { IdentityService } from "src/app/services/identity/identity.service";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { ApiService } from "src/app/services/api/api.service";
import { BehaviorSubject, of } from "rxjs";
import { Injectable } from "@angular/core";
import { MemberCredential } from "../member/member.service";
import { OrderTravelPayType } from "../flight/models/OrderTravelEntity";
import { StaffEntity } from "../hr/staff.service";
export class TmcModel {
  Tmcs: any[];
  Staffs: Array<StaffEntity>;
  ApprovalInfo: any;
  CostCenters: any[];
  IllegalReasons: any[];
  Organizations: any[];
  TravelForms: any[];
}
export enum TmcFlightFeeType {
  /// <summary>
  /// 按票百分比
  /// </summary>
  TicketRatio = 1,
  /// <summary>
  /// 按票固定值
  /// </summary>
  TicketFix = 2,
  /// <summary>
  /// 按航段百分比
  /// </summary>
  SegmentRatio = 3,
  /// <summary>
  /// 按航段固定值
  /// </summary>
  SegmentFix = 4
}
export enum TmcTrainFeeType {
  /// <summary>
  /// 按票百分比
  /// </summary>
  TicketRatio = 1,
  /// <summary>
  /// 按票固定值
  /// </summary>
  TicketFix = 2
}
export class IllegalReasonEntity {
  /// <summary>
  /// TMC编号
  /// </summary>
  Tmc: TmcEntity;
  /// <summary>
  /// 标签
  /// </summary>
  Tag: string;
  /// <summary>
  /// 违规理由
  /// </summary>
  Name: string;
  /// <summary>
  /// 排序号
  /// </summary>
  Sequence: number;
  /// <summary>
  /// 实体副本
  /// </summary>
  DataEntity: IllegalReasonEntity;
}
export enum TmcApprovalType {
  /// <summary>
  /// 不审批
  /// </summary>
  None = 1,
  /// <summary>
  /// 自由审批
  /// </summary>
  Free = 2,
  /// <summary>
  /// 固定审批人
  /// </summary>
  Approver = 3,
  /// <summary>
  /// 超标自由审批
  /// </summary>
  ExceedPolicyFree = 4,
  /// <summary>
  /// 超标固定审批
  /// </summary>
  ExceedPolicyApprover = 5
}
export interface GroupCompanyEntity {
  Code: string;
  Name: string;
  Agent: any;
}
export enum TmcHotelFeeType {
  /// <summary>
  /// 每间夜
  /// </summary>
  Night = 1,
  /// <summary>
  /// 订单
  /// </summary>
  Order = 2
}
export interface TmcEntity {
  Agent: AgentEntity;
  GroupCompany: GroupCompanyEntity;
  Account: AccountEntity;
  Name: string;
  IsUsed: boolean;
  IsUsedName: string;
  Code: string;
  FlightApprovalType: TmcApprovalType;
  FlightPayType: OrderTravelPayType;
  FlightOrderType: string;
  FlightOrderPayType: string;
  FlightFeeType: TmcFlightFeeType;
  FlightFeeTypeName: string;
  FlightHoldMinute: number;
  FlightOnlineFee: string;
  FlightOfflineFee: string;
  FlightExchangeOnlineFee: string;
  FlightExchangeOfflineFee: string;
  FlightRefundOnlineFee: string;
  FlightRefundOfflineFee: string;
  FlightApiIssueFee: string;
  FlightApiExchangeFee: string;
  FlightApiRefundFee: string;
  FlightRewardRatio: string;
  FlightIsAllowRefund: boolean;
  FlightIsAllowExchange: boolean;
  FlightHasInsurance: boolean;
  IsShowServiceFee: boolean;
  // ==== 火车票配置 start =====
  TrainApprovalType: TmcApprovalType;
  TrainPayType: OrderTravelPayType;
  TrainOrderType: string;
  TrainOrderPayType: string;
  TrainOnlineFee: string;
  TrainOfflineFee: string;
  TrainExchangeOnlineFee: string;
  TrainExchangeOfflineFee: string;
  TrainRefundOnlineFee: string;
  TrainRefundOfflineFee: string;
  TrainApiIssueFee: string;
  TrainApiExchangeFee: string;
  TrainApiRefundFee: string;
  TrainFeeType: TmcTrainFeeType;
  TrainHoldMinute: string;
  TrainIsAllowRefund: boolean;
  TrainIsAllowExchange: boolean;
  TrainHasInsurance: boolean;
  // ==== 火车票配置 end =======
  // ============= 酒店配置 start ========
  HotelHoldMinute: string;
  HotelApprovalType: TmcApprovalType;
  HotelOrderType: string;
  HotelPayType: OrderTravelPayType;
  HotelOrderPayType: string;
  HotelPrepayOnlineFee: string;
  HotelSelfPayOnlineFee: string;
  HotelSettleOnlineFee: string;
  HotelPrepayOfflineFee: string;
  HotelSelfPayOfflineFee: string;
  HotelSettleOfflineFee: string;
  HotelPrepayApiFee: string;
  HotelSelfPayApiFee: string;
  HotelSettleApiFee: string;
  HotelAgreementPrepayOnlineFee: string;
  HotelAgreementSelfPayOnlineFee: string;
  HotelAgreementSettleOnlineFee: string;
  HotelAgreementPrepayOfflineFee: string;
  HotelAgreementSelfPayOfflineFee: string;
  HotelAgreementSettleOfflineFee: string;
  HotelAgreementPrepayApiFee: string;
  HotelAgreementSelfPayApiFee: string;
  HotelAgreementSettleApiFee: string;
  HotelFeeType: TmcHotelFeeType;
  // ============= 酒店配置 end ========

  // ===== 保险 start======
  InsuranceHoldMinute: number;
  // ===== 保险 end========

  // 机票短信配置 start ===
  FlightBookNoticeType: string;
  FlightIssueNoticeType: string;
  FlightExchangeNoticeType: string;
  FlightRefundNoticeType: string;
  FlightCancelNoticeType: string;
  FlightCancelExchangeNoticeType: string;
  FlightBookFailureNoticeType: string;
  FlightIssueFailureNoticeType: string;
  FlightExchangeFailureNoticeType: string;
  FlightRefundFailureNoticeType: string;
  FlightCancelFailureNoticeType: string;
  FlightCancelExchangeFailureNoticeType: string;
  // 机票短信配置 end =====

  // =============== 火车票短信配置 start =========
  TrainBookNoticeType: string;
  TrainIssueNoticeType: string;
  TrainExchangeNoticeType: string;
  TrainRefundNoticeType: string;
  TrainCancelNoticeType: string;
  TrainCancelExchangeNoticeType: string;
  TrainBookFailureNoticeType: string;
  TrainIssueFailureNoticeType: string;
  TrainExchangeFailureNoticeType: string;
  TrainRefundFailureNoticeType: string;
  TrainCancelFailureNoticeType: string;
  TrainCancelExchangeFailureNoticeType: string;
  // =============== 火车票短信配置 end   =========

  // =============== 酒店短信配置 start   =========
  HotelBookNoticeType: string;
  HotelBookFailureNoticeType: string;
  HotelCancelNoticeType: string;
  HotelCancelFailureNoticeType: string;

  // =============== 酒店短信配置 end     =========

  // =============== 保险短信配置 start     =========
  InsuranceBookNoticeType: string;
  InsuranceBookFailureNoticeType: string;
  InsuranceCancelNoticeType: string;
  InsuranceCancelFailureNoticeType: string;
  // =============== 保险短信配置 end       =========

  // =============== 审批消息 start =========
  TaskRejectNoticeType: string;
  TaskPassNoticeType: string;
  // =============== 审批消息 end   =========

  // =============== 微信支付配置 start ======
  WechatAppId: string;
  WechatAppSecret: string;
  WechatSecretId: string;
  WechatMchId: string;
  WechatMiniId: string;
  WechatMiniSecret: string;
  // =============== 微信支付配置 end ======
}
@Injectable({
  providedIn: "root"
})
export class TmcService {
  private selectedCompanySource: BehaviorSubject<string>;
  private companies: GroupCompanyEntity[];
  constructor(
    private apiService: ApiService,
    private identityService: IdentityService
  ) {
    this.identityService.getIdentity().subscribe(id => {
      if (!id || !id.Ticket) {
        this.companies = null;
      }
    });
    this.selectedCompanySource = new BehaviorSubject(null);
  }
  getSelectedCompanySource() {
    return this.selectedCompanySource.asObservable();
  }
  setSelectedCompany(company: string) {
    this.selectedCompanySource.next(company);
  }
  async getCompanies(): Promise<GroupCompanyEntity[]> {
    if (this.companies && this.companies.length) {
      return Promise.resolve(this.companies);
    }
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Tmc-GetIdentityCompany";
    req.Data = {};
    this.companies = await this.apiService
      .getPromiseData<GroupCompanyEntity[]>(req)
      .catch(_ => []);
    return this.companies;
  }
  async getCredentials(accountId: string) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiHomeUrl-Credentials-List";
    req.Data = {
      accountId
    };
    return this.apiService
      .getPromiseData<{ Credentials: MemberCredential[] }>(req)
      .then(r => r.Credentials)
      .catch(_ => []);
  }
  async getTmc(): Promise<TmcEntity> {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiBookUrl-Home-GetTmc";
    return this.apiService
      .getPromiseData<TmcEntity>(req)
      .catch(_ => ({} as TmcEntity));
  }
  async searchApprovals(
    name: string
  ): Promise<{ Text: string; Value: string }[]> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Home-SearchApprovals";
    req.Data = {
      name
    };
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService
      .getPromiseData<{ Text: string; Value: string }[]>(req)
      .catch(_ => []);
  }
  async getSettingAppovalStaffs(
    staffSettingAccountIds: string[]
  ): Promise<StaffEntity[]> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Home-GetApproverStaffs";
    req.Data = {
      AccountIds: staffSettingAccountIds.join(";")
    };
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService.getPromiseData<StaffEntity[]>(req).catch(_ => []);
  }
  async getCredentialStaffs(accountIds: string[]): Promise<StaffEntity[]> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Home-GetStaffs";
    req.Data = {
      AccountIds: accountIds.join(";")
    };
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService
      .getPromiseData<StaffEntity[]>(req)
      .catch(_ => [] as StaffEntity[]);
  }
  async getPassengerCredentials(
    accountIds: string[]
  ): Promise<{ [accountId: string]: MemberCredential[] }> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Home-Credentials";
    req.Data = {
      AccountIds: accountIds.join(";")
    };
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService
      .getPromiseData<{ [accountId: string]: MemberCredential[] }>(req)
      .catch(_ => ({}));
  }
  async getIllegalReasons(): Promise<IllegalReasonEntity[]> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Home-GetIllegalReasons";
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService
      .getPromiseData<IllegalReasonEntity[]>(req)
      .catch(_ => []);
  }
  async getCostCenter(
    name: string
  ): Promise<{ Text: string; Value: string }[]> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Home-GetCostCenter";
    req.Data = {
      name
    };
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService
      .getPromiseData<{ Text: string; Value: string }[]>(req)
      .catch(_ => []);
  }
}
