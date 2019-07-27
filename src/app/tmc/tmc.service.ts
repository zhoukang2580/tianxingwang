import { LanguageInfo } from "./models/LanguageInfo";
import { AppHelper } from "./../appHelper";
import { OrganizationEntity } from "./../hr/staff.service";
import { AccountEntity } from "./models/AccountEntity";
import { AgentEntity } from "./models/AgentEntity";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { IdentityService } from "src/app/services/identity/identity.service";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { ApiService } from "src/app/services/api/api.service";
import { BehaviorSubject, of } from "rxjs";
import { Injectable } from "@angular/core";
import { MemberCredential } from "../member/member.service";
import { OrderTravelPayType } from "../order/models/OrderTravelEntity";
import { StaffEntity } from "../hr/staff.service";
import { InsuranceResultEntity } from "./models/Insurance/InsuranceResultEntity";
import { PassengerDto } from "./models/PassengerDto";
import { OrderBookDto } from "../order/models/OrderBookDto";
import { CredentialsEntity } from './models/CredentialsEntity';

@Injectable({
  providedIn: "root"
})
export class TmcService {
  private selectedCompanySource: BehaviorSubject<string>;
  private companies: GroupCompanyEntity[];
  private tmc: TmcEntity;
  constructor(
    private apiService: ApiService,
    private identityService: IdentityService
  ) {
    this.identityService.getIdentity().subscribe(id => {
      if (!id || !id.Ticket) {
        this.companies = null;
        this.tmc = null;
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
  async getLanguageInfos(): Promise<LanguageInfo[]> {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiBookUrl-Home-GetTravelUrl";
    return this.apiService.getPromiseData<LanguageInfo[]>(req);
  }
  async getTravelUrls(
    data: {
      staffNumber: string;
      staffOutNumber: string;
      name: string;
    }[]
  ): Promise<{
    [staffNumber: string]: TravelUrlInfo[];
  }> {
    const result: {
      [staffNumber: string]: TravelUrlInfo[];
    } = {} as any;
    const all: Promise<{ key: string; value: TravelUrlInfo[] }>[] = [];
    if (data && data.length) {
      for (let i = 0; i < data.length; i++) {
        const arg = data[i];
        const res = this.getTravelUrl(arg);
        all.push(res);
      }
    }
    const arr = await Promise.all(all);
    arr.forEach(res => {
      if (!result[res.key]) {
        result[res.key] = res.value;
      }
    });
    return result;
  }
  private async getTravelUrl(data: {
    staffNumber: string;
    staffOutNumber: string;
    name: string;
  }): Promise<{
    key: string;
    value: TravelUrlInfo[];
  }> {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiBookUrl-Home-GetTravelUrl";
    req.Data = data;
    return this.apiService.getPromiseData<{
      key: string;
      value: TravelUrlInfo[];
    }>(req);
  }
  async getTmc(forceFetch = true): Promise<TmcEntity> {
    if (this.tmc && !forceFetch) {
      return Promise.resolve(this.tmc);
    }
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiBookUrl-Home-GetTmc";
    this.tmc = await this.apiService.getPromiseData<TmcEntity>(req);
    return this.tmc;
  }
  async searchLinkman(
    name: string
  ): Promise<{ Text: string; Value: string }[]> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Home-SearchLinkman";
    req.Data = {
      name
    };
    return this.apiService.getPromiseData<[]>(req);
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
    return this.apiService.getPromiseData<StaffEntity[]>(req);
  }
  async getCredentialStaffs(accountIds: string[]): Promise<StaffEntity[]> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Home-GetStaffs";
    req.Data = {
      AccountIds: accountIds.join(";")
    };
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService.getPromiseData<StaffEntity[]>(req);
  }
  async getPassengerCredentials(
    accountIds: string[]
  ): Promise<{ [accountId: string]: CredentialsEntity[] }> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Home-Credentials";
    req.Data = {
      AccountIds: accountIds.join(";")
    };
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService.getPromiseData<{
      [accountId: string]: CredentialsEntity[];
    }>(req);
  }
  async getIllegalReasons(): Promise<IllegalReasonEntity[]> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Home-GetIllegalReasons";
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService.getPromiseData<IllegalReasonEntity[]>(req);
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
    return this.apiService.getPromiseData<{ Text: string; Value: string }[]>(
      req
    );
  }
  async bookFlight(bookDto: OrderBookDto): Promise<any> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Flight-Book";
    bookDto.Channel = "Mobile";
    req.Data = bookDto;
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService.getPromiseData<any>(req);
  }
  async getOrganizations(): Promise<OrganizationEntity[]> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Home-GetOrganizations";
    // req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService
      .getPromiseData<OrganizationEntity[]>(req)
      .catch(_ => []);
  }
  async getFlightInsurance(): Promise<InsuranceResultEntity> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Home-GetFlightInsurance";
    req.Timeout = 60;
    return this.apiService.getPromiseData<InsuranceResultEntity>(req);
  }
  async getTravelFrom(): Promise<TravelFormEntity> {
    const req = new RequestEntity();
    const travelformid =
      AppHelper.getQueryParamers && AppHelper.getQueryParamers["travelformid"];
    req.Method = "TmcApiBookUrl-Home-GetTravelFrom";
    req.Timeout = 60;
    req.Data = {
      travelformid
    };
    return this.apiService.getPromiseData<TravelFormEntity>(req);
  }
}
export interface TravelUrlInfo {
  CostCenterCode: string;
  CostCenterName: string;
  OrganizationCode: string;
  OrganizationName: string;
  TravelNumber: string; // TR20190703763
  Trips: string[]; // 火车行程: 07-26 至 07-26 苏州 至 南京"
}

export class TravelFormEntity {
  Tmc: TmcEntity;
  /// <summary>
  ///
  /// </summary>
  Account: AccountEntity;
  /// <summary>
  /// 员工号
  /// </summary>
  StaffNumber: string;
  /// <summary>
  /// 差旅行程号
  /// </summary>
  TravelNumber: string;
  /// <summary>
  /// 差旅类型 机票 火车 酒店
  /// </summary>
  TravelType: string;
  /// <summary>
  /// 差旅主题
  /// </summary>
  Subject: string;
  /// <summary>
  ///
  /// </summary>
  Detail: string;
  /// <summary>
  /// 成本中心
  /// </summary>
  CostCenterCode: string;
  /// <summary>
  /// 成本中心
  /// </summary>
  CostCenterName: string;
  /// <summary>
  /// 有效期
  /// </summary>
  ExpiryTime: string;
  /// <summary>
  /// 最晚更新时间
  /// </summary>
  SyncTime: string;
  /// <summary>
  /// 状态描述
  /// </summary>
  Status: string;

  NoRoute: boolean;
  // 机票首航段
  /// <summary>
  /// 出发城市
  /// </summary>
  FromAirportCity: string;
  /// <summary>
  /// 到达城市
  /// </summary>
  ToAirportCity: string;
  /// <summary>
  /// 出发城市名称
  /// </summary>
  FromAirportCityName: string;
  /// <summary>
  /// 到达城市名称
  /// </summary>
  ToAirportCityName: string;
  /// <summary>
  /// 起飞开始日期
  /// </summary>
  TakeoffStartTime: string;
  /// <summary>
  /// 起飞结束日期
  /// </summary>
  TakeoffEndTime: string;

  // 火车票首航段
  /// <summary>
  /// 出发城市
  /// </summary>
  FromStationCity: string;
  /// <summary>
  /// 到达城市
  /// </summary>
  ToStationCity: string;
  /// <summary>
  /// 出发城市名称
  /// </summary>
  FromStationCityName: string;
  /// <summary>
  /// 到达城市名称
  /// </summary>
  ToStationCityName: string;
  /// <summary>
  /// 起飞开始日期
  /// </summary>
  StartTime: string;
  /// <summary>
  /// 起飞结束日期
  /// </summary>
  EndTime: string;

  //  酒店
  /// <summary>
  /// 出发城市
  /// </summary>
  City: string;
  /// <summary>
  /// 到达城市
  /// </summary>
  CityName: string;
  /// <summary>
  /// 出发城市名称
  /// </summary>
  CheckInTime: string;
  /// <summary>
  /// 到达城市名称
  /// </summary>
  CheckOutTime: string;

  // TravelInfo
  /// <summary>
  /// 航班行程
  /// </summary>
  Flights: TravelInfoFlightEntity[];

  /// <summary>
  /// 火车行程
  /// </summary>
  Trains: TravelInfoTrainEntity[];

  /// <summary>
  /// 酒店
  /// </summary>
  Hotels: TravelInfoHotelEntity[];

  /// <summary>
  /// 相关编号
  /// </summary>
  Numbers: TravelInfoNumberEntity[];
}
export class TravelInfoFlightEntity {
  /// <summary>
  /// 开始时间
  /// yyyy-MM-dd HH:mm
  /// </summary>
  TakeoffStartTime: string;
  /// <summary>
  /// 结束时间
  /// yyyy-MM-dd HH:mm
  /// </summary>
  TakeoffEndTime: string;
  /// <summary>
  /// 起飞城市
  /// 始发城市三字代码
  /// </summary>
  FromAirportCity: string;
  /// <summary>
  /// 起飞城市名称
  /// </summary>
  FromAirportCityName: string;
  /// <summary>
  /// 到达城市
  /// 到达城市三字代码
  /// </summary>
  ToAirportCity: string;
  /// <summary>
  /// 到达城市名称
  /// </summary>
  ToAirportCityName: string;
}
export class TravelInfoTrainEntity {
  /// <summary>
  /// 开始时间
  /// yyyy-MM-dd HH:mm
  /// </summary>
  StartTime: string;
  /// <summary>
  /// 结束时间
  /// yyyy-MM-dd HH:mm
  /// </summary>
  EndTime: string;
  /// <summary>
  /// 始发城市三字代码
  /// </summary>
  FromStationCity: string;
  /// <summary>
  /// 城市名称
  /// </summary>
  FromStationCityName: string;
  /// <summary>
  /// 到达城市
  /// 到达城市三字代码
  /// </summary>
  ToStationCity: string;
  /// <summary>
  /// 到达城市名称
  /// </summary>
  ToStationCityName: string;
}
export class TravelInfoHotelEntity {
  /// <summary>
  /// 开始时间
  /// yyyy-MM-dd HH:mm
  /// </summary>
  CheckInTime: string;
  /// <summary>
  /// 结束时间
  /// yyyy-MM-dd HH:mm
  /// </summary>
  CheckOutTime: string;
  /// <summary>
  /// 入住城市代码
  /// </summary>
  City: string;
  /// <summary>
  /// 城市名称
  /// </summary>
  CityName: string;
}
export class TravelInfoNumberEntity {
  Name: string;
  Code: string;
}
export class TravelInfoEntity {
  FlightList: TravelInfoFlightEntity[];
  TrainList: TravelInfoTrainEntity[];
  HotelList: TravelInfoHotelEntity[];
  NumberList: TravelInfoNumberEntity[];
}
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
  /// <summary>
  /// 是否可以自定义违规理由
  /// </summary>
  IsAllowCustomReason: boolean;
  // ===================== 客户接口对接配置 start ===========
  /// <summary>
  /// 校验行程单
  /// </summary>
  CheckTravelUrl: string;

  /// <summary>
  /// 获取员工行程单列表
  /// </summary>
  GetTravelNumberUrl: string;
  /// <summary>
  /// 获取客户员工
  /// </summary>
  HrUrl: string;
  /// <summary>
  /// 获取客户行程单
  /// </summary>
  TravelUrl: string;
  /// <summary>
  /// 客户通知
  /// </summary>
  NotifyUrl: string;
  // =================== 客户接口对接配置 end =============
  OutNumberNameArray: string[];
  OutNumberRequiryNameArray: string[];
  /// <summary>
  /// 外部编号
  /// </summary>
  OutNumberName: string;
  /// <summary>
  /// 外部编号
  /// </summary>
  OutNumberRequiryName: string;
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
