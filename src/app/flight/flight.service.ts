import { IdentityEntity } from "./../services/identity/identity.entity";
import { CredentialsEntity } from "./../tmc/models/CredentialsEntity";
import { TmcService } from "src/app/tmc/tmc.service";
import { ModalController, NavController } from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
import { FlightCabinEntity } from "./models/flight/FlightCabinEntity";
import { FilterConditionModel } from "./models/flight/advanced-search-cond/FilterConditionModel";
import { IdentityService } from "./../services/identity/identity.service";
import { StaffService, StaffEntity, StaffBookType } from "../hr/staff.service";
import { Injectable } from "@angular/core";

import { environment } from "../../environments/environment";
import { Subject, BehaviorSubject, from, Observable, of } from "rxjs";

import * as moment from "moment";
import { ApiService } from "../services/api/api.service";
import { FlightJourneyEntity } from "./models/flight/FlightJourneyEntity";
import { FlightSegmentEntity } from "./models/flight/FlightSegmentEntity";
import { RequestEntity } from "../services/api/Request.entity";
import { Storage } from "@ionic/storage";
import { LanguageHelper } from "../languageHelper";
import { Router } from "@angular/router";
export const KEY_HOME_AIRPORTS = `ApiHomeUrl-Resource-Airport`;
export const KEY_INTERNATIONAL_AIRPORTS = `ApiHomeUrl-Resource-InternationalAirport`;
export interface PassengerFlightSegmentInfo {
  flightSegment: FlightSegmentEntity;
  flightPolicy: FlightPolicy;
  tripType?: TripType;
  id?: string;
  reselectId?: string;
  isLowerSegmentSelected?: boolean;
}
export enum TripType {
  departureTrip = "departureTrip",
  returnTrip = "returnTrip"
}
export interface PassengerPolicyFlights {
  PassengerKey: string; // accountId
  FlightPolicies: FlightPolicy[];
}

export interface PassengerBookInfo {
  passenger: StaffEntity;
  credential: CredentialsEntity;
  isNotWhitelist?: boolean;
  flightSegmentInfo?: PassengerFlightSegmentInfo;
  id?: string;
  isReselect?: boolean;
}
export interface FlightSegmentModel {
  AirlineName; // String 航空公司名称
  Number; // String 航班号
  TakeoffTime; // Datetime 起飞时间
  FlyTime; // Int 飞行时间（分钟）
  LowestFare; // Decimal 最低价
  LowestCabinCode; // String 最低价舱位
  LowestDiscount; // Decimal 最低价折扣
  IsStop: boolean; // Bool 是否经停
}
export interface FlightPolicy {
  Cabin: FlightCabinEntity; // 记录原始的cabin
  FlightNo: string; // String Yes 航班号
  CabinCode: string; // string Yes 舱位代码
  IsAllowBook: boolean; // Bool Yes 是否可预订
  Discount: string; // Decimal Yes 折扣率
  LowerSegment: FlightSegmentModel;
  Rules: string[]; // List<string> No 违反的差标信息
}
export class SearchFlightModel {
  BackDate: string; //  Yes 航班日期（yyyy-MM-dd）
  Date: string; //  Yes 航班日期（yyyy-MM-dd）
  FromCode: string; //  Yes 三字代码
  ToCode: string; //  Yes 三字代码
  FromAsAirport: boolean; //  No 始发以机场查询
  ToAsAirport: boolean; //  No 到达以机场查询
  IsRoundTrip?: boolean; // 是否是往返
  fromCity: Trafficline;
  toCity: Trafficline;
  tripType: TripType;
  isLocked?: boolean;
}
// export enum CheckSelfSelectedInfoType {
//   AddOne = "AddOne",
//   ReselectDepartureTrip = "ReselectDepartureTrip",
//   ReselectReturnTrip = "ReselectReturnTrip",
//   SelectReturnTrip = "selectReturnTrip",
//   CannotBookMoreFlightSegment = "CannotBookMoreFlightSegment"
// }
export interface Trafficline {
  Id: string; // long
  Tag: string; // 标签（Airport 机场，AirportCity 机场城市，Train 火车站）
  Code: string; // 代码（三字码）
  Name: string; // 名称
  Nickname: string; // 简称
  Pinyin: string; // 拼音
  Initial: string; // 拼音简写
  AirportCityCode: string; // 机场城市代码（航空系统特有）
  CityCode: string; // 城市代码
  CityName: string; // 城市名称
  Description: string; // 描述
  IsHot: boolean; // 热点描述
  CountryCode: string; // 国籍代码
  Sequence: string; // Int 排序号
  EnglishName: string; // 英文名称
  Selected?: boolean;
}
export interface CurrentViewtFlightSegment {
  flightSegment: FlightSegmentEntity;
  flightSegments: FlightSegmentEntity[];
  totalPolicyFlights: PassengerPolicyFlights[];
}
interface LocalStorageAirport {
  LastUpdateTime: number;
  Trafficlines: Trafficline[];
}
const debugCacheTime = 5 * 60 * 1000;
@Injectable({
  providedIn: "root"
})
export class FlightService {
  private worker = null;

  private searchFlightModelSource: Subject<SearchFlightModel>;
  private passengerBookInfoSource: Subject<PassengerBookInfo[]>;
  private searchFlightModel: SearchFlightModel;
  private filterPanelShowHideSource: Subject<boolean>;
  private openCloseSelectCitySources: Subject<boolean>;
  private filterCondSources: Subject<FilterConditionModel>;
  private localInternationAirports: LocalStorageAirport;
  private localDomesticAirports: LocalStorageAirport;
  private selectedCitySource: Subject<Trafficline>;
  private allLocalAirports: Trafficline[];
  private passengerBookInfos: PassengerBookInfo[]; // 记录乘客及其研究选择的航班
  currentViewtFlightSegment: CurrentViewtFlightSegment;

  constructor(
    private apiService: ApiService,
    private staffService: StaffService,
    private storage: Storage,
    private modalCtrl: ModalController,
    private router: Router,
    private navCtrl: NavController,
    private identityService: IdentityService,
    private tmcService: TmcService
  ) {
    this.searchFlightModel = new SearchFlightModel();
    this.searchFlightModel.tripType = TripType.departureTrip;
    this.selectedCitySource = new BehaviorSubject(null);
    this.searchFlightModelSource = new BehaviorSubject(null);
    this.passengerBookInfos = [];
    this.passengerBookInfoSource = new BehaviorSubject(this.passengerBookInfos);
    this.filterPanelShowHideSource = new BehaviorSubject(false);
    this.openCloseSelectCitySources = new BehaviorSubject(false);
    this.filterCondSources = new BehaviorSubject(null);
    this.worker = window["Worker"] ? new Worker("assets/worker.js") : null;
    identityService.getIdentity().subscribe(res => {
      if (!res || !res.Ticket) {
        this.disposal();
      }
    });
  }
  disposal() {
    this.setSearchFlightModel(new SearchFlightModel());
    this.removeAllPassengerFlightSegments();
    this.selectedCitySource.next(null);
    this.openCloseSelectCitySources.next(false);
    this.setSelectedCity(null);
    this.currentViewtFlightSegment = null;
  }

  getCurrentViewtFlightSegment() {
    return this.currentViewtFlightSegment;
  }
  setSearchFlightModel(m: SearchFlightModel) {
    if (m) {
      this.searchFlightModel = { ...m };
      if (m.IsRoundTrip) {
        const arr = this.getPassengerBookInfos();
        if (m.tripType == TripType.returnTrip) {
          if (!arr.find(item => item.isReselect)) {
            this.searchFlightModel.isLocked = true;
          }
        } else {
          this.searchFlightModel.isLocked = false;
        }
        this.searchFlightModel.isLocked = arr.length === 2;
      } else {
        this.searchFlightModel.isLocked = false;
      }
      this.searchFlightModelSource.next(this.searchFlightModel);
    }
  }
  getSearchFlightModel() {
    return { ...(this.searchFlightModel || new SearchFlightModel()) };
  }
  getSearchFlightModelSource() {
    return this.searchFlightModelSource.asObservable();
  }
  setCurrentViewtFlightSegment(
    s: FlightSegmentEntity,
    fs: FlightSegmentEntity[],
    policyFlights: PassengerPolicyFlights[]
  ) {
    this.currentViewtFlightSegment = {
      flightSegment: s,
      flightSegments: fs,
      totalPolicyFlights: policyFlights
    };
  }
  private setPassengerBookInfos(args: PassengerBookInfo[]) {
    this.passengerBookInfos = args || [];
    this.passengerBookInfoSource.next(this.passengerBookInfos);
  }
  // private setPassengerBookInfoSource(args: PassengerBookInfo[]) {
  //   this.passengerBookInfoSource.next(args);
  // }
  getPassengerBookInfoSource() {
    return this.passengerBookInfoSource.asObservable();
  }

  getPassengerBookInfos() {
    this.passengerBookInfos = this.passengerBookInfos || [];
    return this.passengerBookInfos;
  }
  async canBookReturnTripFlightSegment(flightSegment: FlightSegmentEntity) {
    if (
      !flightSegment ||
      this.searchFlightModel.tripType !== TripType.returnTrip
    ) {
      return true;
    }
    const staff = await this.staffService.getStaff();
    if (staff.BookType == StaffBookType.Self) {
      if (this.searchFlightModel.IsRoundTrip) {
        const infos = this.getPassengerBookInfos().filter(
          item =>
            item.passenger.AccountId == staff.AccountId &&
            item.flightSegmentInfo
        );
        if (infos) {
          const info = infos.find(
            item =>
              item.flightSegmentInfo &&
              item.flightSegmentInfo.flightSegment &&
              item.flightSegmentInfo.tripType == TripType.departureTrip
          );
          const goFlight = info.flightSegmentInfo.flightSegment;
          if (goFlight) {
            const takeoffTime = moment(flightSegment.TakeoffTime);
            const arrivalTime = moment(goFlight.ArrivalTime);
            return (
              takeoffTime.date() == arrivalTime.date() ||
              +arrivalTime >= +takeoffTime
            );
          }
        }
      } else {
        return !this.checkIfExcessMaxLimitedBookTickets(1);
      }
    } else {
      return !this.checkIfExcessMaxLimitedBookTickets(9);
    }
    return true;
  }
  async canBookMoreFlightSegment(flightSegment: FlightSegmentEntity) {
    if (!flightSegment) {
      return true;
    }
    const staff = await this.staffService.getStaff();
    if (staff && staff.BookType == StaffBookType.Self) {
      if (this.getSearchFlightModel().IsRoundTrip) {
        const arr = this.getPassengerBookInfos().filter(
          item =>
            item.passenger.AccountId == staff.AccountId &&
            item.flightSegmentInfo &&
            item.flightSegmentInfo.flightPolicy
        );
        if (arr.length == 2) {
          const g = arr.find(
            item => item.flightSegmentInfo.tripType == TripType.departureTrip
          );
          const b = arr.find(
            item => item.flightSegmentInfo.tripType == TripType.returnTrip
          );
          const hasReselect = arr.find(item => item.isReselect);
          if (g && b) {
            return hasReselect;
          } else {
            return false;
          }
        }
        return false;
      } else {
        return !this.checkIfExcessMaxLimitedBookTickets(1);
      }
    } else {
      return !this.checkIfExcessMaxLimitedBookTickets(9);
    }
  }
  private checkIfExcessMaxLimitedBookTickets(max: number) {
    return (
      this.getPassengerBookInfos().reduce((sum, item) => {
        if (!item.isReselect) {
          if (
            item.flightSegmentInfo &&
            (item.flightSegmentInfo.flightPolicy ||
              item.flightSegmentInfo.flightSegment)
          ) {
            sum++;
          }
        }
        return sum;
      }, 0) >= max
    );
  }
  async selectTripType(): Promise<TripType> {
    const ok = await AppHelper.alert(
      LanguageHelper.Flight.getTripTypeTip(),
      true,
      LanguageHelper.getDepartureTip(),
      LanguageHelper.getReturnTripTip()
    );
    return ok ? TripType.departureTrip : TripType.returnTrip;
  }
  addPassengerBookInfo(arg: PassengerBookInfo): Promise<string> {
    console.log("addPassengerFlightSegments", arg);
    if (!arg || !arg.passenger) {
      AppHelper.alert(LanguageHelper.Flight.getSelectedFlightInvalideTip());
      return;
    }
    const infos = this.getPassengerBookInfos();
    arg.id = AppHelper.uuid();
    infos.push(arg);
    this.setPassengerBookInfos(infos);
  }

  private async reselectSelfBookTypeSegment(arg: PassengerBookInfo) {
    const s = this.getSearchFlightModel();
    if (arg.flightSegmentInfo.tripType == TripType.returnTrip) {
      // 重选回程
      const exists = this.getPassengerBookInfos();
      const citites = await this.getAllLocalAirports();
      const goInfo = exists.find(
        item => item.flightSegmentInfo.tripType == TripType.departureTrip
      );
      const goFlight = goInfo && goInfo.flightSegmentInfo.flightSegment;
      if (goFlight) {
        const fromCode = goFlight.FromAirport;
        const toCode = goFlight.ToAirport;
        const toCity = citites.find(c => c.Code == toCode);
        const fromCity = citites.find(c => c.Code == fromCode);
        const arrivalDate = moment(goFlight.ArrivalTime).format("YYYY-MM-DD");
        if (+moment(s.BackDate) < +moment(arrivalDate)) {
          s.BackDate = arrivalDate;
        }
        s.FromCode = toCode;
        s.fromCity = toCity;
        s.Date = s.BackDate;
        s.toCity = fromCity;
        s.ToCode = fromCode;
        s.tripType = TripType.returnTrip;
      }
      const arr = this.getPassengerBookInfos().map(item => {
        item.isReselect = item.id == arg.id;
        item.flightSegmentInfo.reselectId =
          item.id == arg.id ? item.flightSegmentInfo.id : null;
        return item;
      });
      this.passengerBookInfos = arr;
    } else {
      // 重选去程
      s.tripType = TripType.departureTrip;
      this.passengerBookInfos = [];
    }
    this.setPassengerBookInfos(this.getPassengerBookInfos());
    this.apiService.showLoadingView();
    await this.dismissAllTopOverlays();
    this.apiService.hideLoadingView();
    if (s.tripType == TripType.returnTrip) {
      if (!this.router.routerState.snapshot.url.includes("flight-list")) {
        this.navCtrl.back();
      }
      this.router.navigate([AppHelper.getRoutePath("flight-list")]).then(_ => {
        this.setSearchFlightModel(s);
      });
    } else {
      this.router
        .navigate([AppHelper.getRoutePath("search-flight")])
        .then(_ => {
          this.setSearchFlightModel(s);
        });
    }
  }
  private async reselectNotSelfBookTypeSegments(arg: PassengerBookInfo) {
    const s = this.getSearchFlightModel();
    s.tripType = TripType.departureTrip;
    const arr = this.getPassengerBookInfos().map(item => {
      item.isReselect = item.id == arg.id;
      item.flightSegmentInfo.reselectId =
        item.id == arg.id ? item.flightSegmentInfo.id : null;
      return item;
    });
    this.passengerBookInfos = arr;
    this.setPassengerBookInfos(this.getPassengerBookInfos());
    this.apiService.showLoadingView();
    await this.dismissAllTopOverlays();
    this.apiService.hideLoadingView();
    this.router.navigate([AppHelper.getRoutePath("search-flight")]).then(_ => {
      this.setSearchFlightModel(s);
    });
  }
  async reselectPassengerFlightSegments(arg: PassengerBookInfo) {
    console.log("reselectPassengerFlightSegments", arg);
    if (!arg || !arg.flightSegmentInfo) {
      return false;
    }
    if (await this.staffService.isStaffTypeSelf()) {
      await this.reselectSelfBookTypeSegment(arg);
    } else {
      await this.reselectNotSelfBookTypeSegments(arg);
    }
    console.log("getPassengerBookInfos", this.getPassengerBookInfos());
  }
  async addOrReselecteInfos(flightCabin: FlightCabinEntity) {
    const bookInfos = this.getPassengerBookInfos();
    let unselectSegments = bookInfos.filter(
      p =>
        !p.flightSegmentInfo ||
        !p.flightSegmentInfo.flightSegment ||
        !p.flightSegmentInfo.flightPolicy
    );
    let selfUnselects = [];
    const s = this.getSearchFlightModel();
    if (await this.staffService.isStaffTypeSelf()) {
      const staff = await this.staffService.getStaff();
      const infos = bookInfos.filter(
        item =>
          item.passenger.AccountId == staff.AccountId &&
          item.flightSegmentInfo &&
          item.flightSegmentInfo.flightPolicy
      );
      if (infos.length) {
        // 已经选择了来回程，但不是重选
        if (infos.length == 2 && !infos.find(item => !!item.isReselect)) {
          const go = infos.find(
            item => item.flightSegmentInfo.tripType == TripType.departureTrip
          );
          const back = infos.find(
            item => item.flightSegmentInfo.tripType == TripType.returnTrip
          );
          if (go && back) {
            const ok = await AppHelper.alert(
              LanguageHelper.Flight.getIsReselectReturnTripTip(),
              true,
              LanguageHelper.getConfirmTip(),
              LanguageHelper.getCancelTip()
            );
            if (ok) {
              this.passengerBookInfos = [go];
              this.setPassengerBookInfos(this.passengerBookInfos);
            } else {
            }
          }
        }
      }
      if (s.IsRoundTrip && s.tripType == TripType.returnTrip) {
        if (unselectSegments.length == 0) {
          selfUnselects = this.getPassengerBookInfos();
        }
      }
    }
    unselectSegments = [...unselectSegments, ...selfUnselects];
    for (let i = 0; i < unselectSegments.length; i++) {
      const p = unselectSegments[i];
      const passengerPolicies = this.currentViewtFlightSegment.totalPolicyFlights.find(
        itm =>
          itm.PassengerKey == p.passenger.AccountId ||
          p.passenger.isNotWhiteList
      );
      if (passengerPolicies) {
        const cabin = passengerPolicies.FlightPolicies.find(
          item =>
            item.CabinCode == flightCabin.Code &&
            item.FlightNo == flightCabin.FlightNumber
        );
        if (cabin) {
          cabin.Cabin =
            cabin.Cabin ||
            this.currentViewtFlightSegment.flightSegment.Cabins.find(
              c => c.Code == cabin.CabinCode
            );
          if (await this.staffService.isStaffTypeSelf()) {
            if (!this.getPassengerBookInfos().find(item => item.isReselect)) {
              p.flightSegmentInfo = {
                flightSegment: this.currentViewtFlightSegment.flightSegment,
                flightPolicy: cabin,
                tripType: this.getSearchFlightModel().IsRoundTrip
                  ? this.getSearchFlightModel().tripType
                  : TripType.departureTrip,
                id: AppHelper.uuid(),
                reselectId: null
              };
            }
          } else {
            p.flightSegmentInfo = {
              flightSegment: this.currentViewtFlightSegment.flightSegment,
              flightPolicy: cabin,
              tripType: this.getSearchFlightModel().IsRoundTrip
                ? this.getSearchFlightModel().tripType
                : TripType.departureTrip,
              id: AppHelper.uuid(),
              reselectId: null
            };
          }
        }
      }
    }
    this.reselecteInfo(bookInfos, flightCabin);
    const arr = bookInfos.map(item => {
      item.isReselect = false;
      if (item.flightSegmentInfo) {
        item.flightSegmentInfo.reselectId = null;
      }
      return item;
    });
    this.setPassengerBookInfos(arr);
  }
  private reselecteInfo(bookInfos: PassengerBookInfo[], flightCabin: FlightCabinEntity) {
    const one = bookInfos.find(item => item.isReselect);
    if (one) {
      const oldBookInfo = bookInfos.find(item => !!item.flightSegmentInfo.reselectId);
      const onePolicies = this.currentViewtFlightSegment.totalPolicyFlights.find(item => item.PassengerKey == one.passenger.AccountId ||
        one.passenger.isNotWhiteList);
      const cabin = onePolicies &&
        onePolicies.FlightPolicies.find(c => c.FlightNo == this.currentViewtFlightSegment.flightSegment.Number &&
          c.CabinCode == flightCabin.Code);
      if (cabin) {
        cabin.Cabin = this.currentViewtFlightSegment.flightSegment.Cabins.find(c => c.Code == cabin.CabinCode);
        if (oldBookInfo) {
          const flightSegmentInfo: PassengerFlightSegmentInfo = {
            id: AppHelper.uuid(),
            tripType: this.getSearchFlightModel().IsRoundTrip
              ? this.getSearchFlightModel().tripType
              : TripType.departureTrip,
            flightSegment: this.currentViewtFlightSegment.flightSegment,
            flightPolicy: cabin,
            reselectId: null
          };
          const newInfo: PassengerBookInfo = {
            id: AppHelper.uuid(),
            passenger: oldBookInfo.passenger,
            credential: oldBookInfo.credential,
            isNotWhitelist: oldBookInfo.isNotWhitelist,
            flightSegmentInfo
          };
          this.replacePassengerBookInfo(oldBookInfo, newInfo);
        }
      }
    }
  }

  private async dismissAllTopOverlays() {
    console.time("dismissAllTopOverlays");
    let top = await this.modalCtrl.getTop();
    let i = 10;
    while (top && --i > 0) {
      // console.log("onSelectReturnTrip", top);
      await top.dismiss().catch(_ => {});
      top = await this.modalCtrl.getTop();
    }
    console.timeEnd("dismissAllTopOverlays");
    return true;
  }
  removeAllPassengerFlightSegments() {
    this.passengerBookInfos = [];
    this.setPassengerBookInfos(this.getPassengerBookInfos());
  }
  replacePassengerBookInfo(old: PassengerBookInfo, newInfo: PassengerBookInfo) {
    if (!old || !newInfo) {
      return;
    }
    let arr = this.getPassengerBookInfos();
    arr = arr.map(item => {
      if (item.id == old.id) {
        item = newInfo;
      }
      return item;
    });
    this.passengerBookInfos = arr;
    this.setPassengerBookInfos(this.passengerBookInfos);
  }
  removePassengerFlightSegmentInfo(arg: PassengerFlightSegmentInfo) {
    let arr = this.getPassengerBookInfos();
    arr = arr.filter(info => info.id != arg.id);
    this.passengerBookInfos = arr;
    this.setPassengerBookInfos(arr);
  }
  removePassengerBookInfo(arg: PassengerBookInfo) {
    this.passengerBookInfos = this.getPassengerBookInfos().filter(
      item => item.id != arg.id
    );
    this.setPassengerBookInfos(this.passengerBookInfos);
  }
  getSelectedCity() {
    return this.selectedCitySource.asObservable();
  }
  setSelectedCity(_selectedCity: Trafficline) {
    this.selectedCitySource.next({ ..._selectedCity });
  }
  getOpenCloseSelectCityPageSources() {
    return this.openCloseSelectCitySources.asObservable();
  }
  setOpenCloseSelectCityPageSources(open: boolean) {
    this.openCloseSelectCitySources.next(open);
  }
  setFilterCondition(advSCond: FilterConditionModel) {
    this.filterCondSources.next(advSCond);
  }
  getFilterCondition() {
    return this.filterCondSources.asObservable();
  }
  setFilterPanelShow(show: boolean) {
    this.filterPanelShowHideSource.next(show);
  }
  getFilterPanelShow() {
    return this.filterPanelShowHideSource.asObservable();
  }
  async getDomesticAirports(forceFetch: boolean = false) {
    // return this.getInternationalAirports(forceFetch);
    const req = new RequestEntity();
    // req.IsForward = true;
    req.Method = `ApiHomeUrl-Resource-Airport`;
    if (!this.localDomesticAirports) {
      this.localDomesticAirports =
        (await this.storage.get(KEY_HOME_AIRPORTS)) ||
        ({
          LastUpdateTime: 0,
          Trafficlines: []
        } as LocalStorageAirport);
    }
    if (!forceFetch && this.localDomesticAirports.Trafficlines.length) {
      return this.localDomesticAirports.Trafficlines;
    }
    req.Data = {
      LastUpdateTime: this.localDomesticAirports.LastUpdateTime
    };
    const r = await this.apiService.getPromiseData<{
      HotelCities: any[];
      Trafficlines: Trafficline[];
    }>(req);
    const airports = [
      ...this.localDomesticAirports.Trafficlines.filter(
        item => !r.Trafficlines.some(i => i.Id == item.Id)
      ),
      ...r.Trafficlines
    ];
    this.localDomesticAirports.LastUpdateTime = Math.floor(Date.now() / 1000);
    this.localDomesticAirports.Trafficlines = airports;
    await this.storage.set(KEY_HOME_AIRPORTS, this.localDomesticAirports);
    return airports;
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
      return this.localInternationAirports.Trafficlines;
    }
    req.Data = {
      LastUpdateTime: this.localInternationAirports.LastUpdateTime
    };
    let st = window.performance.now();
    const r = await this.apiService.getPromiseData<{
      HotelCities: any[];
      Trafficlines: Trafficline[];
    }>(req);
    const airports = [
      ...this.localInternationAirports.Trafficlines.filter(
        item => !r.Trafficlines.some(i => i.Id == item.Id)
      ),
      ...r.Trafficlines
    ];
    this.localInternationAirports.LastUpdateTime = Math.floor(
      Date.now() / 1000
    );
    this.localInternationAirports.Trafficlines = airports;
    st = window.performance.now();
    await this.storage.set(
      KEY_INTERNATIONAL_AIRPORTS,
      this.localInternationAirports
    );
    console.log(`本地化国际机票耗时：${window.performance.now() - st} ms`);
    return airports;
  }

  async getPolicyflightsAsync(
    Flights: FlightJourneyEntity[],
    Passengers: string[]
  ): Promise<
    {
      PassengerKey: string;
      FlightPolicies: FlightPolicy[];
    }[]
  > {
    let local;
    if (!environment.production) {
      local = await this.storage.get("TestTmcData.TmcApiFlightUrl-Home-Policy");
      if (local) {
        console.log(
          "policyflights local",
          local,
          `缓存是否过期 ${Date.now() - local.lastUpdateTime >= debugCacheTime}`
        );
      }
    }
    if (
      !environment.production &&
      local &&
      local.FlightPolicy &&
      local.FlightPolicy.length &&
      Date.now() - local.lastUpdateTime <= debugCacheTime &&
      local.toCode == (Flights && Flights[0] && Flights[0].ToCity) &&
      local.fromCode == (Flights && Flights[0] && Flights[0].FromCity) &&
      local.date == (Flights && Flights[0] && Flights[0].Date)
    ) {
      // console.log(new Array(10).fill(0).map(_=>TestTmcData.FlightData));
      return local.FlightPolicy;
    }
    console.log(`重新获取航班数据`);
    const req = new RequestEntity();
    req.Method = `TmcApiFlightUrl-Home-Policy`;
    req.Version = "1.0";
    req.Data = {
      Flights: JSON.stringify(Flights),
      Passengers: Passengers.join(",")
    };
    req.IsShowLoading = true;
    req.Timeout = 60;
    const res = await this.apiService
      .getPromiseData<
        {
          PassengerKey: string;
          FlightPolicies: FlightPolicy[];
        }[]
      >(req)
      .catch(_ => {
        AppHelper.alert(_);
        return [];
      });
    if (res.length && !environment.production) {
      await this.storage.set("TestTmcData.TmcApiFlightUrl-Home-Policy", {
        lastUpdateTime: Date.now(),
        FlightPolicy: res,
        fromCode: Flights && Flights[0] && Flights[0].FromCity,
        toCode: Flights && Flights[0] && Flights[0].ToCity
      });
    }
    return res;
  }
  async sortByPrice(segments: FlightSegmentEntity[], l2h: boolean) {
    if (true || !this.worker) {
      return segments.sort((s1, s2) => {
        let sub = +s1.LowestFare - +s2.LowestFare;
        sub = sub === 0 ? 0 : sub > 0 ? 1 : -1;
        return l2h ? sub : -sub;
      });
    }
    return new Promise<FlightSegmentEntity[]>(s => {
      this.worker.postMessage({ message: "sortByPrice", segments, l2h });
      this.worker.onmessage = evt => {
        // console.log("evt", evt);
        if (evt && evt.data && evt.data.message == "sortByPrice") {
          s(evt.data.segments);
        }
      };
    });
  }
  async sortByTime(segments: FlightSegmentEntity[], l2h: boolean) {
    if (true || !this.worker) {
      return segments.sort((s1, s2) => {
        let sub = +s1.TakeoffTimeStamp - +s2.TakeoffTimeStamp;
        sub = sub === 0 ? 0 : sub > 0 ? 1 : -1;
        return l2h ? sub : -sub;
      });
    }

    return new Promise<FlightSegmentEntity[]>(s => {
      this.worker.postMessage({ message: "sortByTime", segments, l2h });
      this.worker.onmessage = evt => {
        // console.log("evt", evt);
        if (evt && evt.data && evt.data.message == "sortByTime") {
          s(evt.data.segments);
        }
      };
    });
  }
  private replaceStr<T>(template: string, item: T) {
    const arr = template.match(/@\S+@/gi);
    const keys = (arr || []).map(itm =>
      itm.replace(/@Name=/g, "").replace(/@/g, "")
    );
    if (keys.length === 0) {
      return template;
    }
    keys.map(k => {
      const p = new RegExp(k, "g");
      template = template.replace(p, item[k]);
    });
  }
  async getHtmlTemplate<T>(array: T[], template: string) {
    if (!this.worker) {
      return array.map(s => {
        return { item: s, templateHtmlString: this.replaceStr(template, s) };
      });
    }
    return new Promise<{ item: T; templateHtmlString: string }[]>(s => {
      this.worker.postMessage({
        message: "getHtmlTemplate",
        array,
        template
      });
      this.worker.onmessage = evt => {
        if (evt && evt.data && evt.data.message == "getHtmlTemplate") {
          s(evt.data.data);
        }
      };
    });
  }
  private addoneday(s: FlightSegmentEntity) {
    // const addDay =
    //   moment(s.ArrivalTime, "YYYY-MM-DDTHH:mm:ss").date() -
    //   moment(s.TakeoffTime, "YYYY-MM-DDTHH:mm:ss").date();
    // console.log(addDay);
    const addDay =
      new Date(s.ArrivalTime).getDate() - new Date(s.TakeoffTime).getDate();
    return addDay > 0 ? "+" + addDay + LanguageHelper.getDayTip() : "";
  }
  getTotalFlySegments(flyJourneys: FlightJourneyEntity[]) {
    console.time("getTotalFlySegments");
    const result = flyJourneys.reduce(
      (arr, journey) => {
        arr = [
          ...arr,
          ...journey.FlightRoutes.reduce(
            (segs, route) => {
              segs = [
                ...segs,
                ...route.FlightSegments.map(s => {
                  s.TrackById = segs.length;
                  s.TakeoffTimeStamp = new Date(s.TakeoffTime).getTime();
                  s.ArrivalTimeStamp = new Date(s.ArrivalTime).getTime();
                  s.TakeoffShortTime = this.getHHmm(s.TakeoffTime);
                  s.ArrivalShortTime = this.getHHmm(s.ArrivalTime);
                  s.AddOneDayTip = this.addoneday(s);
                  const fromCity =
                    this.allLocalAirports &&
                    this.allLocalAirports.length &&
                    this.allLocalAirports.find(c => c.Code == journey.FromCity);
                  if (fromCity) {
                    s.FromCity = fromCity;
                    s.FromCityName = fromCity.CityName;
                  }
                  const toCity =
                    this.allLocalAirports &&
                    this.allLocalAirports.length &&
                    this.allLocalAirports.find(c => c.Code == journey.ToCity);
                  if (toCity) {
                    s.ToCity = toCity;
                    s.FromCityName = fromCity.CityName;
                  }
                  return s;
                })
              ];
              return segs;
            },
            [] as FlightSegmentEntity[]
          )
        ];
        return arr;
      },
      [] as FlightSegmentEntity[]
    );
    console.timeEnd("getTotalFlySegments");
    return result;
  }
  private getHHmm(datetime: string) {
    if (datetime && datetime.includes("T")) {
      const remain = datetime.split("T")[1];
      if (remain) {
        const hhmmss = remain.split(":");
        hhmmss.pop();
        return hhmmss.join(":");
      }
    }
    return datetime;
  }
  async getFlightJourneyDetailListAsync(
    data: SearchFlightModel
  ): Promise<FlightJourneyEntity[]> {
    let local;
    if (!environment.production) {
      local = await this.storage.get("TestTmcData.FlightData");
      if (local) {
        console.log(
          "getFlightJourneyDetailList local",
          local,
          `缓存是否过期 ${Date.now() - local.lastUpdateTime >= debugCacheTime}`
        );
      }
    }
    if (
      !environment.production &&
      local &&
      local.serverFlights &&
      local.serverFlights.length &&
      local.toCode == data.ToCode &&
      local.fromCode == data.FromCode &&
      Date.now() - local.lastUpdateTime <= debugCacheTime &&
      local.date == data.Date
    ) {
      // console.log(new Array(10).fill(0).map(_=>TestTmcData.FlightData));
      return local.serverFlights;
    }
    const req = new RequestEntity();
    req.Method = "TmcApiFlightUrl-Home-Detail ";
    req.Data = {
      Date: data.Date, //  Yes 航班日期（yyyy-MM-dd）
      FromCode: data.FromCode, //  Yes 三字代码
      ToCode: data.ToCode, //  Yes 三字代码
      FromAsAirport: data.FromAsAirport, //  No 始发以机场查询
      ToAsAirport: data.ToAsAirport //  No 到达以机场查询
    };
    req.Version = "1.0";
    req.IsShowLoading = true;
    req.Timeout = 60;
    const serverFlights = await this.apiService
      .getPromiseData<FlightJourneyEntity[]>(req)
      .catch(_ => {
        AppHelper.alert(_);
        return [] as FlightJourneyEntity[];
      });
    if (serverFlights.length && !environment.production) {
      await this.storage.set("TestTmcData.FlightData", {
        serverFlights,
        lastUpdateTime: Date.now(),
        date: data.Date,
        fromCode: data.FromCode,
        toCode: data.ToCode
      });
    }
    return serverFlights;
  }
  async getLocalHomeAirports(): Promise<Trafficline[]> {
    if (
      this.localDomesticAirports &&
      this.localDomesticAirports.Trafficlines.length
    ) {
      return Promise.resolve(this.localDomesticAirports.Trafficlines);
    }
    return (
      (await this.storage.get(KEY_HOME_AIRPORTS)) ||
      ({
        LastUpdateTime: 0,
        Trafficlines: []
      } as LocalStorageAirport)
    ).Trafficlines;
  }
  async getLocalInternationalAirports(): Promise<Trafficline[]> {
    if (
      this.localInternationAirports &&
      this.localInternationAirports.Trafficlines.length
    ) {
      return Promise.resolve(this.localInternationAirports.Trafficlines);
    }
    return (
      (await this.storage.get(KEY_INTERNATIONAL_AIRPORTS)) ||
      ({
        LastUpdateTime: 0,
        Trafficlines: []
      } as LocalStorageAirport)
    ).Trafficlines;
  }
  async getAllLocalAirports() {
    if (this.allLocalAirports && this.allLocalAirports.length) {
      return Promise.resolve(this.allLocalAirports);
    }
    this.apiService.showLoadingView();
    const h = await this.getDomesticAirports();
    const i = [] || (await this.getInternationalAirports());
    this.apiService.hideLoadingView();
    return (this.allLocalAirports = [...h, ...i]);
  }
  getCredentialStaffs(AccountIds: string[]): Promise<StaffEntity[]> {
    return this.tmcService.getCredentialStaffs(AccountIds);
  }
  async getPassengerCredentials(
    accountIds: string[]
  ): Promise<{ [accountId: string]: CredentialsEntity[] }> {
    return this.tmcService.getPassengerCredentials(accountIds);
  }
}
