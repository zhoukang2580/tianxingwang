import { OrderFlightTicketEntity } from "./../order/models/OrderFlightTicketEntity";
import { Platform } from "@ionic/angular";
import { AppHelper } from "./../appHelper";
import { OrganizationEntity, StaffApprover } from "../hr/hr.service";
import { AgentEntity } from "./models/AgentEntity";
import { IdentityService } from "src/app/services/identity/identity.service";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { ApiService } from "src/app/services/api/api.service";
import { BehaviorSubject } from "rxjs";
import { Injectable } from "@angular/core";
import { MemberCredential, MemberService } from "../member/member.service";
import { OrderTravelPayType } from "../order/models/OrderTravelEntity";
import { StaffEntity } from "../hr/hr.service";
import { CredentialsEntity } from "./models/CredentialsEntity";
import { TrafficlineEntity } from "./models/TrafficlineEntity";
import { getFullChars } from "js-pinyin";
import * as moment from "moment";
import { InsuranceProductEntity } from "../insurance/models/InsuranceProductEntity";
import { PayService } from "../services/pay/pay.service";
import { TmcDataEntity } from "./models/TmcDataEntity";
import { AccountEntity } from "../account/models/AccountEntity";
import { BaseEntity } from "../models/BaseEntity";
import { TravelModel } from "../order/models/TravelModel";
import { OrderEntity } from "../order/models/OrderEntity";
import { OrderTrainTicketEntity } from "../order/models/OrderTrainTicketEntity";
import { CountryEntity } from "./models/CountryEntity";
import { IdentityEntity } from "../services/identity/identity.entity";
import { OrderTrainTripEntity } from "../order/models/OrderTrainTripEntity";
import { OrderFlightTripEntity } from "../order/models/OrderFlightTripEntity";
import { BaseVariablesEntity } from "../models/BaseVariablesEntity";
import {
  TravelFormTripEntity,
  TmcTravelApprovalType,
  ApprovalStatusType,
  TravelFormDetailEntity,
} from "../travel-application/travel.service";
import { CONFIG } from "../config";
import { AgentRegionType } from "./models/AgentRegionType";
import { TimeoutTipComponent } from "./components/timeout-tip/timeout-tip.component";
import { FlightSegmentEntity } from "../flight-gp/models/flight/FlightSegmentEntity";
import { FlightCabinEntity } from "../flight-gp/models/flight/FlightCabinEntity";
import { StorageService } from "../services/storage-service.service";
import { ConfigService } from "../services/config/config.service";
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
  Train = 3,
  HotelInternational = 4,
  InternationalFlight = 5,
}
@Injectable({
  providedIn: "root",
})
export class TmcService {
  private localInternationAirports: LocalStorageAirport;
  private localDomesticAirports: LocalStorageAirport;
  private selectedCompanySource: BehaviorSubject<string>;
  private fetchingTmcPromise: Promise<TmcEntity>;
  private companies: GroupCompanyEntity[];
  private banners: any[];
  private memberDetail: any;
  private getRecommendHotelObj: { [key: string]: any } = {};
  private tmc: TmcEntity;
  // private fetchingCredentialReq: { [md5: string]: { isFectching: boolean; promise: Promise<any>; } } = {} as any;
  private identity: IdentityEntity;
  private agent: AgentEntity;
  private loadAgentDataPromise: Promise<AgentEntity>;
  private mobileTemplateSelectItemList: SelectItem[] = [];
  private emailTemplateSelectItemList: SelectItem[] = [];
  public allLocalAirports: TrafficlineEntity[];
  private isReloadDomesticAirports = false;
  private isReloadInterAirports = false;
  private loadDomesticAirportsPromise: Promise<TrafficlineEntity[]>;
  private loadInterAirportsPromise: Promise<TrafficlineEntity[]>;
  constructor(
    private apiService: ApiService,
    private storage: StorageService,
    private identityService: IdentityService,
    private payService: PayService,
    private platform: Platform,
    private memberService: MemberService,
    private configService: ConfigService
  ) {
    this.selectedCompanySource = new BehaviorSubject(null);
    this.identityService.getIdentitySource().subscribe((id) => {
      this.identity = id;
      this.disposal();
      this.banners = [];
      this.memberDetail = null;
    });
  }
  getQuickexpressPayWay() {
    return [{ label: "????????????", value: "quickexpress" }];
  }
  async getMemberDetail() {
    if (this.memberDetail) {
      return this.memberDetail;
    }
    return this.memberService.getMember().then((md) => {
      this.memberDetail = md;
      return md;
    });
  }
  getMonthDays(year: number, month: number) {
    const m = moment(`${year}-${month < 10 ? "0" + month : month}-01`);
    const days: number[] = [];
    const len = m.endOf("month").date();
    const curY = moment().year();
    const curM = moment().month() + 1;
    const curDate = moment().date();
    for (let i = 1; i <= len; i++) {
      if (curY == year && curM == month) {
        if (i < curDate) {
          continue;
        }
      }
      days.push(i);
    }
  }
  private disposal() {
    this.companies = null;
    this.tmc = null;
    this.agent = null;
    this.fetchingTmcPromise = null;
    this.getRecommendHotelObj = {};
    this.setSelectedCompanySource("");
  }
  get isAgent() {
    return !!(
      this.identity &&
      this.identity.Numbers &&
      this.identity.Numbers.AgentId
    );
  }
  async getBanners() {
    if (this.banners && this.banners.length) {
      return this.banners;
    }
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Banner-List";
    req.IsRedirctNoAuthorize = false;
    req.IsRedirctLogin = false;
    return this.apiService
      .getPromiseData<{ ImageUrl: string; Title: string; Id: string }[]>(req)
      .then((r) => {
        this.banners = r;
        return r;
      });
  }

  async getRecommendHotel(d: {
    PageIndex: number;
    PageSize: number;
    CityCode: string;
    SearchDate: string;
  }) {
    const req = new RequestEntity();
    const id = await this.identityService.getIdentityAsync();
    // .catch(e=>null);
    if (!id || !id.Id) {
      return null;
    }
    if (this.getRecommendHotelObj[`${id.Id}_${d.CityCode}_${d.PageIndex}`]) {
      return this.getRecommendHotelObj[`${id.Id}_${d.CityCode}_${d.PageIndex}`];
    }
    req.Method = "TmcApiHotelUrl-Home-RecommendHotel";
    req.IsRedirctNoAuthorize = false;
    req.IsRedirctLogin = false;
    req.Data = {
      PageIndex: 0,
      PageSize: d.PageSize,
      CityCode: d.CityCode,
      SearchDate: d.SearchDate,
    };
    return this.apiService
      .getPromiseData<{
        DataCount: string;
        HotelDefaultImg: string;
        HotelDayPrices: {
          Id: string;
          HotelName: string;
          HotelAddress: string;
          HotelCategory: string;
          HotelFileName: string;
        }[];
      }>(req)
      .then((r) => {
        if (r && r.HotelDayPrices && r.HotelDayPrices.length) {
          this.getRecommendHotelObj[`${id.Id}_${d.CityCode}_${d.PageIndex}`] =
            r;
        }
        return r;
      });
  }

  async getTaskReviewed() {
    // return [
    //   {
    //     Title: "??????aaa",
    //     Id: "1",
    //   },
    //   {
    //     Title: "??????aaa",
    //     Id: "2",
    //   },
    //   {
    //     Title: "??????aaa",
    //     Id: "3",
    //   },
    //   {
    //     Title: "??????aaa",
    //     Id: "4",
    //   },
    //   {
    //     Title: "??????aaa",
    //     Id: "5",
    //   },
    // ];
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Home-TaskReviewed";
    req.Data = {};
    return this.apiService.getPromiseData<any[]>(req);
  }
  async SetAccountMessage(task) {
    // return true;
    if (!task || !task.Id) {
      return false;
    }
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Home-SetAccountMessage";
    req.Data = { ...task };
    return this.apiService.getPromiseData<any>(req);
  }
  async getAccountWaitingTasks() {
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Home-GetAccountWaitingTasks";
    return this.apiService.getPromiseData<{ DataCount: number }>(req);
  }
  private async checkHasFlightDynamic() {
    const Agent = await this.getAgent();
    return Agent && Agent.HasFlightDynamic;
  }
  private async checkHasAuth(isDomestic = true) {
    try {
      // const msg = "?????????????????????";
      const Tmc = await this.getTmc();
      const tmcRegionTypeValues = Tmc.RegionTypeValue.split(",");
      const Agent = await this.getAgent();
      if (!isDomestic) {
        const pass =
          Tmc &&
          // tslint:disable-next-line: no-bitwise
          (Tmc.RegionType & AgentRegionType.InternationalHotel) > 0 &&
          Agent &&
          // tslint:disable-next-line: no-bitwise
          (Agent.RegionType & AgentRegionType.InternationalHotel) > 0;
        if (
          !tmcRegionTypeValues.find(
            (it) => it.toLowerCase() == "internationalhotel"
          ) ||
          !pass
        ) {
          // AppHelper.alert(msg);
          return false;
        }
      }
      if (isDomestic) {
        const pass =
          Tmc &&
          // tslint:disable-next-line: no-bitwise
          (Tmc.RegionType & AgentRegionType.Hotel) > 0 &&
          Agent != null &&
          // tslint:disable-next-line: no-bitwise
          (Agent.RegionType & AgentRegionType.Hotel) > 0;
        if (
          !tmcRegionTypeValues.find((it) => it.toLowerCase() == "hotel") ||
          !pass
        ) {
          return false;
        }
      }
    } catch (e) {
      return false;
    }

    return true;
  }
  async hasBookRight(
    name:
      | "flight"
      | "international-flight"
      | "hotel"
      | "international-hotel"
      | "train"
      | "rentalCar"
      | "bulletin"
      | "flightGp"
  ) {
    if (name) {
      const tmc = await this.getTmc();
      if (!tmc || !tmc.RegionTypeValue) {
        return false;
      }
      let route = "";

      const tmcRegionTypeValues = tmc.RegionTypeValue.toLowerCase().split(",");
      if (name == "international-flight") {
        if (!CONFIG.mockProBuild) {
          return false;
        }
        route = "search-international-flight";
        if (!tmcRegionTypeValues.find((it) => it == "internationalflight")) {
          return false;
        }
        return true;
      }
      if (name == "international-hotel") {
        route = "search-international-hotel";
        return this.checkHasAuth(false);
      }
      if (name == "hotel") {
        route = "search-hotel";
        return this.checkHasAuth(true);
      }
      if (name == "train") {
        route = "search-train";
        if (!tmcRegionTypeValues.find((it) => it == "train")) {
          return false;
        }
        return true;
      }
      if (name == "flight") {
        route = "search-flight";
        if (!tmcRegionTypeValues.find((it) => it == "flight")) {
          return false;
        }
        return true;
      }
      if (name == "rentalCar") {
        route = "rental-car";
        if (!tmcRegionTypeValues.find((it) => it == "car")) {
          return false;
        }
        return true;
      }
      if (name == "flightGp") {
        route = "search-flight-gp";
        if (!tmcRegionTypeValues.find((it) => it == "gp")) {
          return false;
        }
        return true;
      }
      if (name == "bulletin") {
        route = "bulletin-list";
      }
    }
    return false;
  }
  async getTripList() {
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Home-TripList";
    req.Data = {};

    return this.apiService.getPromiseData<any[]>(req);
  }

  async getIntegral(d: { Tag: string; PageSize: number }) {
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Home-Exchange";
    req.Data = {
      Tag: d.Tag,
      PageSize: d.PageSize,
    };
    return this.apiService.getPromiseData<any>(req).then((it) => {
      if (it) {
        try {
          return JSON.parse(it);
        } catch (e) {
          console.log(e);
          return null;
        }
      }
      return null;
    });
  }
  getSign(d: { Amount: number; Name: string }) {
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Home-Sign";
    req.Data = {
      Amount: d.Amount,
      Name: d.Name,
    };
    req.IsShowLoading = true;
    return this.apiService.getResponse<any>(req);
  }
  checkIfCanDailySigned(showLoading = false) {
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Home-Initialization";
    req.IsShowLoading = showLoading;
    return this.apiService.getPromiseData<{
      isRegister: boolean;
      isCanSign: boolean;
    }>(req);
  }

  async getLogin() {
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Home-Login";
    req.Data = {};
    req.IsShowLoading = true;
    return this.apiService.getPromiseData<any>(req);
  }
  async showTimeoutPop() {
    const t = await AppHelper.popoverController.getTop();
    if (t) {
      t.dismiss();
    }
    const t2 = await AppHelper.popoverController.create({
      component: TimeoutTipComponent,
      componentProps: {
        ctrl: AppHelper.popoverController,
      },
      cssClass: "ticket-changing page-timeout",
    });
    return t2;
  }
  setTravelFormNumber(tn: string) {
    AppHelper.setQueryParamers("TravelNumber", tn);
  }
  getTravelFormNumber() {
    const tn =
      AppHelper.getQueryParamers()["travelFormId"] ||
      AppHelper.getQueryParamers()["travelNumber"] ||
      AppHelper.getQueryParamers()["travelnumber"] ||
      AppHelper.getQueryParamers()["TravelNumber"];
    return tn || "";
  }
  clearTravelFormNumber() {
    AppHelper.removeQueryParamers("travelFormId");
    AppHelper.removeQueryParamers("travelNumber");
    AppHelper.removeQueryParamers("travelnumber");
    AppHelper.removeQueryParamers("TravelNumber");
  }
  getTrips(type: "Flight" | "Train" | "Hotel" = null) {
    const req = new RequestEntity();
    req.Method = `TmcApiOrderUrl-Travel-List`;
    if (type) {
      req.Data["Type"] = type;
    }
    return this.apiService.getPromiseData<TravelModel>(req);
  }
  async getCountries(forceUpdate = false) {
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Agent-Country";
    let local = await this.storage.get(req.Method);
    if (
      (local && !forceUpdate) ||
      (local && AppHelper.getTimestamp() - local.lastUpdateTime >= 12 * 3600)
    ) {
      return local.countries as CountryEntity[];
    }
    req.Data = {
      lastUpdateTime: (local && local.lastUpdateTime) || 0,
    };
    req.IsShowLoading = true;
    const countries = await this.apiService
      .getPromiseData<{ Countries: CountryEntity[] }>(req)
      .then((r) => r.Countries)
      .catch((_) => [] as CountryEntity[]);
    countries.sort((c1, c2) => +c1.Sequence - +c2.Sequence);
    // console.log("countries", countries);
    if (local) {
      local.countries = [...countries, ...local.countries];
    } else {
      local = {
        lastUpdateTime: AppHelper.getTimestamp(),
        countries,
      };
    }
    await this.storage.set(req.Method, local);
    return local.countries as CountryEntity[];
  }
  async getChannel() {
    const identity: IdentityEntity =
      await this.identityService.getIdentityAsync();
    let tag: "??????" | "??????" = "??????";
    if (identity) {
      if (identity.Numbers.AgentId) {
        tag = "??????";
      } else {
        tag = "??????";
      }
    }
    let channel = `H5`;
    if (AppHelper.isApp()) {
      if (this.platform.is("android")) {
        channel = "android";
      }
      if (this.platform.is("ios")) {
        channel = "ios";
      }
    } else {
      if (AppHelper.isWechatH5()) {
        channel = "WechatH5";
      }
      if (AppHelper.isDingtalkH5()) {
        channel = "DingtalkH5";
      }
      if (AppHelper.isWechatMini()) {
        channel = "WechatMini";
      }
    }
    return `${tag}${channel}`;
  }
  async payOrder(tradeNo: string, key = "", giveup = false): Promise<boolean> {
    if (giveup) {
      return Promise.resolve(false);
    }
    let payResult = false;
    const payWay = await this.payService.selectPayWay();
    console.log("payway", payWay);
    if (!payWay) {
      return payResult;
    } else {
      if (payWay.value == "ali") {
        payResult = await this.aliPay(tradeNo, key);
      }
      if (payWay.value == "wechat") {
        payResult = await this.wechatPay(tradeNo, key);
      }
    }
    return payResult;
  }
  async checkHasHotelBookRight() {
    return this.hasBookRight("hotel");
  }
  private async wechatPay(
    tradeNo: string,
    key: string = "",
    method: string = "TmcApiOrderUrl-Pay-Create"
  ) {
    let res = false;
    const req = new RequestEntity();
    req.Method = method;
    req.Version = "2.0";
    req.Data = {
      Channel: "App",
      Type: "3",
      OrderId: tradeNo,
      IsApp: AppHelper.isApp(),
    };
    if (key) {
      req.Data["Key"] = key;
    }
    const r = await this.payService.wechatpay(req, "").catch((_) => {
      AppHelper.alert(_);
    });
    if (r) {
      const req1 = new RequestEntity();
      req1.Method = "TmcApiOrderUrl-Pay-Process";
      req1.Version = "2.0";
      req1.Data = {
        OutTradeNo: r,
        Type: "3",
      };
      const result = await this.payService.process(req1).catch((_) => {
        AppHelper.alert(_);
      });
      if (result) {
        // AppHelper.alert("????????????");
        res = true;
      } else {
        // AppHelper.alert("????????????????????????");
        res = false;
      }
    } else {
      // AppHelper.alert("??????????????????");
      res = false;
    }
    return res;
  }
  private async aliPay(
    tradeNo: string,
    key: string = "",
    method: string = "TmcApiOrderUrl-Pay-Create"
  ) {
    let res = false;
    const req = new RequestEntity();
    req.Method = method;
    req.Version = "2.0";
    req.Data = {
      Channel: "App",
      Type: "2",
      IsApp: AppHelper.isApp(),
      OrderId: tradeNo,
    };
    if (key) {
      req.Data["Key"] = key;
    }
    const r = await this.payService.alipay(req, "").catch((e) => {
      AppHelper.alert(e);
    });
    if (r) {
      const req1 = new RequestEntity();
      req1.Method = "TmcApiOrderUrl-Pay-Process";
      req1.Version = "2.0";
      req1.Data = {
        OutTradeNo: tradeNo,
        Type: "2",
      };
      const result = await this.payService.process(req1).catch((_) => {
        AppHelper.alert(_);
      });
      if (result) {
        res = true;
        // AppHelper.alert("????????????");
      } else {
        res = false;
        // AppHelper.alert("????????????????????????");
      }
    } else {
      // AppHelper.alert("?????????????????????");
      res = false;
    }
    return res;
  }
  getSelectedCompanySource() {
    return this.selectedCompanySource.asObservable();
  }
  setSelectedCompanySource(company: string) {
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
      body: content,
    };
    req.Method = "TmcApiOrderUrl-Order-SendEmail";
    return this.apiService.getPromiseData<{
      Status: boolean;
      Id: string;
      Message: string;
    }>(req);
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
      body: content,
    };
    req.Method = "TmcApiOrderUrl-Order-SendSms";
    return this.apiService.getPromiseData<{
      Status: boolean;
      Id: string;
      Message: string;
    }>(req);
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
      .catch((_) => [] as SelectItem[]);
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
      .catch((_) => [] as SelectItem[]);
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
      lang,
    };
    req.Method = "TmcApiOrderUrl-Flight-GetFlightEmail";
    const result = await this.apiService
      .getPromiseData<{ ToEmails: string[]; Body: string; Subject: string }>(
        req
      )
      .catch((_) => ({ ToEmails: [], Body: "", Subject: "" }));
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
      lang,
    };
    return this.apiService
      .getPromiseData<{ ToMobiles: string[]; Body: string }>(req)
      .catch((_) => ({ ToMobiles: [], Body: "" }));
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
      .catch((_) => []);
    return this.companies;
  }
  async searchPassengerCredentials(accountId: string) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiHomeUrl-Credentials-List";
    req.Data = {
      accountId,
    };
    return this.apiService
      .getPromiseData<{ Credentials: MemberCredential[] }>(req)
      .then((r) => r.Credentials)
      .catch((_) => []);
  }
  async getTravelUrls(
    data: {
      staffNumber: string;
      staffOutNumber: string;
      name: string;
    }[],
    travelType: IGetTravelUrlTravelType,
    isShowLoading: boolean = false
  ): Promise<{
    [staffNumber: string]: ITravelUrlResult;
  }> {
    const result: {
      [staffNumber: string]: ITravelUrlResult;
    } = {} as any;
    const all: Promise<{ key: string; value: ITravelUrlResult }>[] = [];
    if (data && data.length) {
      for (const arg of data) {
        const res = this.getTravelUrl(arg, travelType, isShowLoading).catch(
          (_) => {
            return {
              key: arg.staffNumber,
              value: {
                Data: null,
                Message: _.Message || _.message || _,
              } as ITravelUrlResult,
            };
          }
        );
        all.push(res);
      }
    }
    const arr = await Promise.all(all);
    arr.forEach((res) => {
      if (!result[res.key]) {
        result[res.key] = res.value;
      }
    });
    return result;
  }
  private getTravelUrl(
    data: {
      staffNumber: string;
      staffOutNumber: string;
      name: string;
    },
    travelType: string,
    isShowLoading = false
  ): Promise<{
    key: string;
    value: ITravelUrlResult;
  }> {
    const req = new RequestEntity();
    req.IsShowLoading = isShowLoading;
    req.Method = "TmcApiBookUrl-Home-GetTravelUrl";
    req.Data = { ...data, travelType };
    return this.apiService.getPromiseData<{
      key: string;
      value: ITravelUrlResult;
    }>(req);
  }
  async searchLinkman(
    name: string
  ): Promise<{ Text: string; Value: string }[]> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Home-SearchLinkman";
    req.Data = {
      name,
    };
    return this.apiService.getPromiseData<[]>(req);
  }
  async searchApprovalsAsync(
    name: string
  ): Promise<{ Text: string; Value: string }[]> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Home-SearchApprovals";
    req.Data = {
      name,
    };
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService
      .getPromiseData<{ Text: string; Value: string }[]>(req)
      .catch((_) => []);
  }

  searchApprovals(name: string, pageIndex: number, pageSize = 20) {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Home-SearchApprovals";
    req.Data = {
      name,
      PageSize: pageSize,
      PageIndex: pageIndex,
    };
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService.getResponse<{ Text: string; Value: string }[]>(req);
  }
  async getAllLocalAirports(forceFetch = false) {
    if (!forceFetch && this.allLocalAirports && this.allLocalAirports.length) {
      return Promise.resolve(this.allLocalAirports);
    }
    if (forceFetch) {
      this.apiService.showLoadingView({ msg: "????????????????????????..." });
    }
    const h = await this.getDomesticAirports(forceFetch);
    const i = await this.getInternationalAirports(forceFetch);
    this.apiService.hideLoadingView();
    this.allLocalAirports = [...h, ...i];
    this.allLocalAirports = this.allLocalAirports.map((a) => {
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
    const pyFl = `${getFullChars(name)}`.charAt(0);
    return pyFl && pyFl.toUpperCase();
  }
  async getDomesticAirports(forceFetch: boolean = false) {
    const req = new RequestEntity();
    req.Method = `ApiHomeUrl-Resource-Airport`;
    // ???????????????????????????????????????
    forceFetch = forceFetch || !this.isReloadDomesticAirports;
    if (this.loadDomesticAirportsPromise) {
      return this.loadDomesticAirportsPromise;
    }
    this.loadDomesticAirportsPromise = new Promise(async (rsv) => {
      if (!this.localDomesticAirports) {
        this.localDomesticAirports =
          (await this.storage.get(KEY_HOME_AIRPORTS)) ||
          ({
            LastUpdateTime: 0,
            Trafficlines: [],
          } as LocalStorageAirport);
      }
      if (
        !forceFetch &&
        this.localDomesticAirports &&
        this.localDomesticAirports.Trafficlines &&
        this.localDomesticAirports.Trafficlines.length
      ) {
        rsv(this.localDomesticAirports.Trafficlines);
        return this.localDomesticAirports.Trafficlines;
      }
      req.Data = {
        LastUpdateTime: this.localDomesticAirports.LastUpdateTime,
      };
      this.isReloadDomesticAirports = true;
      const r = await this.apiService
        .getPromiseData<{
          HotelCities: any[];
          Trafficlines: TrafficlineEntity[];
        }>(req)
        .catch(
          () =>
            ({
              Trafficlines: [],
            } as {
              HotelCities: any[];
              Trafficlines: TrafficlineEntity[];
            })
        );
      const local = this.localDomesticAirports;
      if (r.Trafficlines && r.Trafficlines.length) {
        const airports = [
          ...this.localDomesticAirports.Trafficlines.filter(
            (item) => !r.Trafficlines.some((i) => i.Id == item.Id)
          ),
          ...r.Trafficlines,
        ];
        this.localDomesticAirports.LastUpdateTime = AppHelper.getTimestamp();
        local.Trafficlines = this.localDomesticAirports.Trafficlines = airports;
        await this.storage.set(KEY_HOME_AIRPORTS, this.localDomesticAirports);
      }
      rsv(local.Trafficlines);
    });
    this.loadDomesticAirportsPromise.finally(() => {
      this.loadDomesticAirportsPromise = null;
    });
    return this.loadDomesticAirportsPromise;
  }
  async getInternationalAirports(forceFetch: boolean = false) {
    const req = new RequestEntity();
    req.Method = `ApiHomeUrl-Resource-InternationalAirport`;
    forceFetch = forceFetch || !this.isReloadInterAirports;
    if (this.loadInterAirportsPromise) {
      return this.loadInterAirportsPromise;
    }
    this.loadInterAirportsPromise = new Promise(async (rsv) => {
      if (!this.localInternationAirports) {
        this.localInternationAirports =
          (await this.storage.get(KEY_INTERNATIONAL_AIRPORTS)) ||
          ({
            LastUpdateTime: 0,
            Trafficlines: [],
          } as LocalStorageAirport);
      }
      if (!forceFetch && this.localInternationAirports.Trafficlines.length) {
        rsv(this.localInternationAirports.Trafficlines);
        return this.localInternationAirports.Trafficlines;
      }
      req.Data = {
        LastUpdateTime: this.localInternationAirports.LastUpdateTime,
      };
      let st = window.performance.now();
      req.IsShowLoading = true;
      req.LoadingMsg = "????????????????????????";
      this.isReloadInterAirports = true;
      const r = await this.apiService
        .getPromiseData<{
          HotelCities: any[];
          Trafficlines: TrafficlineEntity[];
        }>(req)
        .catch((_) => ({ Trafficlines: [] as TrafficlineEntity[] }));
      const local = this.localInternationAirports;
      if (r.Trafficlines && r.Trafficlines.length) {
        const airports = [
          ...this.localInternationAirports.Trafficlines.filter(
            (item) => !r.Trafficlines.some((i) => i.Id == item.Id)
          ),
          ...r.Trafficlines,
        ];
        local.Trafficlines = airports;
        this.localInternationAirports.LastUpdateTime = AppHelper.getTimestamp();
        this.localInternationAirports.Trafficlines = local.Trafficlines;
        st = window.performance.now();
        this.storage
          .set(KEY_INTERNATIONAL_AIRPORTS, this.localInternationAirports)
          .then((_) => {
            console.log(
              `??????????????????????????????${window.performance.now() - st} ms`
            );
          });
      }
      rsv(local.Trafficlines);
    });
    this.loadInterAirportsPromise.finally(() => {
      this.loadInterAirportsPromise = null;
    });
    return this.loadInterAirportsPromise;
  }
  async checkPay(orderId: string, isshowLoading = true): Promise<boolean> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Home-CheckPay";
    req.Data = {
      OrderId: orderId,
    };
    req.IsShowLoading = isshowLoading;
    req.Timeout = 60;
    return this.apiService
      .getPromiseData<boolean>(req)
      .then((_) => true)
      .catch((_) => false);
  }

  async getPassengerCredentials(
    accountIds: string[],
    isShowLoading = false
  ): Promise<{ [accountId: string]: CredentialsEntity[] }> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Home-Credentials";
    req.Data = {
      AccountIds: accountIds.join(";"),
    };
    req.IsShowLoading = isShowLoading;
    req.Timeout = 60;
    return this.apiService.getPromiseData<{
      [accountId: string]: CredentialsEntity[];
    }>(req);
  }
  async getAgent(forceFetch = false): Promise<AgentEntity> {
    if (this.agent && !forceFetch) {
      return Promise.resolve(this.agent);
    }
    if (this.loadAgentDataPromise) {
      return this.loadAgentDataPromise;
    }
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiHomeUrl-Agent-Agent";
    this.loadAgentDataPromise = this.apiService
      .getPromiseData<{ Agent: AgentEntity }>(req)
      .then((r) => {
        if (r && r.Agent) {
          this.agent = {
            ...r.Agent,
            LogoFileName: r.Agent.LogoUrl || `assets/images/Logodm.png`,
            LogoFullFileName: r.Agent.LogoUrl || `assets/images/Logodm.png`,
          };
          this.configService.getConfigAsync().then((c) => {
            if (c && this.agent.LogoUrl) {
              (c.LogoImageUrl = this.agent.LogoUrl),
                (c.PrerenderImageUrl = AppHelper.getDefaultLoadingImage());
            }
          });
          return this.agent;
        }
        return r.Agent;
      })
      .finally(() => {
        this.loadAgentDataPromise = null;
      });
    return this.loadAgentDataPromise;
  }
  checkShouldAndHasSelectTmc() {
    if (this.identity && this.identity.Numbers && this.identity.Numbers.AgentId)
      return (
        this.identity &&
        this.identity.Numbers &&
        this.identity.Numbers.AgentId &&
        this.identity.Numbers.TmcId &&
        this.identity.Numbers.TmcId != "0"
      );
    return true;
  }
  async getTmc(forceFetch = false): Promise<TmcEntity> {
    if ((this.tmc && !forceFetch) || !this.checkShouldAndHasSelectTmc()) {
      return Promise.resolve(this.tmc);
    }
    if (this.fetchingTmcPromise) {
      return this.fetchingTmcPromise;
    }
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiHomeUrl-Tmc-GetTmc";
    this.fetchingTmcPromise = this.apiService
      .getPromiseData<TmcEntity>(req)
      .then((tmc) => {
        this.tmc = tmc;
        return tmc;
      })
      .finally(() => {
        this.fetchingTmcPromise = null;
      });
    return this.fetchingTmcPromise;
  }
  async getTmcData(): Promise<TmcDataEntity> {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiHomeUrl-Tmc-GetTmcData";
    return this.apiService.getPromiseData<TmcDataEntity>(req).catch((_) => {
      AppHelper.alert(_);
      return null;
    });
  }
  async checkIfHasCostCenter() {
    const arr = await this.getCostCenter("").catch(() => []);
    return arr.length > 0;
  }
  async checkIfHasOrganizations() {
    const arr = await this.getOrganizations().catch(() => []);
    return arr.length > 0;
  }
  async getCostCenter(
    name: string
  ): Promise<{ Text: string; Value: string }[]> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Home-GetCostCenter";
    req.Data = {
      name,
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
      .catch((_) => []);
  }
}
export interface ITravelUrlResult {
  Data: TravelUrlInfo[];
  Message: string;
}
export interface TravelUrlInfo {
  OrganizationCode: string;
  OrganizationName: string;
  Trips: string[]; // ????????????: 07-26 ??? 07-26 ?????? ??? ??????"
  CostCenterCode: string; // "???????????????"
  CostCenterName: string; // "???????????????"
  Detail: string; // null
  ExpiryTime: string; // "2020-04-30 12:00:00"
  LastUpdateTime: string; // "2020-04-24 03:45:33"
  StaffNumber: string; // "8888"
  Status: string; // "?????????"
  StatusType: string; // 3
  Subject: string; // "??????????????????"
  TravelInfo: string; // null
  TravelNumber: string; // "630000000122"
  Type: string; // null
  checked: boolean;
}
export interface IBookOrderResult {
  TradeNo: string;
  HasTasks: boolean;
  Message: string;
  IsCheckPay: boolean;
}

export class TravelFormEntity extends BaseVariablesEntity {
  Tmc: TmcEntity;
  /// <summary>
  ///
  /// </summary>
  Account: AccountEntity;
  /// <summary>
  /// ?????????
  /// </summary>
  StaffNumber: string;
  /// <summary>
  /// ???????????????
  /// </summary>
  TravelNumber: string;
  /// <summary>
  /// ???????????? ?????? ?????? ??????
  /// </summary>
  TravelType: string;
  /// <summary>
  /// ????????????
  /// </summary>
  Subject: string;
  /// </summary>
  Detail: string;
  /// <summary>
  /// ????????????
  /// </summary>
  CostCenterCode: string;
  Organization: OrganizationEntity;
  /// <summary>
  /// ????????????
  /// </summary>
  CostCenterName: string;
  CustomerName: string;
  Trips: TravelFormTripEntity[];
  /// <summary>
  /// ?????????
  /// </summary>
  ExpiryTime: string;
  /// <summary>
  /// ??????????????????
  /// </summary>
  SyncTime: string;
  /// <summary>
  /// ????????????
  /// </summary>
  Status: number;

  NoRoute: boolean;
  // ???????????????
  /// <summary>
  /// ????????????
  /// </summary>
  FromAirportCity: string;
  /// <summary>
  /// ????????????
  /// </summary>
  ToAirportCity: string;

  ToCityCode: string;
  ToCityName: string;
  /// <summary>
  /// ??????????????????
  /// </summary>
  FromAirportCityName: string;
  /// <summary>
  /// ??????????????????
  /// </summary>
  ToAirportCityName: string;
  /// <summary>
  /// ??????????????????
  /// </summary>
  TakeoffStartTime: string;
  /// <summary>
  /// ??????????????????
  /// </summary>
  TakeoffEndTime: string;
  // ??????????????????
  /// <summary>
  /// ????????????
  /// </summary>
  FromStationCity: string;
  /// <summary>
  /// ????????????
  /// </summary>
  ToStationCity: string;
  /// <summary>
  /// ??????????????????
  /// </summary>
  FromStationCityName: string;
  /// <summary>
  /// ??????????????????
  /// </summary>
  ToStationCityName: string;
  /// <summary>
  /// ??????????????????
  /// </summary>
  StartTime: string;
  /// <summary>
  /// ??????????????????
  /// </summary>
  EndTime: string;

  //  ??????
  /// <summary>
  /// ????????????
  /// </summary>
  City: string;
  /// <summary>
  /// ????????????
  /// </summary>
  CityName: string;
  /// <summary>
  /// ??????????????????
  /// </summary>
  CheckInTime: string;
  /// <summary>
  /// ??????????????????
  /// </summary>
  CheckOutTime: string;

  // TravelInfo
  /// <summary>
  /// ????????????
  /// </summary>
  Flights: TravelInfoFlightEntity[];

  /// <summary>
  /// ????????????
  /// </summary>
  Trains: TravelInfoTrainEntity[];

  /// <summary>
  /// ??????
  /// </summary>
  Hotels: TravelInfoHotelEntity[];

  /// <summary>
  /// ????????????
  /// </summary>
  Numbers: TravelInfoNumberEntity[];
  ApplyTime: string;
  Applicant: string;
  ApprovalName: string;
  ApprovalId: string;
  applyTimeDate: string;
  applyTimeTime: string;
  StatusTypeName: string;
  StatusType: ApprovalStatusType;
  ApprovalTime: string;
  approvalTimeDate: string;
  startDate: string;
  CompanyName: string;
  DayCount: number;
  ProjectId: string;
  IsOverdue: boolean;
  OrganizationId: string;
}
export class TravelInfoFlightEntity {
  /// <summary>
  /// ????????????
  /// yyyy-MM-dd HH:mm
  /// </summary>
  TakeoffStartTime: string;
  /// <summary>
  /// ????????????
  /// yyyy-MM-dd HH:mm
  /// </summary>
  TakeoffEndTime: string;
  /// <summary>
  /// ????????????
  /// ????????????????????????
  /// </summary>
  FromAirportCity: string;
  /// <summary>
  /// ??????????????????
  /// </summary>
  FromAirportCityName: string;
  /// <summary>
  /// ????????????
  /// ????????????????????????
  /// </summary>
  ToAirportCity: string;
  /// <summary>
  /// ??????????????????
  /// </summary>
  ToAirportCityName: string;
}
export class TravelInfoTrainEntity {
  /// <summary>
  /// ????????????
  /// yyyy-MM-dd HH:mm
  /// </summary>
  StartTime: string;
  /// <summary>
  /// ????????????
  /// yyyy-MM-dd HH:mm
  /// </summary>
  EndTime: string;
  /// <summary>
  /// ????????????????????????
  /// </summary>
  FromStationCity: string;
  /// <summary>
  /// ????????????
  /// </summary>
  FromStationCityName: string;
  /// <summary>
  /// ????????????
  /// ????????????????????????
  /// </summary>
  ToStationCity: string;
  /// <summary>
  /// ??????????????????
  /// </summary>
  ToStationCityName: string;
}
export class TravelInfoHotelEntity {
  /// <summary>
  /// ????????????
  /// yyyy-MM-dd HH:mm
  /// </summary>
  CheckInTime: string;
  /// <summary>
  /// ????????????
  /// yyyy-MM-dd HH:mm
  /// </summary>
  CheckOutTime: string;
  /// <summary>
  /// ??????????????????
  /// </summary>
  City: string;
  /// <summary>
  /// ????????????
  /// </summary>
  CityName: string;
}
export class TravelInfoNumberEntity {
  Name: string;
  Code: string;
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
  /// ???????????????
  /// </summary>
  TicketRatio = 1,
  /// <summary>
  /// ???????????????
  /// </summary>
  TicketFix = 2,
  /// <summary>
  /// ??????????????????
  /// </summary>
  SegmentRatio = 3,
  /// <summary>
  /// ??????????????????
  /// </summary>
  SegmentFix = 4,
}
export enum TmcTrainFeeType {
  /// <summary>
  /// ???????????????
  /// </summary>
  TicketRatio = 1,
  /// <summary>
  /// ???????????????
  /// </summary>
  TicketFix = 2,
}
export class IllegalReasonEntity {
  /// <summary>
  /// TMC??????
  /// </summary>
  Tmc: TmcEntity;
  /// <summary>
  /// ??????
  /// </summary>
  Tag: string;
  /// <summary>
  /// ????????????
  /// </summary>
  Name: string;
  /// <summary>
  /// ?????????
  /// </summary>
  Sequence: number;
  /// <summary>
  /// ????????????
  /// </summary>
  DataEntity: IllegalReasonEntity;
}
export enum TmcApprovalType {
  /// <summary>
  /// ?????????
  /// </summary>
  None = 1,
  /// <summary>
  /// ????????????
  /// </summary>
  Free = 2,
  /// <summary>
  /// ???????????????
  /// </summary>
  Approver = 3,
  /// <summary>
  /// ??????????????????
  /// </summary>
  ExceedPolicyFree = 4,
  /// <summary>
  /// ??????????????????
  /// </summary>
  ExceedPolicyApprover = 5,
}
export enum TmcApprovalExpiredType {
  /// ?????????
  /// </summary>
  None = 1,
  /// <summary>
  /// ??????
  /// </summary>
  Passed = 2,
  /// <summary>
  /// ??????
  /// </summary>
  Rejected = 3,
  /// <summary>
  /// ??????
  /// </summary>
  Closed = 4,
}
export interface GroupCompanyEntity extends BaseEntity {
  Code: string;
  Name: string;
  Agent: any;
}
export enum TmcHotelFeeType {
  /// <summary>
  /// ?????????
  /// </summary>
  Night = 1,
  /// <summary>
  /// ??????
  /// </summary>
  Order = 2,
}
export class TmcEntity extends BaseEntity {
  TravelApprovalContent: string;
  TravelApprovalType: TmcTravelApprovalType;
  GroupCompanyName: string; // "????????????";
  Name: string; // "????????????????????????????????????????????????";
  /// <summary>
  /// ?????????????????????????????????
  /// </summary>
  IsAllowCustomReason: boolean;
  IsNeedIllegalReason: boolean;
  // ===================== ???????????????????????? start ===========
  /// <summary>
  /// ???????????????
  /// </summary>
  CheckTravelUrl: string;
  HotelSelfPayAmount: string;

  /// <summary>
  /// ???????????????????????????
  /// </summary>
  GetTravelNumberUrl: string;
  /// <summary>
  /// ??????????????????
  /// </summary>
  HrUrl: string;
  /// <summary>
  /// ?????????????????????
  /// </summary>
  TravelUrl: string;
  /// <summary>
  /// ????????????
  /// </summary>
  NotifyUrl: string;
  // =================== ???????????????????????? end =============
  OutNumberNameArray: string[];
  OutNumberRequiryNameArray: string[];
  /// <summary>
  /// ????????????
  /// </summary>
  OutNumberName: string;
  /// <summary>
  /// ????????????
  /// </summary>
  OutNumberRequiryName: string;
  Agent: AgentEntity;
  GroupCompany: GroupCompanyEntity;
  Account: AccountEntity;
  IsUsed: boolean;
  MandatoryBuyInsurance: boolean;
  TrainMandatoryBuyInsurance: boolean;
  IsUsedName: string;
  Code: string;
  FlightApprovalType: TmcApprovalType;
  FlightPayType: OrderTravelPayType;
  IntFlightPayType: OrderTravelPayType;
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
  // ==== ??????????????? start =====
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
  TrainIsBindNumber: boolean;
  // ==== ??????????????? end =======
  // ============= ???????????? start ========
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
  // ============= ???????????? end ========

  // ===== ?????? start======
  InsuranceHoldMinute: number;
  // ===== ?????? end========

  // ?????????????????? start ===
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
  // ?????????????????? end =====

  // =============== ????????????????????? start =========
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
  // =============== ????????????????????? end   =========

  // =============== ?????????????????? start   =========
  HotelBookNoticeType: string;
  HotelBookFailureNoticeType: string;
  HotelCancelNoticeType: string;
  HotelCancelFailureNoticeType: string;

  // =============== ?????????????????? end     =========
  // =============== ???????????????????????? start   =========
  // ????????????
  InternationalHotelPayType: OrderTravelPayType;
  // ????????????
  InternationalHotelApprovalType: TmcApprovalType;
  InternationalHotelApprovalExpiredType: TmcApprovalExpiredType;
  /// ??????????????????
  InternationalHotelOrderPayType: string;
  // ?????????
  InternationalHotelPrepayOnlineFee: string;
  InternationalHotelSelfPayOnlineFee: string;
  InternationalHotelSettleOnlineFee: string;
  InternationalHotelPrepayOfflineFee: string;
  InternationalHotelSelfPayOfflineFee: string;
  InternationalHotelSettleOfflineFee: string;
  InternationalHotelAgreementSettleApiFee: string;
  InternationalHotelFeeType: TmcHotelFeeType;

  // ===============???????????????????????? end     =========

  // =============== ?????????????????? start     =========
  InsuranceBookNoticeType: string;
  InsuranceBookFailureNoticeType: string;
  InsuranceCancelNoticeType: string;
  InsuranceCancelFailureNoticeType: string;
  // =============== ?????????????????? end       =========

  // =============== ???????????? start =========
  TaskRejectNoticeType: string;
  TaskPassNoticeType: string;
  // =============== ???????????? end   =========

  // =============== ?????????????????? start ======
  WechatAppId: string;
  WechatAppSecret: string;
  WechatSecretId: string;
  WechatMchId: string;
  WechatMiniId: string;
  WechatMiniSecret: string;
  RegionTypeValue: string;
  RegionTypeName: string;
  IntFlightApprovalType: TmcApprovalType;
  RegionType: any;
  // =============== ?????????????????? end ======
}
export class ExchangeInfo {
  order: OrderEntity;
  ticket: OrderTrainTicketEntity | OrderFlightTicketEntity;
  trip: OrderFlightTripEntity | OrderTrainTripEntity;
  insurnanceAmount?: number;
  isRangeExchange?: boolean;
  rangeExchangeDateTip?: string;
}
export interface PassengerBookInfo<T> {
  passenger: StaffEntity;
  credential: CredentialsEntity;
  isNotWhitelist?: boolean;
  bookInfo?: T;
  id?: string;
  isReselect?: boolean; // ????????????
  isFilterPolicy?: boolean; // ??????????????????
  // isFilteredPolicy?: boolean;// ??????????????????
  // isAllowBookPolicy?: boolean;// ???????????????
  exchangeInfo?: ExchangeInfo;
}

export interface PassengerBookInfoGp {
  passenger?: StaffEntity;
  credential?: CredentialsEntity;
  id?: string;
  Seg?: number;
  flightSegment?: FlightSegmentEntity;
  Cabin?: FlightCabinEntity;
  exchangeInfo?: ExchangeInfo;
}

export class InitialBookDtoModel {
  ServiceFees: { [clientId: string]: string };
  Insurances: { [clientId: string]: InsuranceProductEntity[] };
  TravelFrom: TravelFormEntity;
  AccountNumber12306: {
    IsIdentity?: boolean;
    Tag?: string;
    Account?: AccountEntity;
    NumberEntity?: any;
    Variables?: any;
    Number: string;
    Name: string;
  };
  Tmc: TmcEntity;
  PayTypes: any;
  IllegalReasons: string[];
  OutNumbers: { [key: string]: string[] };
  ExpenseTypes: { Name: string; Tag: string }[];
  RoomPlans: {
    ClientId: string;
    PassengerClientId: string;
    GuaranteeStartTime: string;
    GuaranteeEndTime: string;
  }[];
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
export type IGetTravelUrlTravelType = "Flight" | "Hotel" | "Train";
