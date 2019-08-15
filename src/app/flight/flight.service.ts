import { CredentialsType } from "./../member/pipe/credential.pipe";
import { IdentityEntity } from "./../services/identity/identity.entity";
import { CredentialsEntity } from "./../tmc/models/CredentialsEntity";
import {
  TmcService,
  PassengerBookInfo,
  InitialBookDtoModel
} from "src/app/tmc/tmc.service";
import { ModalController, NavController } from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
import { FlightCabinEntity } from "./models/flight/FlightCabinEntity";
import { FilterConditionModel } from "./models/flight/advanced-search-cond/FilterConditionModel";
import { IdentityService } from "./../services/identity/identity.service";
import { StaffService, StaffEntity } from "../hr/staff.service";
import { Injectable } from "@angular/core";
import { Subject, BehaviorSubject } from "rxjs";

import * as moment from "moment";
import { ApiService } from "../services/api/api.service";
import { FlightJourneyEntity } from "./models/flight/FlightJourneyEntity";
import { FlightSegmentEntity } from "./models/flight/FlightSegmentEntity";
import { RequestEntity } from "../services/api/Request.entity";
import { LanguageHelper } from "../languageHelper";
import { Router } from "@angular/router";
import { TripType } from "../tmc/models/TripType";
import { TrafficlineEntity } from "../tmc/models/TrafficlineEntity";
import {
  CurrentViewtFlightSegment,
  PassengerPolicyFlights,
  FlightPolicy
} from "./models/PassengerFlightInfo";
import { OrderBookDto } from "../order/models/OrderBookDto";
import { SelectDateComponent } from '../tmc/components/select-date/select-date.component';

export class SearchFlightModel {
  BackDate: string; //  Yes 航班日期（yyyy-MM-dd）
  Date: string; //  Yes 航班日期（yyyy-MM-dd）
  FromCode: string; //  Yes 三字代码
  ToCode: string; //  Yes 三字代码
  FromAsAirport: boolean; //  No 始发以机场查询
  ToAsAirport: boolean; //  No 到达以机场查询
  isRoundTrip?: boolean; // 是否是往返
  fromCity: TrafficlineEntity;
  toCity: TrafficlineEntity;
  tripType: TripType;
  isLocked?: boolean;
  isSelfBookType?: boolean;
}
@Injectable({
  providedIn: "root"
})
export class FlightService {
  private worker = null;
  private selfCredentials: CredentialsEntity[];
  private searchFlightModelSource: Subject<SearchFlightModel>;
  private passengerBookInfoSource: Subject<PassengerBookInfo[]>;
  private searchFlightModel: SearchFlightModel;
  private filterPanelShowHideSource: Subject<boolean>;
  private openCloseSelectCitySources: Subject<boolean>;
  private filterCondSources: Subject<FilterConditionModel>;

  private selectedCitySource: Subject<TrafficlineEntity>;
  private passengerBookInfos: PassengerBookInfo[]; // 记录乘客及其研究选择的航班
  currentViewtFlightSegment: CurrentViewtFlightSegment;

  constructor(
    private apiService: ApiService,
    private staffService: StaffService,
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
    this.selfCredentials = null;
  }

  getCurrentViewtFlightSegment() {
    return this.currentViewtFlightSegment;
  }
  setSearchFlightModel(m: SearchFlightModel) {
    if (m) {
      this.searchFlightModel = {
        ...m,
        isSelfBookType: this.staffService.isSelfBookType
      };
      if (m.isRoundTrip) {
        const arr = this.getPassengerBookInfos();
        if (m.tripType == TripType.returnTrip) {
          if (!arr.find(item => item.isReplace)) {
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
    if (this.staffService.isSelfBookType) {
      if (this.searchFlightModel.isRoundTrip) {
        const infos = this.getPassengerBookInfos();
        const info = infos.find(
          item =>
            item.flightSegmentInfo &&
            item.flightSegmentInfo.flightSegment &&
            item.flightSegmentInfo.tripType == TripType.departureTrip
        );
        const goFlight =
          info &&
          info.flightSegmentInfo &&
          info.flightSegmentInfo.flightSegment;
        if (goFlight) {
          const takeoffTime = moment(flightSegment.TakeoffTime);
          const arrivalTime = moment(goFlight.ArrivalTime);
          return (
            takeoffTime.date() == arrivalTime.date() ||
            +arrivalTime <= +takeoffTime
          );
        }
      }
      return !this.checkIfExcessMaxLimitedBookTickets(1);
    } else {
      return !this.checkIfExcessMaxLimitedBookTickets(9);
    }
  }
  canBookMoreFlightSegment(flightSegment: FlightSegmentEntity) {
    if (!flightSegment) {
      return true;
    }
    if (this.staffService.isSelfBookType) {
      if (this.getSearchFlightModel().isRoundTrip) {
        const arr = this.getPassengerBookInfos();
        if (arr.filter(item => !!item.flightSegmentInfo).length == 2) {
          const g = arr.find(
            item => item.flightSegmentInfo.tripType == TripType.departureTrip
          );
          const b = arr.find(
            item => item.flightSegmentInfo.tripType == TripType.returnTrip
          );
          const hasReselect = arr.find(item => item.isReplace);
          if (g && b) {
            return !!hasReselect;
          } else {
            return false;
          }
        }
        return !this.checkIfExcessMaxLimitedBookTickets(2);
      }
      return !this.checkIfExcessMaxLimitedBookTickets(1);
    } else {
      return !this.checkIfExcessMaxLimitedBookTickets(9);
    }
  }
  private checkIfExcessMaxLimitedBookTickets(max: number) {
    return (
      this.getPassengerBookInfos().reduce((sum, item) => {
        if (!item.isReplace) {
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
    const infos = this.getPassengerBookInfos();
    if (!arg || !arg.passenger || !arg.credential) {
      AppHelper.alert(LanguageHelper.Flight.getSelectedFlightInvalideTip());
      return;
    }
    arg.id = AppHelper.uuid();
    if (!arg.credential.Account || arg.isNotWhitelist) {
      arg.credential.Account = arg.passenger.Account;
    }
    arg.isNotWhitelist = arg.passenger.isNotWhiteList;
    infos.push(arg);
    console.log("addPassengerFlightSegments added", arg);
    this.setPassengerBookInfos(infos);
  }
  async openCalendar(isMulti: boolean) {
    const goFlight = this.getPassengerBookInfos().find(
      f =>
        f.flightSegmentInfo &&
        f.flightSegmentInfo.tripType == TripType.departureTrip
    );
    const s = this.getSearchFlightModel();
    const m = await this.modalCtrl.create({
      component: SelectDateComponent,
      componentProps: {
        goArrivalTime:
          goFlight &&
          goFlight.flightSegmentInfo &&
          goFlight.flightSegmentInfo.flightSegment &&
          goFlight.flightSegmentInfo.flightSegment.ArrivalTime,
        tripType: s.tripType,
        isMulti: isMulti
      }
    });
    m.present();
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
        item.isReplace = item.id == arg.id;
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
      this.setSearchFlightModel(s);
      this.router.navigate([AppHelper.getRoutePath("flight-list")]);
    } else {
      this.setSearchFlightModel(s);
      this.router.navigate([AppHelper.getRoutePath("search-flight")]);
    }
  }
  private async reselectNotSelfBookTypeSegments(arg: PassengerBookInfo) {
    const s = this.getSearchFlightModel();
    s.tripType = TripType.departureTrip;
    const arr = this.getPassengerBookInfos().map(item => {
      item.isReplace = item.id == arg.id;
      return item;
    });
    this.apiService.showLoadingView();
    await this.dismissAllTopOverlays();
    this.apiService.hideLoadingView();
    this.router.navigate([AppHelper.getRoutePath("search-flight")]).then(_ => {
      this.setSearchFlightModel(s);
    });
    this.passengerBookInfos = arr;
    this.setPassengerBookInfos(this.passengerBookInfos);
  }
  async reselectPassengerFlightSegments(arg: PassengerBookInfo) {
    console.log("reselectPassengerFlightSegments", arg);
    if (!arg || !arg.flightSegmentInfo) {
      return false;
    }
    if (await this.staffService.checkStaffTypeSelf()) {
      await this.reselectSelfBookTypeSegment(arg);
    } else {
      await this.reselectNotSelfBookTypeSegments(arg);
    }
    console.log("getPassengerBookInfos", this.getPassengerBookInfos());
  }
  addOrReplaceSegmentInfo(flightCabin: FlightCabinEntity) {
    const bookInfos = this.getPassengerBookInfos().filter(
      item =>
        item.isReplace ||
        !item.flightSegmentInfo ||
        !item.flightSegmentInfo.flightPolicy
    );
    for (let i = 0; i < bookInfos.length; i++) {
      const bookInfo = bookInfos[i];
      const passengerPolicies = this.currentViewtFlightSegment.totalPolicyFlights.find(
        itm => itm.PassengerKey == bookInfo.passenger.AccountId
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
          bookInfo.flightSegmentInfo = {
            flightSegment: this.currentViewtFlightSegment.flightSegment,
            flightPolicy: cabin,
            tripType: this.getSearchFlightModel().isRoundTrip
              ? this.getSearchFlightModel().tripType
              : TripType.departureTrip,
            id: AppHelper.uuid()
          };
        }
      }
    }
    const arr = this.getPassengerBookInfos().map(item => {
      item.isReplace = false;
      return item;
    });
    this.setPassengerBookInfos(arr);
  }

  async dismissTopOverlay() {
    const t = await this.modalCtrl.getTop();
    if (t) {
      t.dismiss().catch(_ => 0);
    }
  }
  async dismissAllTopOverlays() {
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
  removeOneBookInfoFromSelfBookType() {}
  async addOneBookInfoToSelfBookType() {
    let IdCredential: CredentialsEntity;
    const staff = await this.staffService.getStaff();
    if (!this.selfCredentials || this.selfCredentials.length == 0) {
      const res = await this.tmcService
        .getPassengerCredentials([staff.AccountId])
        .catch(_ => ({ [staff.AccountId]: [] }));
      this.selfCredentials = res[staff.AccountId];
    }
    IdCredential =
      this.selfCredentials &&
      this.selfCredentials.find(c => c.Type == CredentialsType.IdCard);
    this.addPassengerBookInfo({
      passenger: staff,
      credential:
        IdCredential ||
        (this.selfCredentials &&
          this.selfCredentials.length &&
          this.selfCredentials[1]) ||
        new CredentialsEntity()
    });
  }
  private async checkOrAddSelfBookTypeBookInfo() {
    const sm = this.getSearchFlightModel();
    if (sm.isSelfBookType && this.getPassengerBookInfos().length == 0) {
      await this.addOneBookInfoToSelfBookType();
    }
  }
  replacePassengerBookInfo(old: PassengerBookInfo, newInfo: PassengerBookInfo) {
    if (!old || !newInfo) {
      return;
    }
    let arr = this.getPassengerBookInfos();
    arr = arr.map(item => {
      if (item.id == old.id) {
        return newInfo;
      }
      return item;
    });
    this.setPassengerBookInfos(arr);
  }
  async removePassengerBookInfo(arg: PassengerBookInfo) {
    if (this.searchFlightModel.isSelfBookType) {
      if (arg.flightSegmentInfo) {
        if (arg.flightSegmentInfo.tripType == TripType.returnTrip) {
          this.passengerBookInfos = this.getPassengerBookInfos().filter(
            item => item.id != arg.id
          );
        }
        if (arg.flightSegmentInfo.tripType == TripType.departureTrip) {
          this.passengerBookInfos = this.getPassengerBookInfos()
            .filter(
              item =>
                item.flightSegmentInfo &&
                item.flightSegmentInfo.tripType == TripType.departureTrip
            )
            .map(item => {
              if (item.id == arg.id) {
                item.flightSegmentInfo = null;
              }
              return item;
            });
        }
      }
    } else {
      this.passengerBookInfos = this.getPassengerBookInfos().filter(
        item => item.id != arg.id
      );
    }
    this.setPassengerBookInfos(this.passengerBookInfos);
  }
  getSelectedCity() {
    return this.selectedCitySource.asObservable();
  }
  setSelectedCity(_selectedCity: TrafficlineEntity) {
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
    return this.tmcService.getDomesticAirports(forceFetch);
  }
  async getInternationalAirports(forceFetch: boolean = false) {
    return this.tmcService.getInternationalAirports(forceFetch);
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
  get allLocalAirports() {
    return this.tmcService.allLocalAirports || [];
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
    await this.checkOrAddSelfBookTypeBookInfo();
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
    return serverFlights;
  }
  async getLocalHomeAirports(): Promise<TrafficlineEntity[]> {
    return this.getDomesticAirports();
  }
  async getLocalInternationalAirports(): Promise<TrafficlineEntity[]> {
    return this.getInternationalAirports();
  }
  async getAllLocalAirports() {
    return this.tmcService.getAllLocalAirports();
  }
  async bookFlight(bookDto: OrderBookDto): Promise<{ TradeNo: string }> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Flight-Book";
    bookDto.Channel = "Mobile";
    req.Data = bookDto;
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService.getPromiseData<{ TradeNo: string }>(req);
  }
  async getPassengerCredentials(
    accountIds: string[]
  ): Promise<{ [accountId: string]: CredentialsEntity[] }> {
    return this.tmcService.getPassengerCredentials(accountIds);
  }
  async getInitializeBookDto(
    bookDto: OrderBookDto
  ): Promise<InitialBookDtoModel> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Flight-Initialize";
    req.Data = bookDto;
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService
      .getPromiseData<InitialBookDtoModel>(req)
      .then(res => {
        res.IllegalReasons = res.IllegalReasons || [];
        res.Insurances = res.Insurances || [];
        res.ServiceFees = res.ServiceFees || ({} as any);
        res.Staffs = res.Staffs || [];
        res.Staffs = res.Staffs.map(it => {
          return {
            ...it,
            CredentialStaff: { ...it } as any
          };
        });
        res.Tmc = res.Tmc || ({} as any);
        res.TravelFrom = res.TravelFrom || ({} as any);

        return res;
      });
  }
}
