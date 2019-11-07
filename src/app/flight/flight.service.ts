import { CalendarService } from "./../tmc/calendar.service";
import { CredentialsType } from "./../member/pipe/credential.pipe";
import { IdentityEntity } from "./../services/identity/identity.entity";
import { CredentialsEntity } from "./../tmc/models/CredentialsEntity";
import {
  TmcService,
  PassengerBookInfo,
  InitialBookDtoModel,
  FlightHotelTrainType
} from "src/app/tmc/tmc.service";
import {
  ModalController,
  NavController,
  PopoverController
} from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
import { FlightCabinEntity } from "./models/flight/FlightCabinEntity";
import { FilterConditionModel } from "./models/flight/advanced-search-cond/FilterConditionModel";
import { IdentityService } from "./../services/identity/identity.service";
import { StaffService, StaffEntity } from "../hr/staff.service";
import { Injectable } from "@angular/core";
import { Subject, BehaviorSubject, combineLatest } from "rxjs";

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
  FlightPolicy,
  IFlightSegmentInfo
} from "./models/PassengerFlightInfo";
import { OrderBookDto } from "../order/models/OrderBookDto";
import { SelectDateComponent } from "../tmc/components/select-date/select-date.component";
import { DayModel } from '../tmc/models/DayModel';

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
  isRefreshData?: boolean;
}
@Injectable({
  providedIn: "root"
})
export class FlightService {
  private worker = null;
  private selfCredentials: CredentialsEntity[];
  private searchFlightModelSource: Subject<SearchFlightModel>;
  private passengerBookInfoSource: Subject<
    PassengerBookInfo<IFlightSegmentInfo>[]
  >;
  private searchFlightModel: SearchFlightModel;
  private filterPanelShowHideSource: Subject<boolean>;
  private openCloseSelectCitySources: Subject<boolean>;
  private filterCondSources: Subject<FilterConditionModel>;

  private selectedCitySource: Subject<TrafficlineEntity>;
  private passengerBookInfos: PassengerBookInfo<IFlightSegmentInfo>[]; // 记录乘客及其研究选择的航班
  private isInitializingSelfBookInfos = false;
  currentViewtFlightSegment: CurrentViewtFlightSegment;

  constructor(
    private apiService: ApiService,
    private staffService: StaffService,
    private modalCtrl: ModalController,
    private router: Router,
    private navCtrl: NavController,
    private identityService: IdentityService,
    private popoverController: PopoverController,
    private tmcService: TmcService,
    private calendarService: CalendarService
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
    identityService.getIdentitySource().subscribe(res => {
      this.disposal();
    });
    combineLatest([
      identityService.getIdentitySource(),
      this.getPassengerBookInfoSource()
    ]).subscribe(async ([identity, infos]) => {
      if (identity && identity.Id && identity.Ticket && infos.length == 0) {
        await this.initSelfBookTypeBookInfos();
      }
    });
  }
  private async initSelfBookTypeBookInfos() {
    this.apiService.showLoadingView();
    await this.checkOrAddSelfBookTypeBookInfo();
    this.apiService.hideLoadingView();
  }
  private disposal() {
    this.setSearchFlightModel(new SearchFlightModel());
    this.removeAllBookInfos();
    this.selectedCitySource.next(null);
    this.openCloseSelectCitySources.next(false);
    this.setSelectedCity(null);
    this.currentViewtFlightSegment = null;
    this.selfCredentials = null;
    this.isInitializingSelfBookInfos = false;
  }

  getCurrentViewtFlightSegment() {
    return this.currentViewtFlightSegment;
  }
  setSearchFlightModel(m: SearchFlightModel) {
    console.log("setSearchFlightModel", m);
    this.searchFlightModel = m;
    this.searchFlightModelSource.next(this.searchFlightModel);
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
  private setPassengerBookInfos(args: PassengerBookInfo<IFlightSegmentInfo>[]) {
    console.log("flight setPassengerBookInfos", args);
    this.passengerBookInfos = args || [];
    this.passengerBookInfoSource.next(this.passengerBookInfos);
  }
  // private setPassengerBookInfoSource(args: PassengerBookInfo[]) {
  //   this.passengerBookInfoSource.next(args);
  // }
  getPassengerBookInfoSource() {
    return this.passengerBookInfoSource.asObservable();
  }
  filterPassengerPolicyCabins(
    { data, flightSegment }: { data: PassengerBookInfo<IFlightSegmentInfo>; flightSegment: FlightSegmentEntity; }) {
    let policyCabins: FlightPolicy[] = [];
    policyCabins = (flightSegment.Cabins || []).map(it => {
      return {
        Cabin: it,
        FlightNo: flightSegment.Number,
        Id: it.Id,
        CabinCode: it.Code,
        IsAllowBook: true,
        Discount: it.Discount,
        LowerSegment: it.LowerSegment,
        Rules: []
      }
    });
    if (data && data.passenger && data.passenger.AccountId) {
      this.setPassengerBookInfos(
        this.getPassengerBookInfos().map(it => {
          it.isFilteredPolicy = it.id == data.id;
          return it;
        })
      );
      const one = this.currentViewtFlightSegment.totalPolicyFlights.find(
        item => item.PassengerKey == data.passenger.AccountId
      );
      if (one) {
        policyCabins = one.FlightPolicies.filter(
          pc => pc.FlightNo == flightSegment.Number
        );
        if (data.isOnlyFilterMatchedPolicy) {
          policyCabins = policyCabins.filter(
            it => !it.Rules || it.Rules.length == 0
          );
        }
        policyCabins = policyCabins.map(it => {
          const fc = flightSegment.Cabins && flightSegment.Cabins.find(f => f.Id == it.Id);
          if (fc) {
            it.Cabin = { ...fc };
          }
          return it;
        })
      }
    } else {
      this.setPassengerBookInfos(
        this.getPassengerBookInfos().map(it => {
          it.isFilteredPolicy = false;
          it.isOnlyFilterMatchedPolicy = false;
          return it;
        })
      );
    }
    return policyCabins;
  }
  filterPassengerPolicyFlights(
    bookInfo: PassengerBookInfo<IFlightSegmentInfo>,
    flightJourneyList: FlightJourneyEntity[],
    policyflights: PassengerPolicyFlights[]
  ): FlightSegmentEntity[] {
    if (bookInfo && bookInfo.passenger && bookInfo.passenger.AccountId) {
      bookInfo.isFilteredPolicy = true;
      this.setPassengerBookInfos(
        this.getPassengerBookInfos().map(it => {
          it.isFilteredPolicy = bookInfo.id == it.id;
          return it;
        })
      );
      let numbers: string[] = [];
      const policies =
        policyflights &&
        policyflights.find(
          pl => pl.PassengerKey == bookInfo.passenger.AccountId
        );
      if (policies && policies.FlightPolicies) {
        numbers = policies.FlightPolicies.reduce(
          (acc, it) => [...acc, it.FlightNo],
          []
        );
      }
      const filteredFlightJourenyList = flightJourneyList.filter(it => {
        return (
          it.FlightRoutes &&
          it.FlightRoutes.some(fr => {
            if (fr.FlightSegments) {
              if (bookInfo.isOnlyFilterMatchedPolicy) {
                return fr.FlightSegments.some(
                  s =>
                    numbers.includes(s.Number) &&
                    policies && policies.FlightPolicies &&
                    policies.FlightPolicies.some(
                      pc => !pc.Rules || pc.Rules.length == 0
                    )
                );
              }
              return fr.FlightSegments.some(s => numbers.includes(s.Number));
            }
            return false;
          })
        );
      });
      const segments = this.getTotalFlySegments(filteredFlightJourenyList);
      return segments;
    } else {
      this.setPassengerBookInfos(
        this.getPassengerBookInfos().map(it => {
          it.isFilteredPolicy = false;
          it.isOnlyFilterMatchedPolicy = false;
          return it;
        })
      );
      return this.getTotalFlySegments(flightJourneyList);
    }
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
    if (await this.staffService.isSelfBookType()) {
      if (this.searchFlightModel.isRoundTrip) {
        const infos = this.getPassengerBookInfos();
        const info = infos.find(
          item =>
            item.bookInfo &&
            item.bookInfo.flightSegment &&
            item.bookInfo.tripType == TripType.departureTrip
        );
        const goFlight = info && info.bookInfo && info.bookInfo.flightSegment;
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
  async canBookMoreFlightSegment(flightSegment: FlightSegmentEntity) {
    if (!flightSegment) {
      return true;
    }
    if (await this.staffService.isSelfBookType()) {
      return true;
    }
    return !this.checkIfExcessMaxLimitedBookTickets(9);
  }
  private checkIfExcessMaxLimitedBookTickets(max: number) {
    return (
      this.getPassengerBookInfos().reduce((sum, item) => {
        if (!item.isReplace) {
          if (
            item.bookInfo &&
            (item.bookInfo.flightPolicy || item.bookInfo.flightSegment)
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
  addPassengerBookInfo(
    arg: PassengerBookInfo<IFlightSegmentInfo>
  ): Promise<string> {
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
      f => f.bookInfo && f.bookInfo.tripType == TripType.departureTrip
    );
    const backFlight = this.getPassengerBookInfos().find(
      f => f.bookInfo && f.bookInfo.tripType == TripType.returnTrip
    );
    let s = this.getSearchFlightModel();
    if(s.isRoundTrip){
      if(goFlight){
        this.setSearchFlightModel({...s,tripType:TripType.returnTrip});
      }
    }
    s = this.getSearchFlightModel();
    const m = await this.modalCtrl.create({
      component: SelectDateComponent,
      componentProps: {
        goArrivalTime:backFlight&&goFlight&& !this.getPassengerBookInfos().some(it=>it.isReplace)?"": 
          goFlight &&
          goFlight.bookInfo && 
          goFlight.bookInfo.flightSegment &&
          goFlight.bookInfo.flightSegment.ArrivalTime,
        tripType: s.tripType||TripType.departureTrip,
        forType: FlightHotelTrainType.Flight,
        isMulti: isMulti
      }
    });
    await m.present();
    const d = await m.onDidDismiss();
    return d && d.data as DayModel[];
  }

  private async reselectSelfBookTypeSegment(
    arg: PassengerBookInfo<IFlightSegmentInfo>
  ) {
    const s = this.getSearchFlightModel();
    if (arg.bookInfo.tripType == TripType.returnTrip) {
      // 重选回程
      const exists = this.getPassengerBookInfos();
      const citites = await this.getAllLocalAirports();
      const goInfo = exists.find(
        item =>
          item.bookInfo && item.bookInfo.tripType == TripType.departureTrip
      );
      const goFlight = goInfo && goInfo.bookInfo.flightSegment;
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
        s.isLocked = true;
      }
      const arr = this.getPassengerBookInfos().map(item => {
        item.isReplace = item.id == arg.id;
        return item;
      });
      this.passengerBookInfos = arr;
    } else {
      // 重选去程
      s.tripType = TripType.departureTrip;
      s.isLocked = false;
      let arr = this.getPassengerBookInfos().map(item => {
        item.bookInfo = null;
        return item;
      });
      if (s.isRoundTrip) {
        if (arr.length < 2) {
          await this.addOneBookInfoToSelfBookType();
        } else {
          if (arr.length) {
            arr = [arr[0]];
          } else {
            await this.addOneBookInfoToSelfBookType();
          }
        }
      }
      this.passengerBookInfos = arr;
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
  private async reselectNotSelfBookTypeSegments(
    arg: PassengerBookInfo<IFlightSegmentInfo>
  ) {
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
  async reselectPassengerFlightSegments(
    arg: PassengerBookInfo<IFlightSegmentInfo>
  ) {
    console.log("reselectPassengerFlightSegments", arg);
    if (!arg || !arg.bookInfo) {
      return false;
    }
    if (await this.staffService.isSelfBookType()) {
      await this.reselectSelfBookTypeSegment(arg);
    } else {
      await this.reselectNotSelfBookTypeSegments(arg);
    }
    console.log("getPassengerBookInfos", this.getPassengerBookInfos());
  }
  async addOrReplaceSegmentInfo(flightCabin: FlightCabinEntity) {
    const isSelfBookType = await this.staffService.isSelfBookType();
    let bookInfos = this.getPassengerBookInfos();
    let s = this.getSearchFlightModel();
    if (isSelfBookType) {
      if (s.isRoundTrip) {
        if (!bookInfos.length) {
          await this.addOneBookInfoToSelfBookType();
        }
        bookInfos = this.getPassengerBookInfos();
        if (bookInfos.length) {
          const info = this.getPolicyCabinBookInfo(bookInfos[0], flightCabin);
          const go = this.passengerBookInfos.find(
            it => it.bookInfo && it.bookInfo.tripType == TripType.departureTrip
          );
          const back = this.passengerBookInfos.find(
            it => it.bookInfo && it.bookInfo.tripType == TripType.returnTrip
          );
          if (go && back) {
            this.setSearchFlightModel({
              ...this.getSearchFlightModel(),
              isLocked: false
            });
          }
          s = this.getSearchFlightModel();
          // debugger;
          if (go) {
            if (s.tripType == TripType.returnTrip) {
              info.tripType = TripType.returnTrip;

              bookInfos = [
                go,
                { ...bookInfos[0], bookInfo: info, id: AppHelper.uuid() }
              ];
            } else {
              // 当前选择的是去程信息
              // 选择了去程，未选择回程
              info.tripType = TripType.departureTrip;
              go.bookInfo = info;
              const backInfo = back || {
                ...go,
                bookInfo: null,
                id: AppHelper.uuid()
              };
              if (backInfo.bookInfo) {
                if (
                  !(
                    (go.bookInfo.flightSegment &&
                      go.bookInfo.flightSegment.FromCityName) ==
                    (backInfo.bookInfo.flightSegment &&
                      backInfo.bookInfo.flightSegment.ToCityName) &&
                    (go.bookInfo.flightSegment &&
                      go.bookInfo.flightSegment.ToCityName) ==
                    (backInfo.bookInfo.flightSegment &&
                      backInfo.bookInfo.flightSegment.FromCityName)
                  )
                ) {
                  backInfo.bookInfo = null;
                }
              }
              bookInfos = bookInfos = [go, backInfo]; // 更换去程信息，清空回程信息
            }
          } else {
            info.tripType = TripType.departureTrip;
            bookInfos = [
              { ...bookInfos[0], bookInfo: info },
              { ...bookInfos[0], bookInfo: null, id: AppHelper.uuid() }
            ];
          }
        }
      } else {
        bookInfos = [bookInfos[0]];
        bookInfos = bookInfos.map(it => {
          it.bookInfo = this.getPolicyCabinBookInfo(it, flightCabin);
          return it;
        });
      }
    } else {
      for (let i = 0; i < bookInfos.length; i++) {
        const bookInfo = bookInfos[i];
        bookInfo.bookInfo = this.getPolicyCabinBookInfo(bookInfo, flightCabin);
      }
    }
    const arr = bookInfos.map(item => {
      item.isReplace = false;
      return item;
    });
    if (isSelfBookType && arr.filter(it => !!it.bookInfo).length == 2) {
      this.setSearchFlightModel({
        ...this.getSearchFlightModel(),
        isLocked: false
      });
    }
    this.setPassengerBookInfos(arr);
  }
  private getPolicyCabinBookInfo(
    bookInfo: PassengerBookInfo<IFlightSegmentInfo>,
    flightCabin: FlightCabinEntity
  ): IFlightSegmentInfo {
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
        let tripType = TripType.departureTrip;
        if (bookInfo.isReplace) {
          if (bookInfo.bookInfo) {
            tripType = bookInfo.bookInfo.tripType;
          }
        } else {
          if (this.getSearchFlightModel().isRoundTrip) {
            const go = this.getPassengerBookInfos().find(
              it =>
                it.bookInfo && it.bookInfo.tripType == TripType.departureTrip
            );
            if (go) {
              tripType = TripType.returnTrip;
            }
          }
        }
        return {
          flightSegment: this.currentViewtFlightSegment.flightSegment,
          flightPolicy: cabin,
          tripType,
          id: AppHelper.uuid()
        } as IFlightSegmentInfo;
      }
    }
    return null;
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
      await top.dismiss().catch(_ => { });
      top = await this.modalCtrl.getTop();
    }
    console.timeEnd("dismissAllTopOverlays");
    return true;
  }
  removeAllBookInfos() {
    this.passengerBookInfos = [];
    this.setPassengerBookInfos(this.getPassengerBookInfos());
  }
  async addOneBookInfoToSelfBookType() {
    console.log("addOneBookInfoToSelfBookType");
    let IdCredential: CredentialsEntity;
    const staff: StaffEntity = await this.staffService.getStaff().catch(_ => null);
    if (!staff || !staff.AccountId) {
      return;
    }
    if (this.getPassengerBookInfos().length) {
      return;
    }
    if (!(await this.staffService.isSelfBookType())) {
      return;
    }
    if (!this.selfCredentials || this.selfCredentials.length == 0) {
      const res = await this.tmcService
        .getPassengerCredentials([staff.AccountId])
        .catch(_ => ({ [staff.AccountId]: [] }));
      this.selfCredentials = res[staff.AccountId];
    }
    if (this.isInitializingSelfBookInfos) {
      return;
    }
    this.isInitializingSelfBookInfos = true;
    IdCredential =
      this.selfCredentials &&
      this.selfCredentials.find(c => c.Type == CredentialsType.IdCard);
    const info = {
      passenger: staff,
      credential:
        IdCredential ||
        (this.selfCredentials &&
          this.selfCredentials.length &&
          this.selfCredentials[0]) ||
        new CredentialsEntity()
    };
    this.addPassengerBookInfo(info);
    this.isInitializingSelfBookInfos = false;
  }
  private async checkOrAddSelfBookTypeBookInfo() {
    const bookInfos = this.getPassengerBookInfos();
    const isSelf = await this.staffService.isSelfBookType();
    if (isSelf && bookInfos.length === 0) {
      await this.addOneBookInfoToSelfBookType();
    }
    if (
      isSelf &&
      this.getSearchFlightModel().isRoundTrip &&
      bookInfos.length == 1
    ) {
      this.setPassengerBookInfos([
        bookInfos[0],
        { ...bookInfos[0], bookInfo: null }
      ]);
    }
  }
  replacePassengerBookInfo(
    old: PassengerBookInfo<IFlightSegmentInfo>,
    newInfo: PassengerBookInfo<IFlightSegmentInfo>
  ) {
    if (!old || !newInfo) {
      return;
    }
    let arr = this.getPassengerBookInfos();
    arr = arr.map(item => {
      if (item.id === old.id) {
        return newInfo;
      }
      return item;
    });
    this.setPassengerBookInfos(arr);
  }
  async removePassengerBookInfo(p: PassengerBookInfo<IFlightSegmentInfo>) {
    const arg = { ...p };
    const isSelf = await this.staffService.isSelfBookType();
    if (isSelf) {
      if (arg.bookInfo) {
        if (arg.bookInfo.tripType == TripType.returnTrip) {
          this.passengerBookInfos = this.getPassengerBookInfos().filter(
            it => it.id !== arg.id
          );
          this.setSearchFlightModel({
            ...this.getSearchFlightModel(),
            tripType: TripType.departureTrip,
            isLocked:false,
          });
        }
        if (arg.bookInfo.tripType == TripType.departureTrip) {
          this.passengerBookInfos = this.getPassengerBookInfos().map(item => {
            item.bookInfo = null;
            return item;
          });
          this.setSearchFlightModel({
            ...this.getSearchFlightModel(),
            isLocked: false,
            tripType: TripType.departureTrip
          });
        }
      }
    } else {
      this.passengerBookInfos = this.getPassengerBookInfos().filter(
        it => it.id !== arg.id
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
    req.Version = "2.0";
    let flights: FlightJourneyEntity[] = JSON.parse(JSON.stringify(Flights));
    flights = flights.map(fj => {
      if (fj.FlightRoutes) {
        fj.FlightRoutes = fj.FlightRoutes.map(r => {
          if (r.FlightSegments) {
            r.FlightSegments = r.FlightSegments.map(seg => {
              const s = new FlightSegmentEntity();
              s.TakeoffTime = seg.TakeoffTime;
              s.LowestFare = seg.LowestFare;
              s.IsStop = seg.IsStop;
              s.Number = seg.Number;
              if (seg.Cabins) {
                s.Cabins = seg.Cabins.map(fare => {
                  const c = new FlightCabinEntity();
                  c.Discount = fare.Discount;
                  c.Id = fare.Id;
                  c.SalesPrice = fare.SalesPrice || "0";
                  c.Type = fare.Type;
                  c.FlightRouteIds = fare.FlightRouteIds;
                  c.FlightNumber = fare.FlightNumber;
                  c.Code = fare.Code;
                  c.Variables = fare.Variables;
                  c.Rules = fare.Rules;
                  if (fare.LowerSegment) {
                    c.LowerSegment = {} as any;
                    c.LowerSegment.AirlineName = fare.LowerSegment && fare.LowerSegment.AirlineName;
                    c.LowerSegment.LowestFare = fare.LowerSegment && fare.LowerSegment.LowestFare || "0";
                    c.LowerSegment.Number = fare.LowerSegment && fare.LowerSegment.Number;
                    c.LowerSegment.TakeoffTime = fare.LowerSegment && fare.LowerSegment.TakeoffTime;
                  }
                  return c;
                });
              }
              return s;
            });
          }
          return r;
        });
      }
      return fj;
    });
    // console.log(flights);
    req.Data = {
      Flights: JSON.stringify(flights),
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
  sortByPrice(segments: FlightSegmentEntity[], l2h: boolean) {
    if (true || !this.worker) {
      return segments.sort((s1, s2) => {
        let sub = +s1.LowestFare - +s2.LowestFare;
        sub = sub === 0 ? 0 : sub > 0 ? 1 : -1;
        return l2h ? sub : -sub;
      });
    }
  }
  sortByTime(segments: FlightSegmentEntity[], l2h: boolean) {
    if (true || !this.worker) {
      return segments.sort((s1, s2) => {
        let sub = +s1.TakeoffTimeStamp - +s2.TakeoffTimeStamp;
        sub = sub === 0 ? 0 : sub > 0 ? 1 : -1;
        return l2h ? sub : -sub;
      });
    }
  }
  private addoneday(s: FlightSegmentEntity) {
    // const addDay =
    //   moment(s.ArrivalTime, "YYYY-MM-DDTHH:mm:ss").date() -
    //   moment(s.TakeoffTime, "YYYY-MM-DDTHH:mm:ss").date();
    // console.log(addDay);
    const addDay = moment(s.ArrivalTime).diff(moment(s.TakeoffTime), 'days');
    // new Date(s.ArrivalTime).getDate() - new Date(s.TakeoffTime).getDate();
    return addDay > 0 ? "+" + addDay + LanguageHelper.getDayTip() : "";
  }
  getTotalFlySegments(flyJourneys: FlightJourneyEntity[]) {
    console.time("getTotalFlySegments");
    console.log("getTotalFlySegments flyJourneys", flyJourneys);
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
    console.log("getTotalFlySegments", result);
    return result;
  }
  get allLocalAirports() {
    return this.tmcService.allLocalAirports || [];
  }
  private getHHmm(datetime: string) {
    return this.calendarService.getHHmm(datetime);
  }
  async getFlightJourneyDetailListAsync(): Promise<FlightJourneyEntity[]> {
    await this.checkOrAddSelfBookTypeBookInfo();
    const req = new RequestEntity();
    req.Method = "TmcApiFlightUrl-Home-Detail ";
    const data = this.getSearchFlightModel();
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
      .then(res => {
        if (res) {
          return res.map(it => {
            if (it.FlightRoutes) {
              it.FlightRoutes = it.FlightRoutes.map(r => {
                if (r.FlightSegments) {
                  r.FlightSegments = r.FlightSegments.map(s => {
                    return {
                      ...s,
                      ...s["flightSegment"]
                    };
                  });
                }
                return r;
              });
            }
            return it;
          });
        } else {
          return res;
        }
      })
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
        res.Insurances = res.Insurances || {};
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
