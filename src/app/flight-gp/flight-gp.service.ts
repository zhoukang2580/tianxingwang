import { environment } from "src/environments/environment";
import { CalendarService } from "../tmc/calendar.service";
import { CredentialsType } from "../member/pipe/credential.pipe";
import { IdentityEntity } from "../services/identity/identity.entity";
import { CredentialsEntity } from "../tmc/models/CredentialsEntity";
import {
  TmcService,
  PassengerBookInfo,
  InitialBookDtoModel,
  FlightHotelTrainType,
  IBookOrderResult,
  PassengerBookInfoGp,
} from "src/app/tmc/tmc.service";
import {
  ModalController,
  NavController,
  PopoverController,
} from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
import { FlightCabinEntity } from "./models/flight/FlightCabinEntity";
import { FilterConditionModel } from "./models/flight/advanced-search-cond/FilterConditionModel";
import { IdentityService } from "../services/identity/identity.service";
import { HrService, StaffEntity } from "../hr/hr.service";
import { EventEmitter, Injectable } from "@angular/core";
import { Subject, BehaviorSubject, combineLatest } from "rxjs";

import { ApiService } from "../services/api/api.service";
import { FlightJourneyEntity } from "./models/flight/FlightJourneyEntity";
import { FlightSegmentEntity } from "./models/flight/FlightSegmentEntity";
import { RequestEntity } from "../services/api/Request.entity";
import { LanguageHelper } from "../languageHelper";
import { Router } from "@angular/router";
import { TripType } from "../tmc/models/TripType";
import { TrafficlineEntity } from "../tmc/models/TrafficlineEntity";
import {
  PassengerPolicyFlights,
  FlightPolicy,
  IFlightSegmentInfo,
  FlightSegmentModel,
  FrequentBookInfo,
  CardBinsBookInfo,
} from "./models/PassengerFlightInfo";
import { OrderBookDto } from "../order/models/OrderBookDto";
import { DayModel } from "../tmc/models/DayModel";
import { FlightFareEntity } from "./models/FlightFareEntity";
import { FlightResultEntity } from "./models/FlightResultEntity";
import { FlightRouteEntity } from "./models/flight/FlightRouteEntity";
import { BookGpDto } from "./models/flightgp/BookGpDto";
import { AccountEntity } from "./models/flightgp/AccountEntity";
import { PassengerEntity } from "./models/flightgp/PassengerEntity";
import { GpBookReq } from "../order/models/GpBookReq";
import { FlightCityService } from "./flight-city.service";
import { StorageService } from "../services/storage-service.service";
import { LogService } from "../services/log/log.service";

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
  isExchange?: boolean;
  // isRefreshData?: boolean;
}
@Injectable({
  providedIn: "root",
})
export class FlightGpService {
  private identity: IdentityEntity;
  private fetchPassengerCredentials: { promise: Promise<any> };
  private selfCredentials: CredentialsEntity[];
  private searchFlightModelSource: Subject<SearchFlightModel>;
  private passengerBookInfoSource: Subject<
    PassengerBookInfo<IFlightSegmentInfo>[]
  >;
  private passengerBookInfoGpSource: Subject<PassengerBookInfoGp[]>;
  private frequentBookInfoSource: Subject<FrequentBookInfo[]>;
  private cardBinsBookInfoSource: Subject<CardBinsBookInfo[]>;

  private searchFlightModel: SearchFlightModel;
  private filterConditionSources: Subject<FilterConditionModel>;
  private passengerBookInfos: PassengerBookInfo<IFlightSegmentInfo>[]; // 记录乘客及其研究选择的航班

  private passengerBookInfoGp: PassengerBookInfoGp[]; //记录乘客及其研究选择的公务航班

  private frequentBookInfo: FrequentBookInfo[];

  private cardBinsBookInfo: CardBinsBookInfo[]; //记录公务卡

  private isInitializingSelfBookInfos = false;
  private isInitDate = false;
  private filterCondition: FilterConditionModel;
  currentViewtFlightSegment: FlightSegmentEntity;
  policyFlights: PassengerPolicyFlights[];
  flightResult: FlightResultEntity; // 保持和后台返回的数据一致
  private pagePopTimeoutSource: EventEmitter<boolean>;
  private pagePopTimeoutTime = 10 * 60 * 1000;
  private pagePopTimeoutId;
  private lastRefreshTime = 0;
  private pagePopPromise: Promise<boolean>;
  get isAgent() {
    return this.tmcService.isAgent;
  }
  constructor(
    private apiService: ApiService,
    private staffService: HrService,
    private modalCtrl: ModalController,
    private router: Router,
    identityService: IdentityService,
    private tmcService: TmcService,
    private flightCityService: FlightCityService,
    private calendarService: CalendarService,
    private storage: StorageService,
    private logService: LogService
  ) {
    this.searchFlightModel = new SearchFlightModel();
    this.searchFlightModel.tripType = TripType.departureTrip;
    this.searchFlightModelSource = new BehaviorSubject(this.searchFlightModel);
    this.passengerBookInfos = [];
    this.passengerBookInfoGp = [];
    this.frequentBookInfo = [];
    this.cardBinsBookInfo = [];
    this.passengerBookInfoSource = new BehaviorSubject(this.passengerBookInfos);

    this.passengerBookInfoGpSource = new BehaviorSubject(
      this.passengerBookInfoGp
    );

    this.frequentBookInfoSource = new BehaviorSubject(this.frequentBookInfo);

    this.cardBinsBookInfoSource = new BehaviorSubject(this.cardBinsBookInfo);

    this.pagePopTimeoutSource = new EventEmitter();

    this.filterConditionSources = new BehaviorSubject(
      FilterConditionModel.init()
    );
    identityService.getIdentitySource().subscribe((res) => {
      this.identity = res;
      this.isInitDate = !res || !res.Id || !res.Ticket;
      if (res && res.Id && !this.isInitDate) {
        this.isInitDate = true;
        this.initLastSelectDate();
      }
      this.disposal();
    });
  }
  private async initLastSelectDate() {
    if (!this.identity || !this.identity.Id) {
      return;
    }
    const identity = this.identity;
    let lastSelectedGoDate = await this.storage.get(
      `last_selected_flight_goDate_${identity && identity.Id}`
    );
    const nextDate = this.calendarService.getMoment(1).format("YYYY-MM-DD");
    lastSelectedGoDate =
      lastSelectedGoDate &&
      this.calendarService.generateDayModelByDate(lastSelectedGoDate)
        .timeStamp >=
        this.calendarService.generateDayModelByDate(nextDate).timeStamp
        ? lastSelectedGoDate
        : nextDate;
    const lastSelectedBackDate = this.calendarService
      .getMoment(1, lastSelectedGoDate)
      .format("YYYY-MM-DD");
    const s = this.getSearchFlightModel();
    s.Date = lastSelectedGoDate;
    s.BackDate = lastSelectedBackDate;
    this.setSearchFlightModelSource(s);
  }
  async initSelfBookTypeBookInfos(isShowLoading = true) {
    await this.checkOrAddSelfBookTypeBookInfo(isShowLoading);
    // await this.loadPolicyedFlightsAsync(this.flightResult);
  }
  private disposal() {
    this.setSearchFlightModelSource(new SearchFlightModel());
    this.removeAllBookInfos();
    this.selfCredentials = null;
    this.isInitializingSelfBookInfos = false;
    this.identity = null;
  }
  getFilterCondition() {
    return this.filterCondition;
  }
  setSearchFlightModelSource(m: SearchFlightModel) {
    console.log("setSearchFlightModel", m);
    this.searchFlightModel = m;
    if (m && m.toCity && m.fromCity) {
      this.searchFlightModel.ToCode = m.ToAsAirport
        ? m.toCity.Code
        : m.toCity.AirportCityCode;
      this.searchFlightModel.FromCode = m.FromAsAirport
        ? m.fromCity.Code
        : m.fromCity.AirportCityCode;
    }
    if (m.isExchange) {
      m.isLocked = true;
    }
    this.searchFlightModelSource.next(this.searchFlightModel);
  }
  getSearchFlightModel() {
    return { ...(this.searchFlightModel || new SearchFlightModel()) };
  }
  getSearchFlightModelSource() {
    return this.searchFlightModelSource.asObservable();
  }
  setPassengerBookInfosSource(args: PassengerBookInfo<IFlightSegmentInfo>[]) {
    console.log("flight setPassengerBookInfos", args);
    this.passengerBookInfos = args;
    this.passengerBookInfoSource.next(this.passengerBookInfos.slice(0));
  }

  setPassengerBookInfoGpSource(args: PassengerBookInfoGp[]) {
    console.log("flight setPassengerBookInfos", args);
    this.passengerBookInfoGp = args;
    this.passengerBookInfoGpSource.next(this.passengerBookInfoGp.slice(0));
  }

  setfrequentBookInfoSource(args: FrequentBookInfo[]) {
    console.log("flight setPassengerBookInfos", args);
    this.frequentBookInfo = args;
    this.frequentBookInfoSource.next(this.frequentBookInfo.slice(0));
  }

  setCardBinsBookInfoSource(args: CardBinsBookInfo[]) {
    console.log("flight CardBinsBookInfo", args);
    this.cardBinsBookInfo = args;
    this.cardBinsBookInfoSource.next(this.cardBinsBookInfo.slice(0));
  }

  getPassengerBookInfoSource() {
    return this.passengerBookInfoSource.asObservable();
  }

  getPassengerBookInfoGpSource() {
    return this.passengerBookInfoGpSource.asObservable();
  }

  getfrequentBookInfoSource() {
    return this.frequentBookInfoSource.asObservable();
  }

  getCardBinsBookInfoSource() {
    return this.cardBinsBookInfoSource.asObservable();
  }

  filterPassengerPolicyCabins({
    data,
    flightSegment,
  }: {
    data: PassengerBookInfo<IFlightSegmentInfo>;
    flightSegment: FlightSegmentEntity;
  }) {
    let policyCabins: FlightPolicy[] = [];
    if (!flightSegment || !flightSegment.Cabins) {
      return policyCabins;
    }
    const cabins = JSON.parse(JSON.stringify(flightSegment.Cabins)) || [];
    policyCabins = cabins.map((it) => {
      return {
        Cabin: it,
        OrderTravelPayNames:
          it.FlightPolicy && it.FlightPolicy.OrderTravelPayNames,
        OrderTravelPays: it.FlightPolicy && it.FlightPolicy.OrderTravelPays,
        FlightNo: flightSegment.Number,
        Id: it.Id,
        CabinCode: it.Code,
        IsAllowBook: true,
        Discount: it.Discount,
        LowerSegment: it.LowerSegment,
        Rules: [],
        color: "secondary",
      } as FlightPolicy;
    });
    if (
      false &&
      data &&
      data.passenger &&
      data.passenger.AccountId &&
      data.isFilterPolicy
    ) {
      this.policyFlights = this.policyFlights || [];
      const one = this.policyFlights.find(
        (item) => item.PassengerKey == data.passenger.AccountId
      );
      if (one) {
        policyCabins = one.FlightPolicies.filter(
          (pc) => pc.FlightNo == flightSegment.Number
        );
        policyCabins = policyCabins.map((it) => {
          if (!it.Rules || it.Rules.length == 0) {
            it.color = "success";
          } else {
            it.color = "warning";
          }
          if (!it.IsAllowBook) {
            it.color = "danger";
          }
          return it;
        });
        policyCabins = policyCabins.map((it) => {
          const fc =
            flightSegment.Cabins &&
            flightSegment.Cabins.find((f) => f.Id == it.Id);
          if (fc) {
            it.Cabin = { ...fc };
            if (fc.FlightPolicy) {
              it.OrderTravelPayNames = fc.FlightPolicy.OrderTravelPayNames;
              it.OrderTravelPays = fc.FlightPolicy.OrderTravelPays;
            }
          }
          return it;
        });
      }
      // this.setPassengerBookInfosSource(
      //   this.getPassengerBookInfos().map(it => {
      //     it.isFilteredPolicy = it.id == data.id;
      //     return it;
      //   })
      // );
    } else {
      this.setPassengerBookInfosSource(
        this.getPassengerBookInfos().map((it) => {
          it.isFilterPolicy = false;
          return it;
        })
      );
    }
    console.log("filterPassengerPolicyCabins", policyCabins);
    return policyCabins;
  }

  private getUnSelectFlightSegmentPassengers() {
    return this.getPassengerBookInfos()
      .filter(
        (item) =>
          !item.bookInfo ||
          !item.bookInfo.flightSegment ||
          !item.bookInfo.flightPolicy
      )
      .map((item) => item.passenger)
      .reduce((arr, item) => {
        if (!arr.find((i) => i.AccountId == item.AccountId)) {
          arr.push(item);
        }
        return arr;
      }, [] as StaffEntity[]);
  }

  getPassengerBookInfos() {
    this.passengerBookInfos = this.passengerBookInfos || [];
    return this.passengerBookInfos;
  }

  getPassengerBookInfosGp() {
    this.passengerBookInfoGp = this.passengerBookInfoGp || [];
    return this.passengerBookInfoGp;
  }

  getfrequentBookInfo() {
    this.frequentBookInfo = this.frequentBookInfo || [];
    return this.frequentBookInfo;
  }

  getCardBinsBookInfo() {
    this.cardBinsBookInfo = this.cardBinsBookInfo || [];
    return this.cardBinsBookInfo;
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
    this.setPassengerBookInfosSource(infos);
  }

  addFrequentBookInfo(arg: FrequentBookInfo) {
    console.log("addPassengerFlightSegments", arg);
    const infos = this.getfrequentBookInfo();
    infos.push(arg);
    console.log("addPassengerFlightSegments added", arg);
    this.setfrequentBookInfoSource(infos);
  }

  updataFrequentBookInfo(arg: FrequentBookInfo) {
    console.log("addPassengerFlightSegments", arg);
    let infos = this.getfrequentBookInfo();
    if (infos.length > 1) {
      infos = infos.filter(
        (it) => it.passengerEntity.Id != arg.passengerEntity.Id
      );
    } else {
      infos = [];
    }
    infos.push(arg);
    console.log("addPassengerFlightSegments added", arg);
    this.setfrequentBookInfoSource(infos);
  }

  openCalendar(isMulti: boolean, tripType?: TripType) {
    const goFlight = this.getPassengerBookInfos().find(
      (f) => f.bookInfo && f.bookInfo.tripType == TripType.departureTrip
    );
    const backFlight = this.getPassengerBookInfos().find(
      (f) => f.bookInfo && f.bookInfo.tripType == TripType.returnTrip
    );
    let s = this.getSearchFlightModel();
    if (s.isRoundTrip) {
      if (goFlight) {
        this.setSearchFlightModelSource({
          ...s,
          tripType: TripType.returnTrip,
        });
      }
    }
    s = this.getSearchFlightModel();
    let goArrivalTime: string | number = this.calendarService
      .getMoment(0)
      .format("YYYY-MM-DD");
    if (tripType == TripType.returnTrip || goFlight) {
      if (!goFlight) {
        goArrivalTime = this.calendarService
          .getMoment(0, s && s.Date)
          .format("YYYY-MM-DD");
      } else {
        if (
          goFlight &&
          goFlight.bookInfo &&
          goFlight.bookInfo.flightSegment &&
          goFlight.bookInfo.flightSegment.ArrivalTime
        ) {
          goArrivalTime = goFlight.bookInfo.flightSegment.ArrivalTime;
        }
      }
    }
    tripType = tripType || s.tripType || TripType.departureTrip;
    return this.calendarService.openCalendar({
      goArrivalTime,
      tripType,
      forType: FlightHotelTrainType.Flight,
      isMulti,
      beginDate: s.Date,
      endDate: s.isRoundTrip ? s.BackDate : "",
    });
  }

  private async reselectSelfBookTypeSegment(
    arg: PassengerBookInfo<IFlightSegmentInfo>
  ) {
    if (!(await this.staffService.isSelfBookType())) {
      return;
    }
    const s = this.getSearchFlightModel();
    if (arg.bookInfo.tripType == TripType.returnTrip) {
      // 重选回程
      this.setPassengerBookInfosSource(
        this.getPassengerBookInfos().map((info) => {
          info.bookInfo = info.id == arg.id ? null : info.bookInfo;
          return info;
        })
      );
      await this.onSelectReturnTrip();
    } else {
      this.apiService.showLoadingView({ msg: "" });
      // 重选去程
      const airports = await this.getAllLocalAirports();
      s.Date = arg.bookInfo.flightSegment.TakeoffTime.substr(
        0,
        "2019-10-11".length
      );
      s.FromAsAirport = false;
      s.ToAsAirport = false;
      s.FromCode = arg.bookInfo.flightSegment.FromAirport;
      s.ToCode = arg.bookInfo.flightSegment.ToAirport;
      s.tripType = TripType.departureTrip;
      s.isLocked = false;
      s.fromCity = airports.find((c) => c.Code == s.FromCode);
      s.toCity = airports.find((c) => c.Code == s.ToCode);
      let arr = this.getPassengerBookInfos().map((item) => {
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
    this.setPassengerBookInfosSource(this.getPassengerBookInfos());
    await this.dismissAllTopOverlays();
    this.apiService.hideLoadingView();
    this.setSearchFlightModelSource(s);
    this.router.navigate([AppHelper.getRoutePath("flight-list-gp")], {
      queryParams: {
        doRefresh: true,
      },
    });
  }
  private async reselectNotSelfBookTypeSegments(
    arg: PassengerBookInfo<IFlightSegmentInfo>
  ) {
    if (!arg || !arg.bookInfo || !arg.bookInfo.flightSegment) {
      return;
    }
    const s = this.getSearchFlightModel();
    this.apiService.showLoadingView({ msg: "" });
    const cities = await this.getAllLocalAirports();
    s.tripType = TripType.departureTrip;
    s.Date = arg.bookInfo.flightSegment.TakeoffTime.substr(
      0,
      "yyyy-mm-dd".length
    );
    s.fromCity = cities.find(
      (it) => it.Code == arg.bookInfo.flightSegment.FromAirport
    );
    s.toCity = cities.find(
      (it) => it.Code == arg.bookInfo.flightSegment.ToAirport
    );
    s.FromAsAirport = false;
    s.ToAsAirport = false;
    await this.dismissAllTopOverlays();
    this.setSearchFlightModelSource(s);
    this.apiService.hideLoadingView();
    this.router.navigate([AppHelper.getRoutePath("flight-list-gp")], {
      queryParams: { doRefresh: true },
    });
  }
  async reselectPassengerFlightSegments(
    info: PassengerBookInfo<IFlightSegmentInfo>
  ) {
    console.log("reselectPassengerFlightSegments", info);
    if (!info || !info.bookInfo) {
      return false;
    }
    const arg = JSON.parse(JSON.stringify(info));
    this.setPassengerBookInfosSource(
      this.getPassengerBookInfos().map((it) => {
        it.isReselect = it.id == arg.id;
        if (it.id == arg.id) {
          it.bookInfo = null;
        }
        return it;
      })
    );
    if (await this.staffService.isSelfBookType()) {
      if (arg.bookInfo.originalBookInfo) {
        await this.reselectSelfBookTypeSegment(arg.bookInfo.originalBookInfo);
      } else {
        await this.reselectSelfBookTypeSegment(arg);
      }
    } else {
      if (arg.bookInfo.originalBookInfo) {
        await this.reselectNotSelfBookTypeSegments(
          arg.bookInfo.originalBookInfo
        );
      } else {
        await this.reselectNotSelfBookTypeSegments(arg);
      }
    }
    console.log("getPassengerBookInfos", this.getPassengerBookInfos());
  }
  private async addOrRelaceSelf(
    flightCabin: FlightCabinEntity,
    flightSegment: FlightSegmentEntity
  ) {
    const result = {
      isSelfBookType: true,
      isReplace: false,
      isProcessOk: false,
      isReselect: false,
    };
    const s = this.getSearchFlightModel();
    let bookInfos = this.getPassengerBookInfos();
    if (!bookInfos.length) {
      await this.addOneBookInfoToSelfBookType();
      // await this.loadPolicyedFlightsAsync(this.flightResult);
    }
    bookInfos = this.getPassengerBookInfos();
    if (!bookInfos.length) {
      AppHelper.alert("信息加载失败，请重试");
      return;
    }
    if (s.isRoundTrip) {
      const go = bookInfos.find(
        (it) => it.bookInfo && it.bookInfo.tripType == TripType.departureTrip
      );
      const info = this.getPolicyCabinBookInfo(
        bookInfos[0],
        flightCabin,
        flightSegment
      );
      if (!info) {
        return result;
      }
      if (info.isDontAllowBook) {
        if (!this.tmcService.isAgent) {
          AppHelper.alert("超标不可预订");
          return result;
        }
      }
      info.tripType = s.tripType;
      if (info.lowerSegmentInfo) {
        info.lowerSegmentInfo.tripType = s.tripType;
      }
      if (go) {
        if (s.tripType == TripType.departureTrip) {
          bookInfos = [
            { ...go, bookInfo: info },
            { ...go, bookInfo: null, id: AppHelper.uuid() },
          ];
        } else {
          // 判断机场
          const showTip =
            flightSegment.FromAirport != go.bookInfo.flightSegment.ToAirport;
          if (showTip) {
            const isOk = await AppHelper.alert(
              `回程航班出发机场与去程航班抵达机场不同`,
              true,
              "继续",
              "重选"
            );
            if (!isOk) {
              result.isReselect = true;
              return result;
            }
          }
          bookInfos = [go, { ...go, bookInfo: info, id: AppHelper.uuid() }];
        }
      } else {
        info.tripType = TripType.departureTrip;
        bookInfos = [
          { ...bookInfos[0], bookInfo: info },
          { ...bookInfos[0], bookInfo: null, id: AppHelper.uuid() },
        ];
      }
      this.setPassengerBookInfosSource(bookInfos);
      result.isProcessOk = true;
    } else {
      bookInfos = [bookInfos[0]];
      const info = this.getPolicyCabinBookInfo(
        bookInfos[0],
        flightCabin,
        flightSegment
      );
      if (!info) {
        return result;
      }
      if (info.isDontAllowBook) {
        if (!this.tmcService.isAgent) {
          AppHelper.alert("超标不可预订");
          return result;
        }
      }
      bookInfos[0].bookInfo = info;
      this.setPassengerBookInfosSource(bookInfos);
      result.isProcessOk = true;
    }
    return result;
  }

  checkIfCabinIsAllowBook(
    bookInfo: PassengerBookInfo<IFlightSegmentInfo>,
    flightCabin: FlightCabinEntity,
    flightSegment: FlightSegmentEntity
  ) {
    if (this.isAgent) {
      return true;
    }
    const info = this.getPolicyCabinBookInfo(
      bookInfo,
      flightCabin,
      flightSegment
    );
    return info && !info.isDontAllowBook;
  }
  getPolicyCabinBookInfo(
    bookInfo: PassengerBookInfo<IFlightSegmentInfo>,
    flightCabin: FlightCabinEntity,
    flightSegment: FlightSegmentEntity
  ): IFlightSegmentInfo {
    if (!bookInfo || !flightCabin || !flightSegment) {
      return null;
    }
    if (bookInfo.exchangeInfo) {
      const info = {
        flightSegment,
        flightPolicy: {
          Cabin: flightCabin,
          CabinCode: flightCabin.Code,
          IsAllowBook: true,
        },
        tripType: TripType.departureTrip,
        id: AppHelper.uuid(),
      } as IFlightSegmentInfo;
      return info;
    }
    this.policyFlights = this.policyFlights || [];
    const passengerPolicies = this.policyFlights.find(
      (itm) => itm.PassengerKey == bookInfo.passenger.AccountId
    );
    if (passengerPolicies && passengerPolicies.FlightPolicies) {
      const flihgtPolicyCabin = passengerPolicies.FlightPolicies.filter(
        (item) => flightCabin.FlightNumber == item.FlightNo
      ).find((item) => item.Id == flightCabin.Id);
      if (flihgtPolicyCabin) {
        if (flightSegment.Cabins) {
          const c = flightSegment.Cabins.find(
            (c) => c.Id == flihgtPolicyCabin.Id
          );
          flihgtPolicyCabin.Cabin = {
            ...c,
          };
        }
        let tripType = TripType.departureTrip;
        if (this.getSearchFlightModel().isRoundTrip) {
          const go = this.getPassengerBookInfos().find(
            (it) =>
              it.bookInfo && it.bookInfo.tripType == TripType.departureTrip
          );
          if (go) {
            tripType = TripType.returnTrip;
          }
        }
        const info = {
          flightSegment: { ...flightSegment },
          flightPolicy: { ...flihgtPolicyCabin },
          tripType,
          id: AppHelper.uuid(),
        } as IFlightSegmentInfo;
        if (!flihgtPolicyCabin.IsAllowBook) {
          info.isDontAllowBook = true;
        }
        if (this.isAgent) {
          info.isDontAllowBook = false;
        }
        info.lowerSegmentInfo = this.getLowerFlight({
          ...bookInfo,
          bookInfo: { ...bookInfo.bookInfo, ...info },
        });
        return info;
      }
    }
    return null;
  }
  async dismissTopOverlay() {
    const t = await this.modalCtrl.getTop();
    if (t) {
      t.dismiss().catch((_) => 0);
    }
  }
  // showSelectedBookInfosPage() {
  //   this.router.navigate([AppHelper.getRoutePath("gp-flight-bookinfos")]);
  // }
  async dismissAllTopOverlays() {
    console.time("dismissAllTopOverlays");
    let top = await this.modalCtrl.getTop();
    let i = 10;
    while (top && --i > 0) {
      // console.log("onSelectReturnTrip", top);
      await top.dismiss().catch((_) => {});
      top = await this.modalCtrl.getTop();
    }
    console.timeEnd("dismissAllTopOverlays");
    return true;
  }
  removeAllBookInfos() {
    this.passengerBookInfos = [];
    this.setPassengerBookInfosSource(this.getPassengerBookInfos());
    this.setSearchFlightModelSource({
      ...this.getSearchFlightModel(),
      tripType: TripType.departureTrip,
      isLocked: false,
      isExchange: false,
    });
  }
  async onSelectReturnTrip() {
    console.log("onSelectReturnTrip");
    // await this.dismissAllTopOverlays();
    let s = this.getSearchFlightModel();
    const airports = await this.getAllLocalAirports();
    let bookInfos = this.getPassengerBookInfos();
    const goflightBookInfo = bookInfos.find(
      (item) =>
        item.bookInfo && item.bookInfo.tripType == TripType.departureTrip
    );
    if (
      bookInfos.filter((it) => !!it.bookInfo).length < 2 &&
      goflightBookInfo
    ) {
      this.setPassengerBookInfosSource([
        goflightBookInfo,
        { ...goflightBookInfo, bookInfo: null, id: AppHelper.uuid() },
      ]);
    }
    bookInfos = this.getPassengerBookInfos();
    s.tripType = TripType.returnTrip;
    this.setSearchFlightModelSource(s);
    s = this.getSearchFlightModel();
    if (
      !goflightBookInfo ||
      !goflightBookInfo.bookInfo ||
      !goflightBookInfo.bookInfo.flightSegment
    ) {
      AppHelper.alert(LanguageHelper.Flight.getPlsSelectGoFlightTip());
      return;
    }
    const goflight = goflightBookInfo.bookInfo.flightSegment;
    const fromCity = airports.find((c) => c.Code == goflight.FromAirport);
    const toCity = airports.find((c) => c.Code == goflight.ToAirport);
    // const goDay = moment(goflight.ArrivalTime);
    // let backDay = moment(s.BackDate);
    // if (+backDay < +moment(goDay.format("YYYY-MM-DD"))) {
    //   backDay = goDay;
    // }
    // s.BackDate = backDay.format("YYYY-MM-DD");
    this.setSearchFlightModelSource({
      ...s,
      FromCode: toCity.AirportCityCode,
      ToCode: fromCity.AirportCityCode,
      ToAsAirport: false,
      FromAsAirport: false,
      fromCity: { ...toCity },
      toCity: { ...fromCity },
      Date: s.BackDate,
      tripType: TripType.returnTrip,
      isLocked: true,
    });
    this.router.navigate([AppHelper.getRoutePath("flight-list-gp")], {
      queryParams: {
        doRefresh: true,
      },
    });
    this.dismissAllTopOverlays();
  }
  async addOneBookInfoToSelfBookType(isShowLoading = false) {
    console.log("addOneBookInfoToSelfBookType");
    let IdCredential: CredentialsEntity;
    const staff: StaffEntity = await this.staffService
      .getStaff(false, isShowLoading)
      .catch((_) => null);
    if (!staff || !staff.AccountId) {
      return;
    }
    if (this.getPassengerBookInfos().length) {
      return;
    }
    if (!(await this.staffService.isSelfBookType(isShowLoading))) {
      return;
    }
    if (!this.selfCredentials || this.selfCredentials.length == 0) {
      const res = await this.tmcService
        .getPassengerCredentials([staff.AccountId])
        .catch((_) => ({ [staff.AccountId]: [] }));
      this.selfCredentials = res[staff.AccountId];
    }
    if (this.isInitializingSelfBookInfos) {
      return;
    }
    this.isInitializingSelfBookInfos = true;
    IdCredential =
      this.selfCredentials &&
      this.selfCredentials.find((c) => c.Type == CredentialsType.IdCard);
    const info = {
      passenger: staff,
      credential:
        IdCredential ||
        (this.selfCredentials &&
          this.selfCredentials.length &&
          this.selfCredentials[0]) ||
        new CredentialsEntity(),
    };
    this.addPassengerBookInfo(info);
    this.isInitializingSelfBookInfos = false;
  }
  private async checkOrAddSelfBookTypeBookInfo(isShowLoading = true) {
    const bookInfos = this.getPassengerBookInfos();
    const isSelf = await this.staffService.isSelfBookType(isShowLoading);
    if (isSelf && bookInfos.length === 0) {
      await this.addOneBookInfoToSelfBookType(isShowLoading);
    }
    if (
      isSelf &&
      this.getSearchFlightModel().isRoundTrip &&
      bookInfos.length == 1
    ) {
      this.setPassengerBookInfosSource([
        bookInfos[0],
        { ...bookInfos[0], bookInfo: null },
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
    arr = arr.map((item) => {
      if (item.id === old.id) {
        // newInfo.isFilteredPolicy = old.isFilteredPolicy;
        // newInfo.isAllowBookPolicy = old.isAllowBookPolicy;
        newInfo.isFilterPolicy = old.isFilterPolicy;
        return newInfo;
      }
      return item;
    });
    this.setPassengerBookInfosSource(arr);
  }
  async removePassengerBookInfo(
    p: PassengerBookInfo<IFlightSegmentInfo>,
    isRemovePassenger: boolean
  ) {
    const arg = { ...p };
    const isSelf = await this.staffService.isSelfBookType();
    if (isSelf) {
      if (arg.bookInfo) {
        if (arg.bookInfo.tripType == TripType.returnTrip) {
          this.passengerBookInfos = this.getPassengerBookInfos().filter(
            (it) => it.id !== arg.id
          );
        }
        if (arg.bookInfo.tripType == TripType.departureTrip) {
          this.passengerBookInfos = this.getPassengerBookInfos().map((item) => {
            item.bookInfo = null;
            return item;
          });
          this.setSearchFlightModelSource({
            ...this.getSearchFlightModel(),
            isLocked: false,
            tripType: TripType.departureTrip,
          });
        }
      }
    } else {
      if (isRemovePassenger) {
        this.passengerBookInfos = this.getPassengerBookInfos().filter(
          (it) => it.id != arg.id
        );
      } else {
        this.passengerBookInfos = this.getPassengerBookInfos().map((it) => {
          it.bookInfo = it.id == arg.id ? null : it.bookInfo;
          return it;
        });
      }
    }
    this.setPassengerBookInfosSource(this.passengerBookInfos);
  }
  setFilterConditionSource(advSCond: FilterConditionModel) {
    this.filterCondition = advSCond;
    this.filterConditionSources.next(advSCond);
  }
  getFilterConditionSource() {
    return this.filterConditionSources.asObservable();
  }
  async getDomesticAirports(forceFetch: boolean = false) {
    return this.tmcService.getDomesticAirports(forceFetch);
  }
  async getInternationalAirports(forceFetch: boolean = false) {
    return this.tmcService.getInternationalAirports(forceFetch);
  }
  async initFlightSegmentCabins(s: FlightSegmentEntity) {
    try {
      const result = await this.getFlightSegmentDetail(s);
      this.replaceOldFlightSegmentInfo(result, s);
    } catch (e) {
      console.error(e);
    }
  }
  async initFlightSegmentCabinsPolicy() {
    // await this.loadPolicyedFlightsAsync(this.flightResult);
    return this.policyFlights;
  }
  async getFlightSegmentDetail(s: FlightSegmentEntity) {
    let ADTPtcs = this.getPassengerBookInfos().length;
    const isSelf = await this.staffService.isSelfBookType();
    if (isSelf) {
      ADTPtcs = 1;
    }
    if (ADTPtcs > 9) {
      AppHelper.alert("添加的乘客数量不能超过9个");
      return;
    }
    const req = new RequestEntity();
    req.Method = `TmcApiFlightGpUrl-Home-Detail`;
    req.Version = "2.0";
    req.IsShowLoading = true;
    req.LoadingMsg = "正在获取详情";
    const search = this.searchFlightModel;
    req.Data = {
      Date: search.Date,
      FromCode: s.FromAirport,
      ToCode: s.ToAirport,
      FlightNumber: s.Number,
      FromAsAirport: search.FromAsAirport,
      ToAsAirport: search.ToAsAirport,
      ADTPtcs,
    };
    if (s.Variables && s.Variables.SearchDetailArg) {
      req.Data.DetailKey = s.Variables.SearchDetailArg;
    }
    if (req.Language) {
      req.Data.Lang = req.Language;
    }
    // this.stopCheckPageTimout();
    return this.apiService.getPromiseData<FlightResultEntity>(req).then((r) => {
      this.lastRefreshTime = Date.now();
      return r;
    });
  }
  private replaceOldFlightSegmentInfo(
    result: FlightResultEntity,
    curSelectedSeg: FlightSegmentEntity
  ) {
    const oldSeg = curSelectedSeg;
    if (result && result.FlightSegments) {
    }
    if (
      this.flightResult &&
      this.flightResult.FlightSegments &&
      result &&
      result.FlightFares &&
      result.FlightSegments
    ) {
      const one = this.flightResult.FlightSegments.find(
        (it) => it.Number == oldSeg.Number
      );
      // 替换最低价
      const newSeg = result.FlightSegments.find(
        (it) => it.Number == oldSeg.Number
      );
      if (newSeg) {
        oldSeg.LowestFare = newSeg.LowestFare;
        oldSeg.Cabins = result.FlightFares as any;
        oldSeg.Tax = newSeg.Tax;
        oldSeg.PlaneAge = newSeg.PlaneAge;
        oldSeg.FlightDynamicPlaneType =
          newSeg.PlaneTypeDescribe || newSeg.PlaneType;
        oldSeg.TakeoffOntimeRate = newSeg.TakeoffOntimeRate;
        oldSeg.AverageDelay = newSeg.AverageDelay;
        oldSeg.FlightRule = newSeg.FlightRule;
      }
      if (one) {
        console.log("替换信息");
        one.Cabins = oldSeg.Cabins;
        one.Tax = oldSeg.Tax;
        one.LowestFare = oldSeg.LowestFare;
      }
    }
  }

  sortByPrice(segments: FlightSegmentEntity[], l2h: boolean) {
    return segments.sort((s1, s2) => {
      let sub = +s1.LowestFare - +s2.LowestFare;
      sub = sub === 0 ? 0 : sub > 0 ? 1 : -1;
      return l2h ? sub : -sub;
    });
  }
  sortByTime(segments: FlightSegmentEntity[], l2h: boolean) {
    return segments.sort((s1, s2) => {
      let sub = +s1.TakeoffTimeStamp - +s2.TakeoffTimeStamp;
      sub = sub === 0 ? 0 : sub > 0 ? 1 : -1;
      return l2h ? sub : -sub;
    });
  }
  private getDate(date: string) {
    return +date.substr(8, 2);
  }
  private addoneday(s: FlightSegmentEntity) {
    let addDay = Math.floor(
      (s.ArrivalTimeStamp - s.TakeoffTimeStamp) / 86400000
    );
    const arrivalDay = this.getDate(s.ArrivalTime);
    const takeOffDay = this.getDate(s.TakeoffTime);
    if (arrivalDay - takeOffDay) {
      addDay += 1;
    }
    return addDay >= 1 ? `+${addDay}${LanguageHelper.getDayTip()}` : "";
  }
  getTotalFlySegments() {
    return this.getFlightSegments(this.flightResult);
  }
  private getFlightSegments(r: FlightResultEntity) {
    console.log("getTotalFlySegments flyJourneys", r);
    const result: FlightSegmentEntity[] = [];
    try {
      if (r && r.FlightSegments) {
        for (const seg of r.FlightSegments) {
          seg.TakeoffTimeStamp = AppHelper.getDate(seg.TakeoffTime).getTime();
          seg.ArrivalTimeStamp = AppHelper.getDate(seg.ArrivalTime).getTime();
          seg.TakeoffShortTime = this.getHHmm(seg.TakeoffTime);
          seg.ArrivalShortTime = this.getHHmm(seg.ArrivalTime);
          if (seg.AirlineSrc) {
            seg.AirlineSrc = seg.AirlineSrc.toLowerCase();
          }
          seg.AddOneDayTip = this.addoneday(seg);
          result.push({ ...seg });
        }
      }
    } catch (e) {
      console.error(e);
    }
    console.log("getTotalFlySegments", result);
    return result;
  }
  get allLocalAirports() {
    return this.tmcService.allLocalAirports || [];
  }
  private getHHmm(datetime: string) {
    return this.calendarService.getHHmm(datetime);
  }
  getLowerFlight(info: PassengerBookInfo<IFlightSegmentInfo>) {
    let result: {
      lowestCabin: FlightPolicy;
      originalLowerSegment: FlightSegmentModel;
      lowestFlightSegment: FlightSegmentEntity;
      tripType: TripType;
    } = {
      lowestCabin: null,
      lowestFlightSegment: null,
      tripType: null,
      originalLowerSegment: null,
    };
    if (
      !info ||
      !info.bookInfo ||
      !info.bookInfo.flightPolicy ||
      !info.bookInfo.flightPolicy.LowerSegment
    ) {
      return result;
    }
    // if (info.bookInfo.lowerSegmentInfo) {
    //   AppHelper.alert("已经选择过更低航班");
    //   return;
    // }
    const data = info.bookInfo;
    const flights = this.getTotalFlySegments();
    const onePolicyFlights = this.policyFlights.find(
      (item) => item.PassengerKey == info.passenger.AccountId
    );
    const lowestFlightSegment = flights.find(
      (fs) => fs.Number == data.flightPolicy.LowerSegment.Number
    );
    if (
      !lowestFlightSegment ||
      !onePolicyFlights ||
      !onePolicyFlights.FlightPolicies
    ) {
      return result;
    }
    result = {
      lowestCabin: null,
      lowestFlightSegment: { ...lowestFlightSegment },
      tripType: TripType.departureTrip,
      originalLowerSegment: info.bookInfo.flightPolicy.LowerSegment,
    };
    return result;
  }
  async getFlightJourneyDetailListAsync(loadDataFromServer: boolean) {
    if (!loadDataFromServer) {
      if (
        this.flightResult &&
        this.flightResult.FlightSegments &&
        this.flightResult.FlightSegments.length
      ) {
        return Promise.resolve(this.flightResult);
      }
    }
    this.flightResult = await this.getFlightList();
    return this.flightResult || [];
  }
  private async setDefaultFilterInfo() {
    const self = await this.staffService.isSelfBookType();
    const infos = this.getPassengerBookInfos();
    const unselected = infos.filter((it) => !it.bookInfo);
    const isReselect = infos.find((it) => it.isReselect);
    this.setPassengerBookInfosSource(
      infos.map((it, idx) => {
        if (infos.length == 1 || self) {
          it.isFilterPolicy = idx == 0;
        } else {
          it.isFilterPolicy =
            (unselected.length == 1 && unselected[0].id == it.id) ||
            (isReselect && isReselect.id == it.id);
        }
        return it;
      })
    );
  }
  private async getFlightList() {
    this.stopCheckPageTimout();
    await this.checkOrAddSelfBookTypeBookInfo();
    await this.setDefaultFilterInfo();
    await this.dismissAllTopOverlays();
    const req = new RequestEntity();
    req.Method = "TmcApiFlightGpUrl-Home-Index";
    const data = this.getSearchFlightModel();
    req.Data = {
      Date: data.Date, //  Yes 航班日期（yyyy-MM-dd）
      FromCode: data.FromCode, //  Yes 三字代码
      ToCode: data.ToCode, //  Yes 三字代码
      FromAsAirport: data.FromAsAirport, //  No 始发以机场查询
      ToAsAirport: data.ToAsAirport, //  No 到达以机场查询
    };
    req.Version = "2.0";
    req.IsShowLoading = true;
    req.Timeout = 60;
    const serverFlights = await this.apiService
      .getPromiseData<FlightResultEntity>(req)
      .then((r) => {
        if (r.FlightSegments) {
          r.FlightSegments = r.FlightSegments.filter((seg) => {
            const now = new Date().getTime() + 45 * 60 * 1000;
            return (
              Math.floor(AppHelper.getDate(seg.TakeoffTime).getTime()) >=
              Math.floor(now)
            );
          }).map((s) => {
            return {
              ...s,
              ...s["flightSegment"],
            };
          });
        }
        this.startCheckPageTimeout();
        return r;
      })
      .catch((_) => {
        AppHelper.alert(_);
        return null as FlightResultEntity;
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
  async getTravelNDCFlightCabinRuleResult(flightCabin: FlightFareEntity) {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Flight-GetTravelNDCFlightCabinRuleResult";
    req.Data = {
      FlightCabin: flightCabin,
    };
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService.getPromiseData<string>(req);
  }

  async bookGpFlight(bookDto: GpBookReq): Promise<IBookOrderResult> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-FlightGp-Book";

    req.Data = bookDto;
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService.getPromiseData<IBookOrderResult>(req).then((r) => {
      if (r && r.TradeNo && r.TradeNo == "0") {
        this.logService.addException({
          Tag: `GP机票订单下单异常 返回的订单号${r.TradeNo}`,
          Error: r,
          Method: req.Method,
          Message: r.Message,
        });
      }
      return r;
    });
  }

  async getPassengerCredentials(
    accountIds: string[]
  ): Promise<{ [accountId: string]: CredentialsEntity[] }> {
    if (
      this.fetchPassengerCredentials &&
      this.fetchPassengerCredentials.promise
    ) {
      return this.fetchPassengerCredentials.promise;
    }
    this.fetchPassengerCredentials = {
      promise: this.tmcService
        .getPassengerCredentials(accountIds)
        .finally(() => {
          this.fetchPassengerCredentials = null;
        }),
    };
    return this.fetchPassengerCredentials.promise;
  }

  private checkIfCurPageShouldShowTimeoutPop(curShowTipPageRouteUrl: string) {
    if (curShowTipPageRouteUrl && curShowTipPageRouteUrl.startsWith("/")) {
      curShowTipPageRouteUrl = AppHelper.getNormalizedPath(
        curShowTipPageRouteUrl
      );
    }
    return (
      AppHelper.getNormalizedPath(this.router.url).toLowerCase() ==
      (curShowTipPageRouteUrl || "").toLowerCase()
    );
  }

  checkIfTimeout() {
    return Date.now() - this.lastRefreshTime >= this.pagePopTimeoutTime;
  }

  async showTimeoutPop(
    isClearSelectedBookInfos: boolean,
    curShowTipPageRouteUrl: string
  ) {
    this.stopCheckPageTimout();
    const isShow = this.checkIfCurPageShouldShowTimeoutPop(
      curShowTipPageRouteUrl
    );
    if (!isShow) {
      return false;
    }
    if (!this.pagePopPromise) {
      this.pagePopPromise = this.tmcService
        .showTimeoutPop()
        .then((r) => {
          r.present();
          return r.onDidDismiss().then(() => {
            if (isClearSelectedBookInfos) {
              this.clearSelectedBookInfos([]);
            }
            return true;
          });
        })
        .finally(() => {
          this.pagePopPromise = null;
        });
    }
    return this.pagePopPromise;
  }
  clearSelectedBookInfos(
    selectedBookInfos: PassengerBookInfo<IFlightSegmentInfo>[]
  ) {
    this.passengerBookInfos = this.passengerBookInfos || [];
    this.passengerBookInfos.forEach((it) => {
      if (selectedBookInfos && selectedBookInfos.length) {
        if (selectedBookInfos.find((it) => it.id == it.id)) {
          it.bookInfo = null;
        }
      } else {
        it.bookInfo = null;
      }
    });
    this.setPassengerBookInfosSource(this.getPassengerBookInfos());
  }

  async getInitializeBookDto(bookDto: BookGpDto): Promise<InitialBookDtoModel> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-FlightGp-Init";

    req.Data = bookDto;
    req.IsShowLoading = true;
    req.LoadingMsg = "正在获取详情";
    req.Timeout = 60;
    return this.apiService
      .getPromiseData<InitialBookDtoModel>(req)
      .then((res) => {
        const bookInfos = this.getPassengerBookInfos();
        res.IllegalReasons = res.IllegalReasons || [];
        res.Insurances = res.Insurances || {};
        res.ServiceFees = res.ServiceFees || ({} as any);
        res.Staffs = res.Staffs || [];
        res.Staffs = res.Staffs.map((it) => {
          return {
            ...it,
            CredentialStaff: { ...it } as any,
          };
        });
        res.Tmc = res.Tmc || ({} as any);
        res.TravelFrom = res.TravelFrom || ({} as any);

        return res;
      });
  }

  addPassengerSubmit(d: PassengerEntity) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiBookUrl-FlightGp-AddPassenger`;
    req.Data = {
      ...d,
    };
    return this.apiService.getPromiseData<any>(req);
  }

  updatePassengerSubmit(d: PassengerEntity) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiBookUrl-FlightGp-UpdatePassenger`;
    req.Data = {
      ...d,
    };
    return this.apiService.getPromiseData<any>(req);
  }

  deletePassenger(id: string) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiBookUrl-FlightGp-DeletePassenger`;
    req.Data = {
      Id: id,
    };
    return this.apiService.getPromiseData<any>(req);
  }

  onCitySelected(city: TrafficlineEntity, isFromCity: boolean) {
    const s = this.getSearchFlightModel();
    if (isFromCity) {
      s.fromCity = city;
    } else {
      s.toCity = city;
    }
    s.FromCode = s.fromCity.Code;
    s.ToCode = s.toCity.Code;
    s.FromAsAirport = s.fromCity.Tag == "Airport";
    s.ToAsAirport = s.fromCity.Tag == "Airport";
    this.setSearchFlightModelSource(s);
  }
  onSwapCity() {
    const s = this.getSearchFlightModel();
    this.setSearchFlightModelSource({
      ...s,
      fromCity: s.toCity,
      toCity: s.fromCity,
      FromCode: s.toCity.Code,
      ToCode: s.fromCity.Code,
      FromAsAirport: s.ToAsAirport,
      ToAsAirport: s.FromAsAirport,
    });
  }
  filterByFlightDirect(segs: FlightSegmentEntity[]) {
    let result = segs;
    if (this.filterCondition && this.filterCondition.onlyDirect) {
      result = result.filter((s) => !s.IsStop);
    }
    return result;
  }
  filterByIsAgreement(segs: FlightSegmentEntity[]) {
    let result = segs;
    if (this.filterCondition && this.filterCondition.isAgreement) {
      result = result.filter((s) => s.IsAgreement);
    }
    return result;
  }
  filterByFromAirports(segs: FlightSegmentEntity[]) {
    let result = segs;
    if (
      this.filterCondition &&
      this.filterCondition.fromAirports &&
      this.filterCondition.fromAirports.filter((it) => it.isChecked).length
    ) {
      result = result.filter((s) =>
        this.filterCondition.fromAirports
          .filter((it) => it.isChecked)
          .some((a) => a.id === s.FromAirport && a.isChecked)
      );
    }
    return result;
  }
  filterByToAirports(segs: FlightSegmentEntity[] = []) {
    let result = segs;
    if (
      this.filterCondition &&
      this.filterCondition.toAirports &&
      this.filterCondition.toAirports.filter((it) => it.isChecked).length
    ) {
      result = result.filter((s) =>
        this.filterCondition.toAirports
          .filter((it) => it.isChecked)
          .some((a) => a.id === s.ToAirport)
      );
    }
    return result;
  }
  filterByAirportCompanies(segs: FlightSegmentEntity[] = []) {
    let result = segs;
    if (
      this.filterCondition &&
      this.filterCondition.airCompanies &&
      this.filterCondition.airCompanies.filter((it) => it.isChecked).length > 0
    ) {
      result = result.filter((s) =>
        this.filterCondition.airCompanies
          .filter((it) => it.isChecked)
          .some((a) => a.id === s.Airline)
      );
    }
    return result;
  }
  filterByAirTypes(segs: FlightSegmentEntity[] = []) {
    let result = segs;
    if (
      this.filterCondition &&
      this.filterCondition.airTypes &&
      this.filterCondition.airTypes.filter((it) => it.isChecked).length > 0
    ) {
      result = result.filter((s) =>
        this.filterCondition.airTypes
          .filter((it) => it.isChecked)
          .some((a) => a.id === s.PlaneType)
      );
    }
    return result;
  }
  filterByCabins(segs: FlightSegmentEntity[] = []) {
    let result = segs;
    if (
      this.filterCondition &&
      this.filterCondition.cabins &&
      this.filterCondition.cabins.filter((it) => it.isChecked).length > 0
    ) {
      result = result.map((s) => {
        s.Cabins = s.Cabins.filter((c) =>
          this.filterCondition.cabins
            .filter((it) => it.isChecked)
            .some((a) => a.id == c.Type)
        );
        return s;
      });
    }
    return result;
    // .filter(it => it.Cabins && it.Cabins.length > 0);
  }
  filterByTakeOffTimeSpan(segs: FlightSegmentEntity[]) {
    let result = segs;
    if (this.filterCondition && this.filterCondition.takeOffTimeSpan) {
      // console.log(this.filterCondition.takeOffTimeSpan);
      result = result.filter((s) => {
        // console.log(moment(s.TakeoffTime).hour());
        return (
          this.filterCondition.takeOffTimeSpan.lower <=
            this.calendarService.getMoment(0, s.TakeoffTime).hour() &&
          (this.calendarService.getMoment(0, s.TakeoffTime).hour() <
            this.filterCondition.takeOffTimeSpan.upper ||
            (this.calendarService.getMoment(0, s.TakeoffTime).hour() ==
              this.filterCondition.takeOffTimeSpan.upper &&
              this.calendarService.getMoment(0, s.TakeoffTime).minutes() == 0))
        );
      });
    }
    return result;
  }

  getPagePopTimeoutSource() {
    return this.pagePopTimeoutSource.asObservable();
  }
  private startCheckPageTimeout() {
    this.stopCheckPageTimout();
    this.pagePopTimeoutId = setTimeout(() => {
      this.pagePopTimeoutSource.next(true);
    }, this.pagePopTimeoutTime);
  }
  private stopCheckPageTimout() {
    if (this.pagePopTimeoutId) {
      clearTimeout(this.pagePopTimeoutId);
      this.pagePopTimeoutId = null;
    }
  }

  getIssuingBank() {
    const req = new RequestEntity();
    req.Method = "TmcApiFlightGpUrl-Home-CardBins";
    req.IsShowLoading = true;
    req.Data = [];
    return this.apiService.getPromiseData<any[]>(req);
  }

  getFrequentFlyer() {
    const req = new RequestEntity();
    req.Method = "TmcApiFlightGpUrl-Home-GetFrequentFlyer";
    req.IsShowLoading = true;
    req.Data = [];
    return this.apiService.getPromiseData<any[]>(req);
  }
  async onSelectCity(data: {
    isShowPage: boolean;
    isFrom: boolean;
    isDomestic?: boolean;
    pageClassName?: string;
    isShowSegs?: boolean;
    isShowHotCity?: boolean;
    isFlyDynamic?: boolean;
    hideCityCodes?: string[];
    extraHotAirports?: string[];
  }) {
    const domesticAirports = await this.getDomesticAirports();
    return this.flightCityService.onSelectCity({
      ...data,
      isShowSegs: false,
      isShowAirports: false,
      pageClassName: "flight-gp-city-page-container",
      domesticAirports,
      internationalAirports: [],
    });
  }
  get isShowingPage() {
    return this.flightCityService.isShowingPage;
  }
}
