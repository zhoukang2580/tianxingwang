import { LangService } from "src/app/services/lang.service";
import { FlightFareEntity } from "../flight/models/FlightFareEntity";
import { Injectable } from "@angular/core";
import { ApiService } from "../services/api/api.service";
import { FlightSegmentEntity } from "../flight/models/flight/FlightSegmentEntity";
import { FlightPolicy } from "../flight/models/PassengerFlightInfo";
import { Subject, BehaviorSubject } from "rxjs";
import { IdentityService } from "../services/identity/identity.service";
import {
  PassengerBookInfo,
  TmcService,
  FlightHotelTrainType,
  InitialBookDtoModel,
  IBookOrderResult,
} from "../tmc/tmc.service";
import { TrafficlineEntity } from "../tmc/models/TrafficlineEntity";
import { CalendarService } from "../tmc/calendar.service";
import { AppHelper } from "../appHelper";
import { Router } from "@angular/router";
import { ModalController } from "@ionic/angular";
import { TripType } from "../tmc/models/TripType";
import { DayModel } from "../tmc/models/DayModel";
import { RequestEntity } from "../services/api/Request.entity";
import { FlightResultEntity } from "../flight/models/FlightResultEntity";
import { IResponse } from "../services/api/IResponse";
import { tap, switchMap, filter } from "rxjs/operators";
import {
  MockInternationalFlightListData,
  MOCK_MultiCity_SEARCHMODEL,
} from "./mock-data";
import { environment } from "src/environments/environment";
import { IdentityEntity } from "../services/identity/identity.entity";
import { FlightRouteEntity } from "../flight/models/flight/FlightRouteEntity";
import { HrService } from "../hr/hr.service";
import { MemberService } from "../member/member.service";
import { CredentialsEntity } from "../tmc/models/CredentialsEntity";
import { CredentialsType } from "../member/pipe/credential.pipe";
import { OrderBookDto } from "../order/models/OrderBookDto";
import { FlightCabinType } from "../flight/models/flight/FlightCabinType";
import { FlightFareRuleEntity } from "../flight/models/FlightFareRuleEntity";
import { StorageService } from "../services/storage-service.service";
import { LogService } from "../services/log/log.service";
const LAST_INTERNATIONAL_FLIGHT_SEARCH_CONDITION_KEY =
  "last_international_flight_search_condition_key";
export interface IFlightCabinType {
  label:
    | "?????????"
    | "???????????????"
    | "?????????"
    | "?????????"
    | "???????????????"
    | "???????????????";
  value: FlightCabinInternationalType;
}
export enum FlightCabinInternationalType {
  /// <summary>
  /// ?????????
  /// </summary>
  // [Description("?????????")]
  ECONOMY = 11,
  /// <summary>
  /// ???????????????
  /// </summary>
  // [Description("???????????????")]
  PREMIUM_ECONOMY = 12,
  /// <summary>
  /// ?????????
  /// </summary>
  // [Description("?????????")]
  FIRST = 13,
  /// <summary>
  /// ?????????
  /// </summary>
  // [Description("?????????")]
  BUSINESS = 14,
  /// <summary>
  /// ???????????????
  /// </summary>
  // [Description("???????????????")]
  PREMIUM_BUSINESS = 15,
  /// <summary>
  /// ???????????????
  /// </summary>
  // [Description("???????????????")]
  PREMIUM_FIRST = 16,
}
export enum FlightVoyageType {
  OneWay = 1,
  GoBack = 2,
  MultiCity = 3,
}
export interface IConditionItem {
  label: string;
  isChecked?: boolean;
  logoPic?: string;
}
export interface IFromToAir extends IConditionItem {
  ToAirport?: string; // "KIX";
  ToAirportName?: string; // "????????????????????????";
  ToCityName?: string; // "??????";
  ToTerminal?: string; // "1";
  FromAirport?: string;
  FromAirportName?: string;
  FromCityName?: string;
  FromTerminal?: string;
}
export interface IFilterCondition {
  airComponies?: IConditionItem[];
  price?: "asc" | "desc" | "none";
  time?: "asc" | "desc" | "none";
  isFilter?: boolean;
  fromAirports?: IFromToAir[];
  toAirports?: IFromToAir[];
  timeSpan?: { lower: number; upper: number };
  isDirectFly?: boolean;
}
const toCity: TrafficlineEntity = {
  Id: 2919,
  Tag: "AirportInternational",
  Code: "HKG",
  Name: "??????????????????",
  Nickname: "??????????????????",
  Pinyin: "xianggangguojijichang",
  Initial: "XGGJJC",
  AirportCityCode: "HKG",
  CityCode: "HKG",
  CityName: "??????",
  Description: "",
  IsHot: true,
  CountryCode: "HK",
  Sequence: 0,
  EnglishName: "HONG KONG INTERNATIONAL APT",
  Country: { Id: 87, Name: "??????(??????)", Code: "HK", Sequence: 13 },
  matchStr: "hkg,??????????????????,??????????????????,??????,xianggangguojijichang,hkg",
} as any;
const fromCity = {
  AirportCityCode: "SHA",
  CityCode: "3101",
  CityName: "??????",
  Code: "SHA",
  CountryCode: "CN",
  Description: "",
  EnglishName: "Shanghai",
  Id: "9260",
  Initial: "",
  IsHot: true,
  Name: "??????",
  Nickname: "??????",
  Pinyin: "Shanghai",
  Sequence: 1,
  // ????????????????????????????????????????????????
  Tag: "AirportCity",
} as TrafficlineEntity;

@Injectable({
  providedIn: "root",
})
export class InternationalFlightService {
  private fetchPassengerCredentials: {
    promise: Promise<{ [accountId: string]: CredentialsEntity[] }>;
  };
  private isInitializingSelfBookInfos: { promise: Promise<any> };
  private selfCredentials: CredentialsEntity[];
  private identity: IdentityEntity;
  private lastOneWaySearchModel: IInternationalFlightSearchModel; // ????????????????????????trip??????
  private filterCondition: IFilterCondition;
  private filterConditionSource: Subject<IFilterCondition>;
  private searchModel: IInternationalFlightSearchModel;
  private searchModelSource: Subject<IInternationalFlightSearchModel>;
  private bookInfos: PassengerBookInfo<IInternationalFlightSegmentInfo>[];
  private bookInfoSource: Subject<
    PassengerBookInfo<IInternationalFlightSegmentInfo>[]
  >;
  private get cabins(): IFlightCabinType[] {
    return [
      {
        label: "?????????",
        value: FlightCabinInternationalType.ECONOMY,
      },
      {
        label: "???????????????",
        value: FlightCabinInternationalType.PREMIUM_ECONOMY,
      },
      {
        label: "?????????",
        value: FlightCabinInternationalType.BUSINESS,
      },
      {
        label: "???????????????",
        value: FlightCabinInternationalType.PREMIUM_BUSINESS,
      },
      {
        label: "?????????",
        value: FlightCabinInternationalType.FIRST,
      },
      {
        label: "???????????????",
        value: FlightCabinInternationalType.PREMIUM_FIRST,
      },
    ];
  }
  flightListResult: FlightResultEntity;
  constructor(
    private apiService: ApiService,
    private identityService: IdentityService,
    private calendarService: CalendarService,
    private tmcService: TmcService,
    private router: Router,
    private modalCtrl: ModalController,
    private staffService: HrService,
    private memerService: MemberService,
    private storage: StorageService,
    private LangService: LangService,
    private logService: LogService
  ) {
    this.searchModelSource = new BehaviorSubject({} as any);
    this.bookInfoSource = new BehaviorSubject([]);
    this.initFilterCondition();
    this.identityService.getIdentitySource().subscribe((it) => {
      this.identity = it;
      this.disposal();
    });
    memerService.getCredentialsChangeSource().subscribe(async () => {
      this.selfCredentials = [];
      const staff = await this.staffService.getStaff(false, true);
      const isSelf = await this.staffService.isSelfBookType();
      if (!isSelf) {
        return;
      }
      const res = await this.getPassengerCredentials(
        [staff.AccountId],
        true
      ).catch((_) => ({ [staff.AccountId]: [] }));
      this.selfCredentials = res[staff.AccountId];
      const passportOrHmTwPass =
        this.selfCredentials &&
        this.selfCredentials.find((c) => this.isPassportHmTwPass(c.Type));
      const bookInfos = this.getBookInfos();
      const exists = bookInfos
        .filter((it) =>
          this.isPassportHmTwPass(it.credential && it.credential.Type)
        )
        .map((it) => it.credential);

      if (passportOrHmTwPass) {
        if (!exists || !exists.length) {
          this.setBookInfoSource(
            bookInfos.map((it) => {
              it.credential = passportOrHmTwPass;
              return it;
            })
          );
        } else {
          this.setBookInfoSource(
            bookInfos.map((it) => {
              if (
                this.isPassportHmTwPass(
                  it && it.credential && it.credential.Type
                )
              ) {
                it.credential = passportOrHmTwPass;
              }
              return it;
            })
          );
        }
      }
    });
    this.initOneWaySearModel();
  }
  async getInitializeBookDto(
    bookDto: OrderBookDto
  ): Promise<InitialBookDtoModel> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-InternationalFlight-Initialize";
    bookDto = {
      ...bookDto,
      Passengers: bookDto.Passengers.map((p) => {
        if (p.Policy) {
          p.Policy = {
            ...p.Policy,
            FlightDescription: null,
            TrainDescription: null,
            TrainSeatType: null,
            TrainSeatTypeName: null,
            TrainUpperSeatType: null,
            TrainUpperSeatTypeArray: null,
            TrainUpperSeatTypeName: null,
            HotelDescription: null,
            Setting: null,
          };
        }
        if (p.FlightCabin) {
          p.FlightCabin = {
            ...p.FlightCabin,
            // RefundChange: null,
            Variables: null,
          };
        }
        if (p.FlightSegment && p.FlightSegment.Cabins) {
          p.FlightSegment = {
            ...p.FlightSegment,
            Cabins: p.FlightSegment.Cabins.map((c) => {
              // c.RefundChange = null;
              c.Variables = null;
              return c;
            }),
          };
        }
        return p;
      }),
    };
    req.Data = bookDto;
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService
      .getPromiseData<InitialBookDtoModel>(req)
      .then((res) => {
        const bookInfos = this.getBookInfos();
        res.IllegalReasons = res.IllegalReasons || [];
        res.Insurances = res.Insurances || {};
        res.ServiceFees = res.ServiceFees || ({} as any);
        res.ExpenseTypes = (res.ExpenseTypes || []).filter(
          (it) => !it.Tag || it.Tag.toLowerCase() == "internationalflight"
        );
        console.log("?????????", { ...res.ServiceFees });
        // ??????????????????????????? item.passenger.AccountId ??????,?????????????????????????????? item.passenger.AccountId ???????????????
        const fees = {};
        Object.keys(res.ServiceFees).forEach((k) => {
          let count = 1;
          const one = bookInfos.find((it) => it.id == k);
          if (one && one.passenger) {
            count = bookInfos.filter(
              (it) =>
                it.passenger &&
                it.passenger.AccountId == one.passenger.AccountId
            ).length;
          }
          fees[k] = +res.ServiceFees[k] / count;
        });
        console.log("?????????", fees);
        res.ServiceFees = fees;
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
  async getStopCities(flightSegments: FlightSegmentEntity[]) {
    const req = new RequestEntity();
    req.Method = "TmcApiInternationalFlightUrl-Home-GetStopCities";
    req.IsShowLoading = true;
    req.Timeout = 60;
    req.Data = {
      FlightSegments: JSON.stringify(flightSegments),
    };
    return this.apiService.getPromiseData<FlightResultEntity>(req);
  }
  async bookFlight(bookDto: OrderBookDto): Promise<IBookOrderResult> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-InternationalFlight-Book";

    bookDto.Channel = await this.tmcService.getChannel();
    req.Data = bookDto;
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService.getPromiseData<IBookOrderResult>(req).then((r) => {
      if (r && r.TradeNo && r.TradeNo == "0") {
        this.logService.addException({
          Tag: `?????????????????????????????? ??????????????????${r.TradeNo}`,
          Error: r,
          Method: req.Method,
          Message: r.Message,
        });
      }
      return r;
    });
  }
  isPassportHmTwPass(type: CredentialsType) {
    return (
      type == CredentialsType.Passport ||
      type == CredentialsType.HmPass ||
      type == CredentialsType.TwPass
    );
  }
  private async initSelfBookTypeBookInfos(isShowLoading = false) {
    if (this.isInitializingSelfBookInfos) {
      return this.isInitializingSelfBookInfos.promise;
    } else {
      this.isInitializingSelfBookInfos = {
        promise: new Promise(async (resolve) => {
          const isSelf = await this.staffService.isSelfBookType(isShowLoading);
          const infos = this.getBookInfos();
          if (
            (infos.length === 0 ||
              infos.some(
                (it) =>
                  !it.credential || !this.isPassportHmTwPass(it.credential.Type)
              )) &&
            isSelf
          ) {
            let passportOrHmTwPass: any;
            const staff = await this.staffService.getStaff(
              false,
              isShowLoading
            );
            const res = await this.getPassengerCredentials(
              [staff.AccountId],
              isShowLoading
            ).catch((_) => ({ [staff.AccountId]: [] }));
            this.selfCredentials = res[staff.AccountId];
            passportOrHmTwPass =
              this.selfCredentials &&
              this.selfCredentials.find((c) => this.isPassportHmTwPass(c.Type));
            const i: PassengerBookInfo<IInternationalFlightSegmentInfo> = {
              id: AppHelper.uuid(),
              passenger: staff,
              credential: passportOrHmTwPass,
            };
            this.addPassengerBookInfo(i);
            resolve(null);
          } else {
            resolve(null);
          }
        }).finally(() => {
          this.isInitializingSelfBookInfos = null;
        }),
      };
    }
    return this.isInitializingSelfBookInfos.promise;
  }
  getPassengerCredentials(accountIds: string[], isShowLoading?: boolean) {
    if (
      this.fetchPassengerCredentials &&
      this.fetchPassengerCredentials.promise
    ) {
      return this.fetchPassengerCredentials.promise;
    }
    this.fetchPassengerCredentials = {
      promise: this.tmcService
        .getPassengerCredentials(accountIds, isShowLoading)
        .finally(() => {
          this.fetchPassengerCredentials = null;
        }),
    };
    return this.fetchPassengerCredentials.promise;
  }

  private initFilterCondition() {
    this.filterCondition = {
      price: "none",
      time: "none",
      timeSpan: { lower: 0, upper: 24 },
      isDirectFly: false,
    };
    this.filterConditionSource = new BehaviorSubject(this.filterCondition);
  }
  setFilterConditionSource(condition: IFilterCondition) {
    this.filterCondition = condition;
    if (this.filterCondition) {
      this.filterCondition.isFilter =
        this.filterCondition.isDirectFly ||
        (this.filterCondition.airComponies &&
          this.filterCondition.airComponies.some((c) => c.isChecked)) ||
        (this.filterCondition.fromAirports &&
          this.filterCondition.fromAirports.some((it) => it.isChecked)) ||
        (this.filterCondition.toAirports &&
          this.filterCondition.toAirports.some((it) => it.isChecked)) ||
        (this.filterCondition.timeSpan &&
          (this.filterCondition.timeSpan.lower > 0 ||
            this.filterCondition.timeSpan.upper < 24));
    }
    console.log("IFilterCondition ", condition);
    return this.filterConditionSource.next(condition);
  }
  getFilterConditionSource() {
    return this.filterConditionSource.asObservable();
  }
  getFilterCondition() {
    return this.filterCondition || ({} as IFilterCondition);
  }
  async onSelectFlyDate(isFrom: boolean, t: ITripInfo) {
    const dates = await this.openCalendar(false, isFrom, t);
    if (dates && dates.length) {
      if (this.searchModel) {
        if (this.searchModel.voyageType == FlightVoyageType.MultiCity) {
          const trip = this.searchModel.trips.find((it) => it.id == t.id);
          if (trip) {
            trip.date = dates[0].date;
            this.searchModel.trips = this.searchModel.trips.map((it) => {
              it.isSelectInfo = false;
              return it;
            });
          }
        }
        if (this.searchModel.voyageType == FlightVoyageType.OneWay) {
          this.searchModel.trips[0].date = dates[0].date;
        }
        if (this.searchModel.voyageType == FlightVoyageType.GoBack) {
          if (isFrom) {
            this.searchModel.trips[0].date = dates[0].date;
          } else {
            this.searchModel.trips[1].date = dates[0].date;
          }
        }
        this.checkTripsDate();
      }
    }
    this.setSearchModelSource(this.searchModel);
  }
  private checkTripsDate() {
    const trips = (this.searchModel && this.searchModel.trips) || [];
    trips.forEach((trip, idx) => {
      const next = trips[idx + 1];
      if (next) {
        const m = this.calendarService.getMoment(0, trip.date);
        const nextM = this.calendarService.getMoment(0, next.date);
        if (+nextM < +m) {
          next.date = m.add(3, "days").format("YYYY-MM-DD");
        }
      }
    });
  }
  openCalendar(isMulti: boolean, isFrom: boolean, trip: ITripInfo) {
    const s = this.getSearchModel();
    const trips = s.trips || [];
    const idx = s.trips && s.trips.findIndex((it) => it == trip);
    const lastTrip = idx - 1 >= 0 ? trips[idx - 1] : null;
    let goArrivalTime = "";
    if (FlightVoyageType.MultiCity == s.voyageType) {
      goArrivalTime = lastTrip ? lastTrip.date : "";
    }
    if (s.voyageType == FlightVoyageType.OneWay) {
      goArrivalTime = "";
    }
    if (s.voyageType == FlightVoyageType.GoBack) {
      if (!isFrom) {
        goArrivalTime = s.trips[0].date;
      }
    }
    return this.calendarService.openCalendar({
      goArrivalTime,
      tripType: isFrom ? TripType.departureTrip : TripType.returnTrip,
      forType: FlightHotelTrainType.InternationalFlight,
      isMulti,
      beginDate:
        goArrivalTime ||
        (this.searchModel &&
          this.searchModel.trips &&
          this.searchModel.trips[0] &&
          this.searchModel.trips[0].date) ||
        "",
      endDate: "",
    });
  }
  initOneWaySearModel() {
    let fromCity1 = fromCity;
    let toCity1 = toCity;
    if (
      this.searchModel &&
      this.searchModel.trips &&
      this.searchModel.trips.length
    ) {
      fromCity1 = this.searchModel.trips[0].fromCity;
      toCity1 = this.searchModel.trips[0].toCity;
    }
    this.searchModel = {
      voyageType: FlightVoyageType.OneWay,
      trips: [
        {
          fromCity: fromCity1,
          toCity: toCity1,
          date: this.calendarService.getMoment(1).format("YYYY-MM-DD"),
          id: AppHelper.uuid(),
        },
      ],
      cabin: {
        label: "?????????",
        value: FlightCabinInternationalType.ECONOMY,
      },
      cabins: this.cabins,
    };
    this.setSearchModelSource(this.searchModel);
  }

  initGoBackSearchModel() {
    let fromCity1 = fromCity;
    let toCity1 = toCity;
    if (
      this.lastOneWaySearchModel &&
      this.lastOneWaySearchModel.trips &&
      this.lastOneWaySearchModel.trips.length
    ) {
      fromCity1 = this.lastOneWaySearchModel.trips[0].fromCity;
      toCity1 = this.lastOneWaySearchModel.trips[0].toCity;
    }
    this.searchModel = {
      voyageType: FlightVoyageType.GoBack,
      trips: [
        {
          fromCity: fromCity1,
          toCity: toCity1,
          date: this.calendarService.getMoment(1).format("YYYY-MM-DD"),
          id: AppHelper.uuid(),
        },
        {
          id: AppHelper.uuid(),
          fromCity: toCity1,
          toCity: fromCity1,
          date: this.calendarService.getMoment(3).format("YYYY-MM-DD"),
        },
      ],
      cabin: {
        label: "?????????",
        value: FlightCabinInternationalType.ECONOMY,
      },
      cabins: this.cabins,
    };
    this.setSearchModelSource(this.searchModel);
  }
  initMultiTripSearchModel() {
    let fromCity1 = fromCity;
    let toCity1 = toCity;
    if (
      this.lastOneWaySearchModel &&
      this.lastOneWaySearchModel.trips &&
      this.lastOneWaySearchModel.trips.length
    ) {
      fromCity1 = this.lastOneWaySearchModel.trips[0].fromCity;
      toCity1 = this.lastOneWaySearchModel.trips[0].toCity;
    }
    this.searchModel = {
      voyageType: FlightVoyageType.MultiCity,
      trips: [
        {
          fromCity: fromCity1,
          toCity: toCity1,
          date: this.calendarService.getMoment(1).format("YYYY-MM-DD"),
          id: AppHelper.uuid(),
        },
        {
          id: AppHelper.uuid(),
          fromCity: toCity,
          date: this.calendarService.getMoment(3).format("YYYY-MM-DD"),
        },
      ],
      cabin: {
        label: "?????????",
        value: FlightCabinInternationalType.ECONOMY,
      },
      cabins: this.cabins,
    };
    this.setSearchModelSource(this.searchModel);
  }
  disposal() {
    // this.flightCabinLevelPolicies = null;
    this.initOneWaySearModel();
    this.initFilterCondition();
    this.setBookInfoSource([]);
  }
  addMoreTrip() {
    if (this.searchModel && this.searchModel.trips) {
      const trips = this.searchModel.trips;
      const idx = trips.findIndex((it) => !it.fromCity || !it.toCity);
      if (idx > -1) {
        const one = trips[idx];
        AppHelper.alert(
          `????????????${idx + 1}??????${!one.fromCity ? "????????????" : ""}${
            !one.toCity ? "????????????" : ""
          }`
        );
        return;
      }
      const last = trips[trips.length - 1];
      this.searchModel.trips.push({
        id: AppHelper.uuid(),
        fromCity: last.toCity,
        date: this.calendarService.getMoment(3, last.date).format("YYYY-MM-DD"),
      });
      this.setSearchModelSource(this.searchModel);
    }
  }
  async getFlightList(query: {
    forceFetch: boolean;
    keepFilterCondition: boolean;
  }) {
    const search = this.searchModel;
    const { forceFetch, keepFilterCondition } = query;
    await this.initSelfBookTypeBookInfos(forceFetch);
    const isSelf = await this.staffService.isSelfBookType();
    if (this.searchModel && isSelf) {
      if (this.searchModel.voyageType == FlightVoyageType.GoBack) {
        if (this.getBookInfos().length == 1) {
          this.addPassengerBookInfo({
            ...this.bookInfos[0],
            id: AppHelper.uuid(),
          });
        }
      } else if (this.searchModel.voyageType == FlightVoyageType.OneWay) {
        if (this.getBookInfos().length > 1) {
          this.setBookInfoSource([this.getBookInfos()[0]]);
        }
      }
    }
    if (!search || !forceFetch) {
      if (
        this.flightListResult &&
        this.flightListResult.FlightSegments &&
        this.flightListResult.FlightSegments.length
      ) {
        let result = this.flightListResult;
        // const policyResult = await this.checkRoutePolicy(result);
        // this.initRoutePolicy(policyResult);
        result = this.initParagraphFlightRoutes(result);
        if (!keepFilterCondition) {
          await this.initParagraphCondition(result);
        }
        result = this.filterByCondition(result);
        return result;
      }
    }
    this.setSearchModelSource({
      ...search,
      trips: search.trips.map((it) => {
        it.bookInfo = null;
        return it;
      }),
    });
    const c = this.getSearchC();
    const req = new RequestEntity();
    req.Method = `TmcApiInternationalFlightUrl-Home-Index`;
    req.Data = {
      Date: c.date,
      FromAirport: c.fromAirports.join(","),
      ToAirport: c.toAirports.join(","),
      VoyageType: search.voyageType,
      travelformid: AppHelper.getQueryParamers()["travelformid"] || "",
      Cabin: FlightCabinInternationalType[search.cabin && search.cabin.value],
    };
    req.IsShowLoading = true;
    req.LoadingMsg = "????????????????????????...";
    return this.apiService
      .getPromiseData<FlightResultEntity>(req)
      .then((r) => {
        if (r) {
          if (r.FlightFares) {
            r.FlightFares.forEach((f) => {
              f.color = "secondary";
            });
          }
          this.flightListResult = r;
          if (!r.flightRoutesData) {
            r.flightRoutesData = r.FlightRoutes;
          }
        }
        // return this.checkRoutePolicy(this.flightListResult);
        return this.flightListResult;
      })
      .then((res) => {
        if (res) {
          if (!res.flightRoutesData) {
            res.flightRoutesData = res.FlightRoutes;
          }
          // this.initRoutePolicy(res);
        }
        this.flightListResult = this.initFlightRouteSegments(
          this.flightListResult
        );
        return this.initParagraphCondition(this.flightListResult).then(
          () => this.flightListResult
        );
      })
      .then((data) => {
        return this.initFlightRoutesMinPriceFlightFare(data);
      });
  }
  private getSearchC() {
    let date = this.calendarService.getMoment(0).format("YYYY-MM-DD");
    let days: string[] = [];
    let fromAirports: string[];
    let toAirports: string[];
    const search = this.searchModel;
    if (search.voyageType == FlightVoyageType.OneWay) {
      const trip = search.trips[0];
      date = trip.date;
      fromAirports = [trip.fromCity.Code];
      toAirports = [trip.toCity.Code];
    }
    if (search.voyageType == FlightVoyageType.GoBack) {
      const goTrip = search.trips[0];
      const backTrip = search.trips[1];
      days = [goTrip.date, backTrip.date];
      date = days.join(",");
      fromAirports = [goTrip.fromCity.Code];
      toAirports = [goTrip.toCity.Code];
    }
    if (search.voyageType == FlightVoyageType.MultiCity) {
      date = search.trips.map((it) => it.date).join(",");
      fromAirports = search.trips
        .map((it) => it.fromCity && it.fromCity.AirportCityCode)
        .filter((it) => !!it);
      toAirports = search.trips
        .map((it) => it.toCity && it.toCity.AirportCityCode)
        .filter((it) => !!it);
    }
    return {
      date,
      days,
      fromAirports,
      toAirports,
    };
  }
  async loadListDetail(fr: FlightRouteEntity) {
    const req = new RequestEntity();
    req.Method = `TmcApiInternationalFlightUrl-Home-Detail`;
    req.IsShowLoading = true;
    const pid =
      (this.getBookInfos()[0] &&
        this.getBookInfos()[0].passenger &&
        this.getBookInfos()[0].passenger.Policy &&
        this.getBookInfos()[0].passenger.Policy.Id) ||
      "";
    // const lastTrip = this.searchModel.trips[this.searchModel.trips.length - 1];
    const dates = this.searchModel.trips.map((it) => it.date).join(",");
    const froutes = this.searchModel.trips
      .filter((it) => !!it.bookInfo)
      .map((it) => it.bookInfo.flightRoute)
      .concat(fr);
    const c = this.getSearchC();
    let ADTPtcs = this.getBookInfos().length;
    const isSelf = await this.staffService.isSelfBookType();
    if (isSelf) {
      ADTPtcs = 1;
    }
    if (ADTPtcs > 9) {
      AppHelper.alert("?????????????????????????????????9???");
      return;
    }
    req.Data = {
      ADTPtcs,
      FlightQuery: JSON.stringify({
        Date: dates,
        FromAirport: c.fromAirports.join(","),
        ToAirport: c.toAirports.join(","),
        VoyageType: this.searchModel.voyageType,
        Cabin: FlightCabinInternationalType[this.searchModel.cabin.value],
        FlightRoutes: JSON.stringify(froutes),
        FlightSegments: JSON.stringify(
          froutes
            .map((r) => r.FlightSegments)
            .reduce((acc, seg) => {
              acc = [...acc, ...seg];
              return acc;
            }, [])
        ),
      }),
      PolicyId: pid,
    };
    return this.apiService.getPromiseData<FlightResultEntity>(req).then((r) => {
      if (r) {
        fr.isLoadDetail = r.FlightFares && r.FlightFares.length > 0;
        fr.flightFares = r.FlightFares.map((it) => {
          if (it) {
            it.color = "secondary";
            if (!it.IsAllowOrder) {
              it.color = "danger";
              it.disabled = true;
            }
            it.flightRoutes = r.FlightRoutes;
          }
          return it;
        });
        fr.FlightSegments = r.FlightSegments;
        fr.minPriceFlightFare = this.getMinPriceFlightFare(r.FlightFares, [
          fr.Id,
        ]);
      }
      return r;
    });
  }
  private initRoutePolicy(policyResult: FlightResultEntity) {
    if (policyResult) {
      if (policyResult.flightRoutesData && this.flightListResult) {
        if (this.flightListResult.flightRoutesData) {
          this.flightListResult.flightRoutesData.forEach((r) => {
            r.color = "success";
            const one = policyResult.FlightRoutes.find((i) => i.Id == r.Id);
            if (one) {
              r.Rules = one.Rules;
              r.IsAllowOrder = one.IsAllowOrder;
              if (r.Rules) {
                r.rulesMessages = Object.keys(r.Rules).map((k) => r.Rules[k]);
              }
              // r.color = "success";
              if (r.IsAllowOrder) {
                if (r.Rules) {
                  r.color = "warning";
                }
              } else {
                r.disabled = true;
                r.color = "danger";
              }
            }
            return r;
          });
        }
      }
    }
  }
  async checkPolicy(route: FlightRouteEntity, flightFare: FlightFareEntity) {
    const m = this.getSearchModel();
    const bookInfos = this.getBookInfos();
    const notWhitelist = bookInfos.filter((it) => it.isNotWhitelist);
    let isCheckPolicy =
      m.trips.findIndex((it) => !it.bookInfo) == m.trips.length - 1;
    if (!isCheckPolicy) {
      isCheckPolicy = !flightFare.policy;
    }
    if (notWhitelist.length == bookInfos.length) {
      isCheckPolicy = false;
    }
    if (!isCheckPolicy) {
      return true;
    }
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiInternationalFlightUrl-Home-Check`;
    if (!this.flightListResult || !this.flightListResult.FlightFares) {
      return true;
    }
    let selectedRids = m.trips
      .filter(
        (it) =>
          it.bookInfo && it.bookInfo.flightRoute && it.bookInfo.flightRoute.Id
      )
      .map((it) => it.bookInfo.flightRoute.Id);
    selectedRids = [...selectedRids, route.Id];
    const flightRouteInfos = (this.flightListResult.FlightRoutes || []).filter(
      (r) => selectedRids.some((sr) => sr == r.Id)
    );
    req.Data = {
      FlightRouteInfos: flightRouteInfos.map((r) => {
        const res = new FlightRouteEntity();
        res.Id = r.Id;
        res.Cabin = r.Cabin;
        res.FlightRouteIds = r.FlightRouteIds;
        res.FlightSegmentIds = r.FlightSegmentIds;
        res.Duration = r.Duration;
        res.FirstTime = r.FirstTime;
        res.Type = r.Type;
        return res;
      }),
      FlightSegmentInfos: (this.flightListResult.FlightSegments || [])
        .filter((s) => {
          return flightRouteInfos.some((info) =>
            info.FlightSegmentIds.some((segId) => segId == s.Id)
          );
        })
        .map((seg) => {
          const s = new FlightSegmentEntity();
          s.Id = seg.Id;
          s.Duration = seg.Duration;
          s.Number = seg.Number;
          return s;
        }),
      FlightFare: {
        Id: flightFare.Id,
        SalesPrice: flightFare.SalesPrice,
        Type: flightFare.Type,
        SettlePrice: flightFare.SettlePrice,
        TicketPrice: flightFare.TicketPrice,
        Discount: flightFare.Discount,
        CabinCodes: flightFare.CabinCodes,
      },
      PolicyIds: bookInfos
        .map(
          (it) => it.passenger && it.passenger.Policy && it.passenger.Policy.Id
        )
        .filter((it) => !!it)
        .slice(0, 1)
        .join(","),
    };
    req.IsShowLoading = true;
    req.LoadingMsg = "????????????????????????";
    const result = await this.apiService.getPromiseData<{
      Policy: {
        IsAllowOrder: boolean;
        IsIllegal: boolean;
        Message: string;
      };
      flightCabinCodeDis: { [flightSegmentNumber: string]: string };
    }>(req);
    if (result.Policy) {
      flightFare.policy = result.Policy;
      if (!result.Policy.IsAllowOrder) {
        flightFare.color = "danger";
        flightFare.disabled = true;
      } else {
        if (result.Policy.IsIllegal || result.Policy.Message) {
          flightFare.color = "warning";
        } else if (!result.Policy.IsIllegal) {
          flightFare.color = "success";
        }
      }
    }
    if (result.flightCabinCodeDis) {
      this.flightListResult.FlightSegments =
        this.flightListResult.FlightSegments.map((seg) => {
          const cabinCode = result.flightCabinCodeDis[seg.Number];
          if (cabinCode) {
            seg.CabinCode = cabinCode;
          }
          return seg;
        });
    }

    return true;
  }
  getRuleInfo(flightfare: FlightFareEntity) {
    const req = new RequestEntity();
    req.Method = `TmcApiInternationalFlightUrl-Home-GetRuleInfo`;
    req.IsShowLoading = true;
    req.LoadingMsg = "????????????";
    const flightRoutes = (this.flightListResult.flightRoutesData || []).map(
      (r) => {
        const route = new FlightRouteEntity();
        route.Id = r.Id;
        route.FirstTime = r.FirstTime;
        route.Origin = r.Origin;
        route.Destination = r.Destination;
        return route;
      }
    );
    req.Data = {
      Flightfare: JSON.stringify(flightfare),
      FlightRoutes: JSON.stringify(flightRoutes),
    };
    return this.apiService.getResponse<{
      FlightFareRules: FlightFareRuleEntity[];
      FlightFares: FlightFareEntity[];
    }>(req);
  }
  // async flightCabinLevelPolicy() {
  //   const staff = await this.staffService.getStaff();
  //   if (staff && staff.Policy) {
  //     if (
  //       this.flightCabinLevelPolicies &&
  //       Object.keys(this.flightCabinLevelPolicies).length
  //     ) {
  //       return this.flightCabinLevelPolicies;
  //     }
  //     const req = new RequestEntity();
  //     req.Method = `TmcApiInternationalFlightUrl-Home-FlightCabinLevelPolicy`;
  //     req.IsShowLoading = true;
  //     req.LoadingMsg = "????????????????????????";
  //     req.Data = {
  //       PolicyId: staff.Policy.Id,
  //     };
  //     this.flightCabinLevelPolicies = await this.apiService.getPromiseData<{
  //       [FlightCabinType: number]: string;
  //     }>(req);
  //     return this.flightCabinLevelPolicies;
  //   }
  //   return this.flightCabinLevelPolicies;
  // }
  private async checkRoutePolicy(result: FlightResultEntity) {
    const req = new RequestEntity();
    req.Method = `TmcApiInternationalFlightUrl-Home-CheckRoutePolicy`;
    req.IsShowLoading = true;
    req.LoadingMsg = "??????????????????";
    const bookInfos = this.getBookInfos();
    const notWhitelist = bookInfos.filter((it) => it.isNotWhitelist);
    const whitelist = bookInfos.filter((it) => !it.isNotWhitelist);
    if (
      !result ||
      !result.FlightFares ||
      !result.FlightRoutes ||
      !result.FlightSegments
    ) {
      return result;
    }
    if (whitelist.length) {
      req.Data = {
        FlightRoutes: JSON.stringify(
          result.FlightRoutes.map((it) => {
            const r = new FlightRouteEntity();
            r.Rules = it.Rules;
            r.FlightRouteIds = it.FlightRouteIds;
            r.Id = it.Id;
            r.Type = it.Type;
            r.FirstTime = it.FirstTime;
            r.FlightSegmentIds = it.FlightSegmentIds;
            r.Paragraphs = it.Paragraphs;
            return r;
          })
        ),
        FlightSegments: JSON.stringify(
          result.FlightSegments.map((it) => {
            const seg = new FlightSegmentEntity();
            seg.FromAirport = it.FromAirport;
            seg.FromAirportName = it.FromAirportName;
            seg.ToAirport = it.ToAirport;
            seg.ToAirportName = it.ToAirportName;
            seg.TakeoffTime = it.TakeoffTime;
            seg.Tax = it.Tax;
            seg.ArrivalTime = it.ArrivalTime;
            seg.CabinCode = it.CabinCode;
            seg.Cabins = it.Cabins;
            seg.Carrier = it.Carrier;
            seg.Distance = it.Distance;
            seg.Id = it.Id;
            seg.Duration = it.Duration;
            return seg;
          })
        ),
        FlightFares: JSON.stringify(
          result.FlightFares.map((it) => {
            const f = new FlightFareEntity();
            f.Id = it.Id;
            f.Tax = it.Tax;
            f.SalesPrice = it.SalesPrice;
            f.Rules = it.Rules;
            f.FlightNumber = it.FlightNumber;
            f.FlightRouteIds = it.FlightRouteIds;
            f.Type = it.Type;
            f.SettlePrice = it.SettlePrice;
            f.SettleTax = it.SettleTax;
            f.SupplierType = it.SupplierType;
            f.TicketPrice = it.TicketPrice;
            f.Code = it.Code;
            f.Discount = it.Discount;
            f.FareType = it.FareType;

            return f;
          })
        ),
        PolicyIds:
          whitelist[0].passenger &&
          whitelist[0].passenger.Policy &&
          whitelist[0].passenger.Policy.Id,
      };
      result = await this.apiService.getPromiseData<FlightResultEntity>(req);
    } else {
      if (notWhitelist.length) {
        if (result) {
          // ????????????????????????????????????
          if (result.FlightFares) {
            result.FlightFares.forEach((f) => {
              f.IsAllowOrder = true;
            });
          }
          if (result.FlightRoutes) {
            result.FlightRoutes.forEach((r) => {
              r.IsAllowOrder = true;
            });
          }
        }
      }
    }
    return result;
  }
  private filterByCondition(data: FlightResultEntity) {
    console.time("filterByCondition");
    const condition = this.getFilterCondition();
    data = this.filterByAirports(data);
    data = this.filterByAirComponies(data);
    if (condition && data && data.FlightRoutes) {
      if (condition.isDirectFly) {
        data.FlightRoutes = data.FlightRoutes.filter((it) => !it.isTransfer);
      }
    }
    data = this.filterByTimeSpan(data);
    console.timeEnd("filterByCondition");
    return data;
  }
  private filterByTimeSpan(data: FlightResultEntity) {
    const condition = this.getFilterCondition();
    if (data && data.FlightRoutes) {
      if (condition && condition.timeSpan) {
        if (condition.timeSpan.lower > 0 || condition.timeSpan.upper < 24) {
          data.FlightRoutes = data.FlightRoutes.filter((r) => {
            const time =
              (r.fromSegment && r.fromSegment.TakeoffTime) || r.FirstTime;
            if (time) {
              const [h, m, s] = time
                .substr(11)
                .split(":")
                .map((it) => +it);
              return (
                condition.timeSpan.lower <= h && h <= condition.timeSpan.upper
              );
            }
            return !!time;
          });
        }
      }
    }
    return data;
  }
  private filterByAirComponies(data: FlightResultEntity) {
    const condition = this.getFilterCondition();
    if (data && data.FlightRoutes) {
      if (condition) {
        const airs =
          condition.airComponies &&
          condition.airComponies.filter((it) => it.isChecked);
        if (airs && airs.length) {
          data.FlightRoutes = data.FlightRoutes.filter((r) => {
            return (
              r.fromSegment &&
              airs.some((a) => a.label == r.fromSegment.AirlineName)
            );
          });
        }
      }
    }
    return data;
  }
  private filterByAirports(data: FlightResultEntity) {
    const condition = this.getFilterCondition();
    if (condition) {
      if (data && data.FlightRoutes) {
        const fromAirports =
          condition.fromAirports &&
          condition.fromAirports.filter((it) => it.isChecked);
        if (fromAirports && fromAirports.length) {
          data.FlightRoutes = data.FlightRoutes.filter((r) => {
            return (
              r.fromSegment &&
              fromAirports.some(
                (fa) => fa.FromAirportName == r.fromSegment.FromAirportName
              )
            );
          });
        }
        const toAirports =
          condition.toAirports &&
          condition.toAirports.filter((it) => it.isChecked);
        if (toAirports && toAirports.length) {
          data.FlightRoutes = data.FlightRoutes.filter((r) => {
            return (
              r.toSegment &&
              toAirports.some(
                (fa) => fa.ToAirportName == r.toSegment.ToAirportName
              )
            );
          });
        }
      }
    }
    return data;
  }
  private initParagraphFlightRoutes(flightResult: FlightResultEntity) {
    console.time("initParagraphFlightRoutes");
    if (flightResult && flightResult.flightRoutesData) {
      const m = this.searchModel;
      if (m) {
        const routeIds = m.trips
          .filter((it) => it.bookInfo && !!it.bookInfo.flightRoute)
          .map((it) => it.bookInfo.flightRoute && it.bookInfo.flightRoute.Id)
          .filter((it) => !!it);
        const rids = routeIds.join(",");
        if (!routeIds.length) {
          flightResult.FlightRoutes = flightResult.flightRoutesData.filter(
            (r) => r.Paragraphs == 1
          );
        } else {
          const fares = flightResult.FlightFares.filter((it) => {
            const temp = it.FlightRouteIds || [];
            return temp.slice(0, routeIds.length).join(",") === rids;
          });
          flightResult.FlightRoutes = flightResult.flightRoutesData.filter(
            (it) => {
              // console.log("route color", it.color);
              return fares.some(
                (f) => f.FlightRouteIds[routeIds.length] == it.Id
              );
            }
          );
        }
      }
    }
    // console.log("initParagraphFlightRoutes ?????????", Date.now() - st);
    console.timeEnd("initParagraphFlightRoutes");
    return flightResult;
  }
  private async initParagraphCondition(data: FlightResultEntity) {
    // tslint:disable-next-line: no-console
    console.time("initParagraphCondition");
    const m = this.getSearchModel();
    const condition = this.getFilterCondition();
    condition.airComponies = [];
    condition.fromAirports = [];
    condition.toAirports = [];
    condition.isFilter = false;
    condition.timeSpan = { lower: 0, upper: 24 };
    condition.isDirectFly = false;
    if (data && data.flightRoutesData && m) {
      data = this.initParagraphFlightRoutes(data);
      data.FlightRoutes.forEach((r) => {
        if (r.fromSegment) {
          const s = r.fromSegment;
          if (!condition.airComponies.find((c) => c.label == s.AirlineName)) {
            condition.airComponies.push({
              label: s.AirlineName,
              isChecked: false,
              logoPic: s.AirlineSrc,
            });
          }
          if (
            !condition.fromAirports.find(
              (it) => it.FromAirportName == s.FromAirportName
            )
          ) {
            condition.fromAirports.push({
              FromAirport: s.FromAirport,
              FromAirportName: s.FromAirportName,
              FromCityName: s.FromCityName,
              FromTerminal: s.FromTerminal,
              label: s.FromAirportName,
            });
          }
        }
        if (r.toSegment) {
          const s = r.toSegment;
          if (
            !condition.toAirports.find(
              (it) => it.ToAirportName == s.ToAirportName
            )
          ) {
            condition.toAirports.push({
              ToAirport: s.ToAirport,
              ToAirportName: s.ToAirportName,
              ToCityName: s.ToCityName,
              ToTerminal: s.ToTerminal,
              label: s.ToAirportName,
            });
          }
        }

        return r;
      });
      this.setFilterConditionSource(condition);
      console.timeEnd("initParagraphCondition");
    }
  }
  private initFlightRoutesMinPriceFlightFare(data: FlightResultEntity) {
    try {
      const m = this.getSearchModel();
      const routeIds = m.trips
        .filter((it) => it.bookInfo && !!it.bookInfo.flightRoute)
        .map((it) => it.bookInfo.flightRoute && it.bookInfo.flightRoute.Id)
        .filter((it) => !!it);
      if (data.FlightRoutes) {
        data.FlightRoutes.forEach((r) => {
          const fares = data.FlightFares.filter((it) => {
            const temp = it.FlightRouteIds || [];
            return temp.join(",") === [...routeIds, r.Id].join(",");
          });
          fares.sort((a, b) => +a.SalesPrice - +b.SalesPrice);
          r.flightFares = fares;
          const flightFare = this.getMinPriceFlightFare(fares, [
            ...routeIds,
            r.Id,
          ]);
          if (flightFare) {
            r.minPriceFlightFare = flightFare;
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
    return data;
  }
  private initFlightRouteSegments(data: FlightResultEntity) {
    if (data && data.FlightSegments && data.FlightFares) {
      data = { ...data };
      if (!data.flightRoutesData || !data.flightRoutesData.length) {
        data.flightRoutesData = [
          ...data.FlightRoutes.map((r) => {
            return { ...r };
          }),
        ];
      }
      if (data.flightRoutesData && data.flightRoutesData.length) {
        data.flightRoutesData.sort((a, b) => {
          return a.FlightSegmentIds &&
            b.FlightSegmentIds &&
            a.FlightSegmentIds.length == b.FlightSegmentIds.length
            ? new Date(a.FirstTime).getTime() - new Date(b.FirstTime).getTime()
            : a.FlightSegmentIds.length - b.FlightSegmentIds.length;
        });
        data.flightRoutesData = data.flightRoutesData.map((flightRoute) => {
          flightRoute.vmFares = [];
          flightRoute.isShowFares = false;
          flightRoute.FlightSegments = flightRoute.FlightSegmentIds.map((it) =>
            data.FlightSegments.find((s) => s.Id == it)
          );
          flightRoute.transferSegments = [];
          flightRoute.FlightSegmentIds.forEach((id) => {
            const seg = data.FlightSegments.find((it) => it.Id == id);
            if (seg) {
              flightRoute.transferSegments.push({
                ...seg,
                FlyTime: this.getFlyTime(seg.Duration),
              });
            }
          });
          flightRoute.fromSegment = flightRoute.FlightSegments[0];
          if (flightRoute.fromSegment) {
            flightRoute.fromSegment.TakeoffTimeStamp = new Date(
              flightRoute.fromSegment.TakeoffTime
            ).getTime();
          }
          flightRoute.toSegment =
            flightRoute.FlightSegments[flightRoute.FlightSegments.length - 1];
          flightRoute.isTransfer = flightRoute.transferSegments.length > 1;
          flightRoute.minPriceFlightFare = this.getMinPriceFlightFare(
            data.FlightFares,
            [flightRoute.Id]
          );

          flightRoute.addDays = this.getDays(
            flightRoute.ArrivalTime,
            flightRoute.FirstTime
          );
          flightRoute.flyTime = this.getFlyTime(+flightRoute.Duration);
          return flightRoute;
        });
      }
    }
    return data;
  }
  private getDays(arrivalTime: string, firstTime: string) {
    const endTime = this.calendarService.getMoment(0, arrivalTime);
    const addDays = this.calendarService.diff(
      endTime.format("YYYY-MM-DD"),
      firstTime.substr(0, 10),
      "days"
    );
    return addDays;
  }
  getFlyTime(duration: number) {
    let flyTime = "";
    // tslint:disable-next-line: no-bitwise
    const h = ~~(duration / 60);
    const m = duration - h * 60;
    flyTime = `${h}H${m}M`;
    return flyTime;
  }
  private getMinPriceFlightFare(
    flightFares: FlightFareEntity[],
    routeIds: string[]
  ) {
    // console.time("getMinPriceFlightFare");
    const ffs = flightFares.filter((f) => {
      const ids = f.FlightRouteIds && f.FlightRouteIds;
      return routeIds.length > 1
        ? ids.slice(0, routeIds.length).join(",") == routeIds.join(",")
        : ids.some((id) => id == routeIds[0]);
    });
    let minPrice = Infinity;
    ffs.forEach((it) => {
      minPrice = Math.min(minPrice, +it.SalesPrice);
    });
    const flightFare = ffs.find((ff) => +ff.SalesPrice == +minPrice);
    // console.timeEnd("getMinPriceFlightFare");
    return flightFare;
  }
  async getInternationalAirports(forceFetch = false) {
    let airports = await this.tmcService.getInternationalAirports(forceFetch);
    const countries = await this.getCountries(forceFetch);
    if (countries && countries.length) {
      airports = airports.map((a) => {
        a.Country = countries.find((c) => c.Code == a.CountryCode);
        return a;
      });
    }
    return airports;
  }
  getCountries(forceFetch = false) {
    return this.tmcService.getCountries(forceFetch);
  }
  onCitySelected(city: TrafficlineEntity, isFrom: boolean) {
    if (this.searchModel && this.searchModel.trips) {
      const trip = this.searchModel.trips.find((t) => t.isSelectInfo);
      if (trip) {
        if (isFrom) {
          trip.fromCity = city;
        } else {
          trip.toCity = city;
        }
        this.searchModel.trips = this.searchModel.trips.map((it) => {
          it.isSelectInfo = false;
          return it;
        });
      }
      this.setSearchModelSource(this.searchModel);
    }
  }
  getSearchModel() {
    return this.searchModel;
  }
  setSearchModelSource(m: IInternationalFlightSearchModel) {
    this.searchModel = m;
    if (m) {
      if (m.voyageType == FlightVoyageType.GoBack) {
        if (m.trips) {
          const trip = m.trips[0];
          const backTrip = m.trips[1];
          if (trip && backTrip) {
            backTrip.fromCity = trip.toCity;
            backTrip.toCity = trip.fromCity;
          }
        }
      }
      if (m.voyageType == FlightVoyageType.OneWay) {
        this.lastOneWaySearchModel = m;
      }
    }
    if (this.searchModelSource) {
      this.searchModelSource.next(m);
    } else {
      this.searchModelSource = new BehaviorSubject(this.searchModel);
    }
  }
  getSearchModelSource() {
    return this.searchModelSource
      .asObservable()
      .pipe(filter((it) => it && !!it.voyageType));
  }
  setBookInfoSource(
    infos: PassengerBookInfo<IInternationalFlightSegmentInfo>[]
  ) {
    this.bookInfos = infos;
    this.bookInfoSource.next(infos);
  }
  getBookInfoSource() {
    return this.bookInfoSource.asObservable();
  }
  addPassengerBookInfo(
    arg: PassengerBookInfo<IInternationalFlightSegmentInfo>
  ): Promise<string> {
    console.log("addPassengerFlightSegments", arg);
    const infos = this.getBookInfos();
    if (!arg || !arg.passenger) {
      // AppHelper.alert(LanguageHelper.Flight.getMustSelectOneCredentialTip());
      return;
    }
    arg.id = AppHelper.uuid();
    if (arg.credential) {
      if (!arg.credential.Account || arg.isNotWhitelist) {
        arg.credential.Account = arg.passenger.Account;
      }
    }
    arg.isNotWhitelist = arg.passenger.isNotWhiteList;
    infos.push(arg);
    console.log("addPassengerFlightSegments added", arg);
    this.setBookInfoSource(infos);
  }
  removeBookInfo(
    bookInfo: PassengerBookInfo<IInternationalFlightSegmentInfo>,
    isRemovePassenger: boolean
  ) {
    const arg = { ...bookInfo };
    if (isRemovePassenger) {
      this.bookInfos = this.bookInfos.filter((it) => it.id !== arg.id);
    } else {
      this.bookInfos = this.bookInfos.map((it) => {
        if (it.id == arg.id) {
          it.bookInfo = null;
        }
        return it;
      });
    }
    this.setBookInfoSource(this.bookInfos);
  }
  getBookInfos() {
    return this.bookInfos || [];
  }
  removeAllBookInfos() {
    this.bookInfos = [];
    this.setBookInfoSource(this.getBookInfos());
  }
}
export interface IInternationalFlightQuery {
  FromAirport: string;
  ToAirport: string;
  Date: string;
  VoyageType: FlightVoyageType;
}
export interface ITripInfo {
  id: string;
  idx?: number;
  fromCity: TrafficlineEntity;
  date: string;
  toCity?: TrafficlineEntity;
  bookInfo?: IInternationalFlightSegmentInfo;
  isSelectInfo?: boolean;
}
export interface IInternationalFlightSearchModel {
  trips: ITripInfo[];
  voyageType: FlightVoyageType;
  cabin: IFlightCabinType;
  cabins: IFlightCabinType[];
}

export interface IInternationalFlightSegmentInfo {
  fromSegment: FlightSegmentEntity;
  toSegment: FlightSegmentEntity;
  flightRoute: FlightRouteEntity;
  id?: string;
}
