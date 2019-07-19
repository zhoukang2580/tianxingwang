import { ModalController, NavController } from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
import { FlightCabinEntity } from "./models/flight/FlightCabinEntity";
import { StaffBookType } from "./../tmc/models/StaffBookType";
import { FilterConditionModel } from "./models/flight/advanced-search-cond/FilterConditionModel";
import { IdentityService } from "./../services/identity/identity.service";
import { StaffService, StaffEntity } from "../hr/staff.service";
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
import { map, switchMap, catchError } from "rxjs/operators";
import { Router } from "@angular/router";
import { MemberCredential } from "../member/member.service";

export const KEY_HOME_AIRPORTS = `ApiHomeUrl-Resource-Airport`;
export const KEY_INTERNATIONAL_AIRPORTS = `ApiHomeUrl-Resource-InternationalAirport`;
export interface PassengerFlightSelectedInfo {
  flightSegment: FlightSegmentEntity;
  flightPolicy: FlightPolicy;
  tripType?: TripType;
  Id?: string;
  resetId?: string;
  selectedLowerSegment?: boolean;
}
export enum TripType {
  departureTrip = "departureTrip",
  returnTrip = "returnTrip"
}
export interface PassengerPolicyFlights {
  PassengerKey: string; // accountId
  FlightPolicies: FlightPolicy[];
}

export interface PassengerFlightSegments {
  passenger: StaffEntity;
  credential: MemberCredential;
  selectedInfo: PassengerFlightSelectedInfo[];
  Id?: string;
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
}
export enum CheckSelfSelectedInfoType {
  AddOne = "AddOne",
  ReselectDepartureTrip = "ReselectDepartureTrip",
  ReselectReturnTrip = "ReselectReturnTrip",
  SelectReturnTrip = "selectReturnTrip",
  CannotBookMoreFlightSegment = "CannotBookMoreFlightSegment"
}
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

  private selectedPassengers: StaffEntity[] = [];
  private searchFlightModelSource: Subject<SearchFlightModel>;
  private passengerFlightSegmentSource: Subject<PassengerFlightSegments[]>;
  private searchFlightModel: SearchFlightModel;
  private filterPanelShowHideSource: Subject<boolean>;
  private selectedPassengerSource: Subject<StaffEntity[]>;
  private openCloseSelectCitySources: Subject<boolean>;
  private filterCondSources: Subject<FilterConditionModel>;
  private localInternationAirports: LocalStorageAirport;
  private localDomesticAirports: LocalStorageAirport;
  private selectedCitySource: Subject<Trafficline>;
  private passengerFlightSegments: PassengerFlightSegments[]; // 记录乘客及其研究选择的航班
  currentViewtFlightSegment: CurrentViewtFlightSegment;

  constructor(
    private apiService: ApiService,
    private staffService: StaffService,
    private storage: Storage,
    private modalCtrl: ModalController,
    private router: Router,
    private navCtrl: NavController,
    private identityService: IdentityService
  ) {
    this.searchFlightModel = new SearchFlightModel();
    this.searchFlightModel.tripType = TripType.departureTrip;
    this.selectedCitySource = new BehaviorSubject(null);
    this.selectedPassengerSource = new BehaviorSubject([]);
    this.searchFlightModelSource = new BehaviorSubject(null);
    this.passengerFlightSegments = [];
    this.passengerFlightSegmentSource = new BehaviorSubject(
      this.passengerFlightSegments
    );
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
    this.clearAllSelectedPassengers();
    this.selectedCitySource.next(null);
    this.openCloseSelectCitySources.next(false);
    this.setSelectedCity(null);
    this.currentViewtFlightSegment = null;
  }
  addSelectedPassengers(p: StaffEntity) {
    if (p) {
      p.TempId = AppHelper.uuid();
      this.selectedPassengers.push(p);
      this.selectedPassengerSource.next(this.selectedPassengers);
    }
  }
  getSelectedPasengers() {
    this.selectedPassengers = this.selectedPassengers || [];
    return this.selectedPassengers;
  }
  getSelectedPasengerSource() {
    return this.selectedPassengerSource.asObservable();
  }
  clearAllSelectedPassengers() {
    this.selectedPassengers = [];
    this.selectedPassengerSource.next(this.getSelectedPasengers());
  }
  removeSelectedPassenger(p: StaffEntity) {
    if (p) {
      this.selectedPassengers = this.selectedPassengers.filter(
        item => item.TempId != p.TempId
      );
      this.selectedPassengerSource.next(this.getSelectedPasengers());
    }
  }
  getCurrentViewtFlightSegment() {
    return this.currentViewtFlightSegment;
  }
  setSearchFlightModel(m: SearchFlightModel) {
    this.searchFlightModel = m;
    this.searchFlightModelSource.next(m);
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
  private setPassengerFlightSegmentSource(args: PassengerFlightSegments[]) {
    this.passengerFlightSegmentSource.next(args);
  }
  getPassengerFlightSegmentSource() {
    return this.passengerFlightSegmentSource.asObservable();
  }

  getPassengerFlightSegments() {
    this.passengerFlightSegments = this.passengerFlightSegments || [];
    return this.passengerFlightSegments;
  }
  async validateReturnTripDate(backDate: string) {
    if (!backDate || this.searchFlightModel.tripType !== TripType.returnTrip) {
      return true;
    }
    const staff = await this.staffService.getStaff();
    if (
      staff.BookType == StaffBookType.Self &&
      this.searchFlightModel.IsRoundTrip
    ) {
      const info = this.getPassengerFlightSegments().find(
        item => item.passenger.AccountId == staff.AccountId
      );
      if (info) {
        const goFlight = info.selectedInfo.find(
          item => item.tripType == TripType.departureTrip
        );
        if (goFlight) {
          if (
            +moment(backDate) <=
            +moment(goFlight.flightSegment.ArrivalTime).add(3, "hours")
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }
  async validateCanBookReturnTripFlightSegment(
    flightSegment: FlightSegmentEntity
  ) {
    if (
      !flightSegment ||
      this.searchFlightModel.tripType !== TripType.returnTrip
    ) {
      return true;
    }
    const staff = await this.staffService.getStaff();
    if (staff.BookType == StaffBookType.Self) {
      if (this.searchFlightModel.IsRoundTrip) {
        const info = this.getPassengerFlightSegments().find(
          item => item.passenger.AccountId == staff.AccountId
        );
        if (info) {
          const goFlight = info.selectedInfo.find(
            item => item.tripType == TripType.departureTrip
          );
          if (goFlight) {
            if (
              +moment(flightSegment.TakeoffTime) <=
              +moment(goFlight.flightSegment.ArrivalTime).add(3, "hours")
            ) {
              return false;
            }
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
  async validateCanBookMoreFlightSegment(flightSegment: FlightSegmentEntity) {
    if (!flightSegment) {
      return true;
    }
    const staff = await this.staffService.getStaff();
    if (staff && staff.BookType == StaffBookType.Self) {
      return !this.checkIfExcessMaxLimitedBookTickets(
        this.getSearchFlightModel().IsRoundTrip ? 2 : 1
      );
    } else {
      return !this.checkIfExcessMaxLimitedBookTickets(9);
    }
  }
  private checkIfExcessMaxLimitedBookTickets(max: number) {
    return (
      this.getPassengerFlightSegments().reduce((arr, item) => {
        if (!item.isReselect) {
          arr += item.selectedInfo.length;
        }
        return arr;
      }, 0) >= max
    );
  }
  private async validateReturnTripBackDate(arg: PassengerFlightSegments) {
    if (
      !arg ||
      !arg.selectedInfo ||
      ((arg.selectedInfo.length && arg.selectedInfo[0].tripType) ||
        !this.searchFlightModel ||
        this.searchFlightModel.tripType) != TripType.returnTrip
    ) {
      return true;
    }
    const staff = await this.staffService.getStaff();
    if (staff && staff.BookType == StaffBookType.Self) {
      const info = this.getPassengerFlightSegments().find(
        item => item.passenger.AccountId == staff.AccountId
      );
      if (info) {
        const goFlight = info.selectedInfo.find(
          item => item.tripType == TripType.departureTrip
        );
        if (goFlight) {
          if (
            +moment(arg.selectedInfo[0].flightSegment.TakeoffTime) <=
            +moment(goFlight.flightSegment.ArrivalTime).add(3, "hours")
          ) {
            return false;
          }
        }
      }
    }
    return true;
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
  async addPassengerFlightSegments(
    arg: PassengerFlightSegments
  ): Promise<string> {
    console.log("addPassengerFlightSegments", arg);
    let result = "";
    const s = (await this.staffService.getStaff()) || ({} as any);
    const identity = await this.identityService.getIdentityAsync();
    if (!arg || !arg.passenger || !arg.selectedInfo) {
      await AppHelper.alert(
        LanguageHelper.Flight.getSelectedFlightInvalideTip()
      );
    }
    const validation = await this.validateReturnTripBackDate(arg);
    if (!validation) {
      await AppHelper.alert(
        LanguageHelper.Flight.getBackDateCannotBeforeGoDateTip(),
        true,
        LanguageHelper.getConfirmTip()
      );
      return (result = LanguageHelper.Flight.getBackDateCannotBeforeGoDateTip());
    }
    if (s.BookType === StaffBookType.Self) {
      result = await this.bookTypeSelfAddPassengerFlightSegments(arg);
      const cur = this.getPassengerFlightSegments().find(
        item => item.passenger.AccountId == s.AccountId
      );
      if (
        cur &&
        (cur.selectedInfo.length >= 2 || cur.selectedInfo.length == 0)
      ) {
        this.searchFlightModel.tripType = TripType.departureTrip;
        this.setSearchFlightModel(this.searchFlightModel);
      }
    }
    if (s.BookType === StaffBookType.All) {
      result = await this.bookTypeAllAddPassengerFlightSegments(arg);
    }
    if (s.BookType === StaffBookType.Secretary) {
      result = await this.bookTypeSecretaryAddPassengerFlightSegments(arg);
    }
    if (
      !s.BookType &&
      identity &&
      identity.Numbers &&
      identity.Numbers.AgentId
    ) {
      result = await this.agentAddPassengerFlightSegments(arg);
    }
    this.setPassengerFlightSegmentSource(this.getPassengerFlightSegments());
    return result;
  }
  private async agentAddPassengerFlightSegments(arg: PassengerFlightSegments) {
    const excess = await this.checkIfExcessMaxLimitedBookTickets(9);
    if (excess) {
      await AppHelper.alert(
        LanguageHelper.Flight.getCannotBookMoreFlightSegmentTip(),
        true,
        LanguageHelper.getConfirmTip()
      );
    }
    arg.Id = AppHelper.uuid();
    this.passengerFlightSegments.push(arg);
    return "";
  }
  private async reselectSelfBookTypeSegment(
    passenger: StaffEntity,
    arg: PassengerFlightSelectedInfo
  ) {
    const s = this.getSearchFlightModel();
    if (arg.tripType == TripType.returnTrip) {
      // 重选回程
      const exists = this.getPassengerFlightSegments();
      const citites = await this.getAllLocalAirports();
      const one = exists.find(
        item =>
          !!item.selectedInfo.find(
            itm => itm.tripType == TripType.departureTrip
          )
      );
      const info =
        one &&
        one.selectedInfo &&
        one.selectedInfo.length &&
        one.selectedInfo.find(item => item.tripType == TripType.departureTrip);
      const goFlight = info && info.flightSegment;
      if (goFlight) {
        const fromCode = goFlight.FromAirport;
        const toCode = goFlight.ToAirport;
        const toCity = citites.find(c => c.Code == toCode);
        const fromCity = citites.find(c => c.Code == fromCode);
        const arrivalDate = moment(goFlight.ArrivalTime)
          .add(3, "hours")
          .format("YYYY-MM-DD");
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
      const arr = this.getPassengerFlightSegments().map(item => {
        item.isReselect = false;
        if (item.passenger.AccountId == passenger.AccountId) {
          item.isReselect = true;
          item.selectedInfo = item.selectedInfo.map(it => {
            it.resetId = it.Id == arg.Id ? arg.Id : null;
            return it;
          });
        }
        return item;
      });
      this.passengerFlightSegments = arr;
    } else {
      // 重选去程
      s.tripType = TripType.departureTrip;
      this.passengerFlightSegments = [];
    }
    this.setPassengerFlightSegmentSource(this.getPassengerFlightSegments());
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
      this.router.navigate([AppHelper.getRoutePath("book-flight")]).then(_ => {
        this.setSearchFlightModel(s);
      });
    }
  }
  private async reselectNotSelfBookTypeSegments(
    passenger: StaffEntity,
    arg: PassengerFlightSelectedInfo
  ) {
    const s = this.getSearchFlightModel();
    s.tripType = TripType.departureTrip;
    const arr = this.getPassengerFlightSegments().map(item => {
      item.isReselect = false;
      if (item.passenger.AccountId == passenger.AccountId) {
        item.isReselect = true;
        item.selectedInfo = item.selectedInfo.map(it => {
          it.resetId = it.Id == arg.Id ? arg.Id : null;
          return it;
        });
      }
      return item;
    });
    this.passengerFlightSegments = arr;
    this.setPassengerFlightSegmentSource(this.getPassengerFlightSegments());
    this.apiService.showLoadingView();
    await this.dismissAllTopOverlays();
    this.apiService.hideLoadingView();
    this.router.navigate([AppHelper.getRoutePath("book-flight")]).then(_ => {
      this.setSearchFlightModel(s);
    });
  }
  async reselectPassengerFlightSegments(
    passenger: StaffEntity,
    arg: PassengerFlightSelectedInfo
  ) {
    console.log(
      "this.router.routerState.snapshot.url=",
      this.router.routerState.snapshot.url
    );
    if (await this.staffService.isStaffTypeSelf()) {
      await this.reselectSelfBookTypeSegment(passenger, arg);
    } else {
      await this.reselectNotSelfBookTypeSegments(passenger, arg);
    }
  }
  async addOrReselecteInfos(flightCabin: FlightCabinEntity) {
    let unselectSegments = this.getPassengerFlightSegments().filter(
      p => p.selectedInfo.length == 0
    );
    let selfUnselects = [];
    const s = this.getSearchFlightModel();
    if (await this.staffService.isStaffTypeSelf()) {
      if (s.IsRoundTrip && s.tripType == TripType.returnTrip) {
        if (unselectSegments.length == 0) {
          selfUnselects = this.getPassengerFlightSegments();
        }
      }
    }
    unselectSegments = [...unselectSegments, ...selfUnselects];
    for (let i = 0; i < unselectSegments.length; i++) {
      const p = unselectSegments[i];
      const passengerPolicies = this.currentViewtFlightSegment.totalPolicyFlights.find(
        itm => itm.PassengerKey == p.passenger.AccountId
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
            if (
              !this.getPassengerFlightSegments().find(item => item.isReselect)
            ) {
              p.selectedInfo.push({
                flightSegment: this.currentViewtFlightSegment.flightSegment,
                flightPolicy: cabin,
                tripType: this.getSearchFlightModel().IsRoundTrip
                  ? this.getSearchFlightModel().tripType
                  : TripType.departureTrip,
                Id: AppHelper.uuid(),
                resetId: null
              });
            }
          } else {
            p.selectedInfo.push({
              flightSegment: this.currentViewtFlightSegment.flightSegment,
              flightPolicy: cabin,
              tripType: this.getSearchFlightModel().IsRoundTrip
                ? this.getSearchFlightModel().tripType
                : TripType.departureTrip,
              Id: AppHelper.uuid(),
              resetId: null
            });
          }
        }
      }
    }
    const one = this.getPassengerFlightSegments().find(item => item.isReselect);
    if (one) {
      const old = one.selectedInfo.find(item => !!item.resetId);
      const onePolicies = this.currentViewtFlightSegment.totalPolicyFlights.find(
        item => item.PassengerKey == one.passenger.AccountId
      );
      const cabin =
        onePolicies &&
        onePolicies.FlightPolicies.find(
          c =>
            c.FlightNo == this.currentViewtFlightSegment.flightSegment.Number &&
            c.CabinCode == flightCabin.Code
        );
      if (cabin) {
        cabin.Cabin = this.currentViewtFlightSegment.flightSegment.Cabins.find(
          c => c.Code == cabin.CabinCode
        );
        const newOne: PassengerFlightSelectedInfo = { 
          Id: AppHelper.uuid(),
          tripType: this.getSearchFlightModel().IsRoundTrip
          ? this.getSearchFlightModel().tripType
          : TripType.departureTrip,
          flightSegment: this.currentViewtFlightSegment.flightSegment,
          flightPolicy: cabin,
          resetId: null
        };
        this.replacePassengerFlightSelectedInfo(one.passenger, old, newOne);
      }
    }
    const arr = this.getPassengerFlightSegments().map(item => {
      item.isReselect = false;
      item.selectedInfo = item.selectedInfo.map(itm => {
        itm.resetId = null;
        return itm;
      });
      return item;
    });
    this.passengerFlightSegments = arr;
    this.setPassengerFlightSegmentSource(arr);
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
  private async bookTypeSelfAddPassengerFlightSegments(
    arg: PassengerFlightSegments
  ): Promise<string> {
    if (!arg || !arg.selectedInfo) {
      AppHelper.alert(
        LanguageHelper.Flight.getSelectedFlightInvalideTip(),
        true,
        LanguageHelper.getConfirmTip()
      );
      return "";
    }
    const s = await this.staffService.getStaff();
    const one = this.getPassengerFlightSegments().find(
      itm => itm.passenger.AccountId == s.AccountId
    );
    if (!one) {
      // arg.selectedInfo[0].tripType = TripType.departureTrip;
      this.passengerFlightSegments = [arg];
    } else {
      if (this.getSearchFlightModel().IsRoundTrip) {
        // 往返
        if (arg.selectedInfo.length) {
          const backFlight =
            arg.selectedInfo.find(
              item => item.tripType == TripType.returnTrip
            ) || arg.selectedInfo[0];
          backFlight.tripType = TripType.returnTrip;
          one.isReselect = false;
          backFlight.resetId = null;
          one.selectedInfo = [
            one.selectedInfo.find(
              item => item.tripType == TripType.departureTrip
            ),
            backFlight
          ];
        }
      } else {
        // 单程
        if (one.selectedInfo.length) {
          AppHelper.alert(
            LanguageHelper.Flight.getCannotBookMoreFlightSegmentTip(),
            false,
            LanguageHelper.getConfirmTip()
          );
        } else {
          if (arg.selectedInfo.length) {
            const goFlight =
              arg.selectedInfo.find(
                item => item.tripType == TripType.departureTrip
              ) || arg.selectedInfo[0];
            goFlight.tripType = TripType.departureTrip;
            one.selectedInfo = [goFlight];
          }
        }
      }
      this.passengerFlightSegments = [one];
    }
    // this.setPassengerFlightSegmentSource(this.getPassengerFlightSegments());
    return "";
  }
  private async bookTypeSecretaryAddPassengerFlightSegments(
    arg: PassengerFlightSegments
  ) {
    const excess = await this.checkIfExcessMaxLimitedBookTickets(9);
    if (excess) {
      await AppHelper.alert(
        LanguageHelper.Flight.getCannotBookMoreFlightSegmentTip(),
        true,
        LanguageHelper.getConfirmTip()
      );
    }
    arg.Id = `${this.passengerFlightSegments.length}`;
    this.passengerFlightSegments.push(arg);
    return "";
  }
  private async bookTypeAllAddPassengerFlightSegments(
    arg: PassengerFlightSegments
  ) {
    const excess = await this.checkIfExcessMaxLimitedBookTickets(9);
    if (excess) {
      await AppHelper.alert(
        LanguageHelper.Flight.getCannotBookMoreFlightSegmentTip(),
        true,
        LanguageHelper.getConfirmTip()
      );
    }
    arg.Id = `${this.passengerFlightSegments.length}`;
    this.passengerFlightSegments.push(arg);
    return "";
  }
  removeAllPassengerFlightSegments() {
    this.passengerFlightSegments = [];
    this.setPassengerFlightSegmentSource(this.getPassengerFlightSegments());
  }
  replacePassengerFlightSelectedInfo(
    passenger: StaffEntity,
    old: PassengerFlightSelectedInfo,
    newInfo: PassengerFlightSelectedInfo
  ) {
    let arr = this.getPassengerFlightSegments();
    arr = arr.map(item => {
      if (item.passenger.AccountId == passenger.AccountId) {
        item.selectedInfo = item.selectedInfo.map(itm => {
          if (itm.Id == old.Id) {
            itm = newInfo;
          }
          return itm;
        });
      }
      return item;
    });
    this.passengerFlightSegments = arr;
    this.setPassengerFlightSegmentSource(this.passengerFlightSegments);
  }
  removePassengerFlightSelectedInfo(
    passenger: StaffEntity,
    arg: PassengerFlightSelectedInfo
  ) {
    let arr = this.getPassengerFlightSegments();
    arr = arr.map(item => {
      if (item.passenger.AccountId == passenger.AccountId) {
        item.selectedInfo = item.selectedInfo.filter(it => it.Id !== arg.Id);
      }
      return item;
    });
    this.passengerFlightSegments = arr;
    this.setPassengerFlightSegmentSource(arr);
  }
  removePassengerFlightSegments(args: PassengerFlightSegments[]) {
    this.passengerFlightSegments = this.getPassengerFlightSegments().filter(
      item => !args.some(i => i.Id == item.Id)
    );
    this.setPassengerFlightSegmentSource(this.getPassengerFlightSegments());
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
  policyflights(
    Flights: FlightJourneyEntity[],
    Passengers: string[]
  ): Observable<PassengerPolicyFlights[]> {
    return from(
      Promise.resolve().then(async _ => {
        let local;
        if (!environment.production) {
          local = await this.storage.get(
            "TestTmcData.TmcApiFlightUrl-Home-Policy"
          );
          if (local) {
            console.log(
              "policyflights local",
              local,
              `缓存是否过期 ${Date.now() - local.lastUpdateTime >=
                debugCacheTime}`
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
        return [];
      })
    ).pipe(
      switchMap(local => {
        if (local && local.length) {
          return of(local);
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
        return this.apiService
          .getResponse<
            {
              PassengerKey: string;
              FlightPolicies: FlightPolicy[];
            }[]
          >(req)
          .pipe(
            map(res => res.Data || []),
            switchMap(res => {
              if (res.length && !environment.production) {
                return from(
                  this.storage.set("TestTmcData.TmcApiFlightUrl-Home-Policy", {
                    lastUpdateTime: Date.now(),
                    FlightPolicy: res,
                    fromCode: Flights && Flights[0] && Flights[0].FromCity,
                    toCode: Flights && Flights[0] && Flights[0].ToCity
                  })
                ).pipe(map(_ => res));
              }
              return of(res);
            }),
            catchError(_ => {
              AppHelper.alert(_);
              return [];
            })
          );
      })
    );
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
    const addDay =
      moment(s.ArrivalTime, "YYYY-MM-DDTHH:mm:ss").date() -
      moment(s.TakeoffTime, "YYYY-MM-DDTHH:mm:ss").date();
    // console.log(addDay);
    return addDay > 0 ? "+" + addDay + LanguageHelper.getDayTip() : "";
  }
  getTotalFlySegments(flyJourneys: FlightJourneyEntity[]) {
    return flyJourneys.reduce(
      (arr, journey) => {
        arr = [
          ...arr,
          ...journey.FlightRoutes.reduce(
            (segs, route) => {
              segs = [
                ...segs,
                ...route.FlightSegments.map(s => {
                  s.TrackById = segs.length;
                  s.TakeoffTimeStamp = +moment(
                    s.TakeoffTime,
                    "YYYY-MM-DDTHH:mm:ss"
                  );
                  s.ArrivalTimeStamp = +moment(
                    s.ArrivalTime,
                    "YYYY-MM-DDTHH:mm:ss"
                  );
                  s.TakeoffShortTime = moment(
                    s.TakeoffTime,
                    "YYYY-MM-DDTHH:mm:ss"
                  ).format("HH:mm");
                  s.ArrivalShortTime = moment(
                    s.ArrivalTime,
                    "YYYY-MM-DDTHH:mm:ss"
                  ).format("HH:mm");
                  s.AddOneDayTip = this.addoneday(s);
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
  getFlightJourneyDetailList(
    data: SearchFlightModel
  ): Observable<FlightJourneyEntity[]> {
    return from(
      Promise.resolve().then(async _ => {
        let local;
        if (!environment.production) {
          local = await this.storage.get("TestTmcData.FlightData");
          if (local) {
            console.log(
              "getFlightJourneyDetailList local",
              local,
              `缓存是否过期 ${Date.now() - local.lastUpdateTime >=
                debugCacheTime}`
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
        return [];
      })
    ).pipe(
      switchMap(localFlights => {
        if (localFlights && localFlights.length) {
          return of(localFlights);
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
        return this.apiService.getResponse<FlightJourneyEntity[]>(req).pipe(
          map(r => r.Data),
          map(serverFlights => {
            if (serverFlights.length && !environment.production) {
              this.storage.set("TestTmcData.FlightData", {
                serverFlights,
                lastUpdateTime: Date.now(),
                date: data.Date,
                fromCode: data.FromCode,
                toCode: data.ToCode
              });
            }
            return serverFlights;
          }),
          catchError(_ => {
            AppHelper.alert(_);
            return [] as FlightJourneyEntity[];
          })
        );
      })
    );
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
    this.apiService.showLoadingView();
    const h = await this.getDomesticAirports();
    const i = [] || (await this.getInternationalAirports());
    this.apiService.hideLoadingView();
    return [...h, ...i];
  }
}
