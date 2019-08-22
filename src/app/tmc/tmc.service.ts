import { LanguageInfo } from "./models/LanguageInfo";
import { AppHelper } from "./../appHelper";
import { OrganizationEntity, StaffApprover } from "./../hr/staff.service";
import { AccountEntity } from "./models/AccountEntity";
import { AgentEntity } from "./models/AgentEntity";
import { IdentityService } from "src/app/services/identity/identity.service";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { ApiService } from "src/app/services/api/api.service";
import { BehaviorSubject, of } from "rxjs";
import { Injectable } from "@angular/core";
import { MemberCredential } from "../member/member.service";
import { OrderTravelPayType } from "../order/models/OrderTravelEntity";
import { StaffEntity } from "../hr/staff.service";
import { InsuranceResultEntity } from "./models/Insurance/InsuranceResultEntity";
import { OrderBookDto } from "../order/models/OrderBookDto";
import { CredentialsEntity } from "./models/CredentialsEntity";
import { TrafficlineEntity } from "./models/TrafficlineEntity";
import { Storage } from "@ionic/storage";
import * as jsPy from "js-pinyin";
import { OrderModel } from "../order/models/OrderModel";
import { OrderService } from "../order/order.service";
import { PassengerFlightSegmentInfo } from "../flight/models/PassengerFlightInfo";
import { ITrainInfo } from "../train/train.service";
import { InsuranceProductEntity } from "../insurance/models/InsuranceProductEntity";
export const KEY_HOME_AIRPORTS = `ApiHomeUrl-Resource-Airport`;
export const KEY_INTERNATIONAL_AIRPORTS = `ApiHomeUrl-Resource-InternationalAirport`;

interface SelectItem {
  Value: string;
  Text: string;
}
interface LocalStorageAirport {
  LastUpdateTime: number;
  Trafficlines: TrafficlineEntity[];
}
export enum FlightHotelTrainType {
  Flight = 1,
  Hotel = 2,
  Train = 3
}
@Injectable({
  providedIn: "root"
})
export class TmcService {
  private localInternationAirports: LocalStorageAirport;
  emailTemplateSelectItemList: SelectItem[] = [];
  mobileTemplateSelectItemList: SelectItem[] = [];
  private localDomesticAirports: LocalStorageAirport;
  private selectedCompanySource: BehaviorSubject<string>;
  private companies: GroupCompanyEntity[];
  private tmc: TmcEntity;
  private travelType: FlightHotelTrainType;
  allLocalAirports: TrafficlineEntity[];
  constructor(
    private apiService: ApiService,
    private storage: Storage,
    private identityService: IdentityService,
    private orderService: OrderService
  ) {
    this.identityService.getIdentity().subscribe(id => {
      if (!id || !id.Ticket) {
        this.companies = null;
        this.tmc = null;
      }
    });
    this.selectedCompanySource = new BehaviorSubject(null);
  }
  setFlightHotelTrainType(type: FlightHotelTrainType) {
    this.travelType = type;
  }
  getFlightHotelTrainType() {
    return this.travelType;
  }
  getOrderList(searchCondition: OrderModel) {
    return this.orderService.getOrderList(searchCondition);
  }
  getOrderListAsync(searchCondition: OrderModel) {
    return this.orderService.getOrderListAsync(searchCondition);
  }
  getOrderDetail(id: string) {
    return this.orderService.getOrderDetailAsync(id);
  }
  getOrderTasks(data: OrderModel) {
    return this.orderService.getOrderTasksAsync(data);
  }
  getMyTrips(data: OrderModel) {
    return this.orderService.getMyTripsAsync(data);
  }
  getSelectedCompanySource() {
    return this.selectedCompanySource.asObservable();
  }
  setSelectedCompany(company: string) {
    this.selectedCompanySource.next(company);
  }
  async sendEmail(
    toEmails: string[],
    subject: string,
    content: string,
    orderId: string
  ): Promise<{
    Status: boolean;
    Id: string;
    Message: string;
  }> {
    const req = new RequestEntity();
    req.Data = {
      toEmails: toEmails.join(","),
      Subject: subject,
      Id: orderId,
      body: content
    };
    req.Method = "TmcApiOrderUrl-Order-SendEmail";
    const result = await this.apiService
      .getPromiseData<{
        Status: boolean;
        Id: string;
        Message: string;
      }>(req)
      .catch(
        e =>
          ({
            Status: false,
            Id: "",
            Message: e instanceof Error ? e.message : e.error || ""
          } as any)
      );
    return result;
  }
  async sendSms(
    toMobiles: string[],
    content: string,
    orderId: string
  ): Promise<{
    Status: boolean;
    Id: string;
    Message: string;
  }> {
    const req = new RequestEntity();
    req.Data = {
      toMobiles: toMobiles.join(","),
      Id: orderId,
      body: content
    };
    req.Method = "TmcApiOrderUrl-Order-SendSms";
    const result = await this.apiService
      .getPromiseData<{
        Status: boolean;
        Id: string;
        Message: string;
      }>(req)
      .catch(
        e =>
          ({
            Status: false,
            Id: "",
            Message: e instanceof Error ? e.message : e.error || ""
          } as any)
      );
    return result;
  }
  async getEmailTemplateSelectItemList() {
    if (
      this.emailTemplateSelectItemList &&
      this.emailTemplateSelectItemList.length
    ) {
      return Promise.resolve(this.emailTemplateSelectItemList);
    }
    const req = new RequestEntity();
    req.Method = "TmcApiOrderUrl-Order-getEmailTemplateSelectItemList";
    this.emailTemplateSelectItemList = await this.apiService
      .getPromiseData<SelectItem[]>(req)
      .catch(_ => [] as SelectItem[]);
    return this.emailTemplateSelectItemList;
  }
  async getMobileTemplateSelecItemtList() {
    if (
      this.mobileTemplateSelectItemList &&
      this.mobileTemplateSelectItemList.length
    ) {
      return Promise.resolve(this.mobileTemplateSelectItemList);
    }
    const req = new RequestEntity();
    req.Method = "TmcApiOrderUrl-Order-getMobileTemplateSelectItemList";
    this.mobileTemplateSelectItemList = await this.apiService
      .getPromiseData<SelectItem[]>(req)
      .catch(_ => [] as SelectItem[]);
    return this.mobileTemplateSelectItemList;
  }
  async GetFlightEmail(
    type: string,
    orderTicketId: string,
    lang: string
  ): Promise<{ ToEmails: string[]; Body: string; Subject: string }> {
    const req = new RequestEntity();
    req.Data = {
      type,
      orderTicketId,
      lang
    };
    req.Method = "TmcApiOrderUrl-Flight-GetFlightEmail";
    const result = await this.apiService
      .getPromiseData<{ ToEmails: string[]; Body: string; Subject: string }>(
        req
      )
      .catch(_ => ({ ToEmails: [], Body: "", Subject: "" }));
    return result;
  }
  async getFlightMessage(
    type: string,
    orderTicketId: string,
    lang: string
  ): Promise<{ ToMobiles: string[]; Body: string }> {
    const req = new RequestEntity();
    req.Method = "TmcApiOrderUrl-Flight-GetFlightMessage";
    req.Data = {
      type,
      orderTicketId,
      lang
    };
    return this.apiService
      .getPromiseData<{ ToMobiles: string[]; Body: string }>(req)
      .catch(_ => ({ ToMobiles: [], Body: "" }));
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
  async searchPassengerCredentials(accountId: string) {
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
  async getAllLocalAirports(forceFetch = false) {
    if (!forceFetch && this.allLocalAirports && this.allLocalAirports.length) {
      return Promise.resolve(this.allLocalAirports);
    }
    this.apiService.showLoadingView();
    const h = await this.getDomesticAirports(forceFetch);
    const i = await this.getInternationalAirports(forceFetch);
    this.apiService.hideLoadingView();
    this.allLocalAirports = [...h, ...i];
    this.allLocalAirports = this.allLocalAirports.map(a => {
      a.FirstLetter = this.getFirstLetter(a.CityName);
      // if (!a.Pinyin) {
      //   a.FirstLetter = this.getFirstLetter(a.CityName);
      // } else {
      //   a.FirstLetter = a.Pinyin.substring(0, 1).toUpperCase();
      // }
      return a;
    });
    return this.allLocalAirports;
  }
  private getFirstLetter(name: string) {
    const pyFl = `${jsPy.getFullChars(name)}`.charAt(0);
    return pyFl && pyFl.toUpperCase();
  }
  async getDomesticAirports(forceFetch: boolean = false) {
    const req = new RequestEntity();
    req.Method = `ApiHomeUrl-Resource-Airport`;
    if (!this.localDomesticAirports) {
      this.localDomesticAirports =
        (await this.storage.get(KEY_HOME_AIRPORTS)) ||
        ({
          LastUpdateTime: 0,
          Trafficlines: []
        } as LocalStorageAirport);
    }
    if (
      !forceFetch &&
      this.localDomesticAirports &&
      this.localDomesticAirports.Trafficlines &&
      this.localDomesticAirports.Trafficlines.length
    ) {
      return Promise.resolve(this.localDomesticAirports.Trafficlines);
    }
    req.Data = {
      LastUpdateTime: this.localDomesticAirports.LastUpdateTime
    };
    const r = await this.apiService
      .getPromiseData<{
        HotelCities: any[];
        Trafficlines: TrafficlineEntity[];
      }>(req)
      .catch(
        _ =>
          ({
            Trafficlines: []
          } as {
            HotelCities: any[];
            Trafficlines: TrafficlineEntity[];
          })
      );
    const local = this.localDomesticAirports;
    if (r.Trafficlines && r.Trafficlines.length) {
      const airports = [
        ...this.localDomesticAirports.Trafficlines.filter(
          item => !r.Trafficlines.some(i => i.Id == item.Id)
        ),
        ...r.Trafficlines
      ];
      this.localDomesticAirports.LastUpdateTime = Math.floor(Date.now() / 1000);
      local.Trafficlines = this.localDomesticAirports.Trafficlines = airports;
      await this.storage.set(KEY_HOME_AIRPORTS, this.localDomesticAirports);
    }
    return local.Trafficlines;
  }
  async getInternationalAirports(forceFetch: boolean = false) {
    const req = new RequestEntity();
    req.Method = `ApiHomeUrl-Resource-InternationalAirport`;
    // req.IsForward = true;
    if (!this.localInternationAirports) {
      this.localInternationAirports =
        (await this.storage.get(KEY_INTERNATIONAL_AIRPORTS)) ||
        ({
          LastUpdateTime: 0,
          Trafficlines: []
        } as LocalStorageAirport);
    }
    if (!forceFetch && this.localInternationAirports.Trafficlines.length) {
      return Promise.resolve(this.localInternationAirports.Trafficlines);
    }
    req.Data = {
      LastUpdateTime: this.localInternationAirports.LastUpdateTime
    };
    let st = window.performance.now();
    const r = await this.apiService
      .getPromiseData<{
        HotelCities: any[];
        Trafficlines: TrafficlineEntity[];
      }>(req)
      .catch(_ => ({ Trafficlines: [] as TrafficlineEntity[] }));
    const local = this.localInternationAirports;
    if (r.Trafficlines && r.Trafficlines.length) {
      const airports = [
        ...this.localInternationAirports.Trafficlines.filter(
          item => !r.Trafficlines.some(i => i.Id == item.Id)
        ),
        ...r.Trafficlines
      ];
      local.Trafficlines = airports;
      this.localInternationAirports.LastUpdateTime = Math.floor(
        Date.now() / 1000
      );
      this.localInternationAirports.Trafficlines = local.Trafficlines;
      st = window.performance.now();
      this.storage
        .set(KEY_INTERNATIONAL_AIRPORTS, this.localInternationAirports)
        .then(_ => {
          console.log(
            `本地化国际机票耗时：${window.performance.now() - st} ms`
          );
        });
    }
    return local.Trafficlines;
  }
  async checkPay(orderId: string): Promise<boolean> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Home-CheckPay";
    req.Data = {
      OrderId: orderId
    };
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService
      .getPromiseData<boolean>(req)
      .then(_ => true)
      .catch(_ => false);
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
  async getTmc(forceFetch = false): Promise<TmcEntity> {
    if (this.tmc && !forceFetch) {
      return Promise.resolve(this.tmc);
    }
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiHomeUrl-Tmc-GetTmc";
    this.tmc = await this.apiService.getPromiseData<TmcEntity>(req);
    return this.tmc;
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
  async getOrganizations(): Promise<OrganizationEntity[]> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Home-GetOrganizations";
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService
      .getPromiseData<OrganizationEntity[]>(req)
      .catch(_ => []);
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
export interface PassengerBookInfo {
  passenger: StaffEntity;
  credential: CredentialsEntity;
  isNotWhitelist?: boolean;
  flightSegmentInfo?: PassengerFlightSegmentInfo;
  trainInfo?: ITrainInfo;
  id?: string;
  isReplace?: boolean;
}
export class InitialBookDtoModel {
  ServiceFees: { [clientId: string]: string };
  Insurances: { [clientId: string]: InsuranceProductEntity[] };
  TravelFrom: TravelFormEntity;
  Tmc: TmcEntity;
  IllegalReasons: string[];
  Staffs: {
    CredentialStaff: StaffEntity;
    Account: AccountEntity;
    CostCenter: {
      Code: string;
      Name: string;
    };
    Organization: {
      Code: string;
      Name: string;
    };
    Name: string;
    Id: string;
    Number: string;
    OutNumber: string;
    DefaultApprover: StaffEntity;
    Approvers: StaffApprover[];
  }[];
}
