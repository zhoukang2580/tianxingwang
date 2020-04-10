import { Injectable } from "@angular/core";
import { ApiService } from "../services/api/api.service";
import { FlightSegmentEntity } from "../flight/models/flight/FlightSegmentEntity";
import { FlightPolicy } from "../flight/models/PassengerFlightInfo";
import { Subject, BehaviorSubject, throwError, of, Observable } from "rxjs";
import { IdentityService } from "../services/identity/identity.service";
import {
  PassengerBookInfo,
  TmcService,
  FlightHotelTrainType,
} from "../tmc/tmc.service";
import { TrafficlineEntity } from "../tmc/models/TrafficlineEntity";
import { CalendarService } from "../tmc/calendar.service";
import { AppHelper } from "../appHelper";
import { Router } from "@angular/router";
import { ModalController } from "@ionic/angular";
import { SelectDateComponent } from "../tmc/components/select-date/select-date.component";
import { TripType } from "../tmc/models/TripType";
import { DayModel } from "../tmc/models/DayModel";
import { RequestEntity } from "../services/api/Request.entity";
import { FlightResultEntity } from "../flight/models/FlightResultEntity";
import { IResponse } from "../services/api/IResponse";
import { tap } from "rxjs/operators";
import { MockInternationalFlightListData } from "./mock-data";
import { environment } from "src/environments/environment";
import { IdentityEntity } from "../services/identity/identity.entity";
import { LanguageHelper } from "../languageHelper";
export interface IFlightCabinType {
  label:
    | "经济舱"
    | "超级经济舱"
    | "头等舱"
    | "商务舱"
    | "超级商务舱"
    | "超级头等舱";
  value: FlightCabinInternationalType;
}
export enum FlightCabinInternationalType {
  /// <summary>
  /// 经济舱
  /// </summary>
  // [Description("经济舱")]
  ECONOMY = 11,
  /// <summary>
  /// 超级经济舱
  /// </summary>
  // [Description("超级经济舱")]
  PREMIUM_ECONOMY = 12,
  /// <summary>
  /// 头等舱
  /// </summary>
  // [Description("头等舱")]
  FIRST = 13,
  /// <summary>
  /// 商务舱
  /// </summary>
  // [Description("商务舱")]
  BUSINESS = 14,
  /// <summary>
  /// 超级商务舱
  /// </summary>
  // [Description("超级商务舱")]
  PREMIUM_BUSINESS = 15,
  /// <summary>
  /// 超级头等舱
  /// </summary>
  // [Description("超级头等舱")]
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
  ToAirportName?: string; // "大阪关西国际机场";
  ToCityName?: string; // "大阪";
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
  AirportCityCode: "BJS",
  CityCode: "1101",
  CityName: "北京",
  Code: "BJS",
  CountryCode: "CN",
  Description: "",
  EnglishName: "Beijing",
  Id: "9278",
  Initial: "bj",
  IsHot: true,
  Name: "北京",
  Nickname: "北京",
  Pinyin: "Beijing",
  Sequence: 2,
  Tag: "AirportCity",
} as TrafficlineEntity;
const fromCity = {
  AirportCityCode: "SHA",
  CityCode: "3101",
  CityName: "上海",
  Code: "SHA",
  CountryCode: "CN",
  Description: "",
  EnglishName: "Shanghai",
  Id: "9260",
  Initial: "",
  IsHot: true,
  Name: "上海",
  Nickname: "上海",
  Pinyin: "Shanghai",
  Sequence: 1,
  // 出发城市，不是出发城市的那个机场
  Tag: "AirportCity",
} as TrafficlineEntity;
@Injectable({
  providedIn: "root",
})
export class InternationalFlightService {
  private identity: IdentityEntity;
  private filterCondition: IFilterCondition;
  private filterConditionSource: Subject<IFilterCondition>;
  private searchModel: IInternationalFlightSearchModel;
  private searchModelSource: Subject<IInternationalFlightSearchModel>;
  private bookInfos: PassengerBookInfo<IInternationalFlightSegmentInfo>[];
  private bookInfoSource: Subject<
    PassengerBookInfo<IInternationalFlightSegmentInfo>[]
  >;
  private flightListResult: FlightResultEntity;
  constructor(
    private apiService: ApiService,
    private identityService: IdentityService,
    private calendarService: CalendarService,
    private tmcService: TmcService,
    private router: Router,
    private modalCtrl: ModalController
  ) {
    this.initSearchModel();
    this.bookInfoSource = new BehaviorSubject([]);
    this.initFilterCondition();
    this.identityService.getIdentitySource().subscribe((it) => {
      this.identity = it;
      this.disposal();
    });
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
  async onSelecFlyDate(isFrom: boolean, t: ITripInfo) {
    const dates = await this.openCalendar(false, isFrom, t);
    this.searchModel.roundTrip.isSelectInfo =
      t.id == this.searchModel.roundTrip.id;
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
          this.checkTripsDate();
        }
        if (this.searchModel.roundTrip.isSelectInfo) {
          if (isFrom) {
            this.searchModel.roundTrip.date = dates[0].date;
            if (this.searchModel.roundTrip.backDate) {
              const m1 = this.calendarService.getMoment(
                0,
                this.searchModel.roundTrip.date
              );
              const m2 = this.calendarService.getMoment(
                0,
                this.searchModel.roundTrip.backDate
              );
              if (+m1 > +m2) {
                AppHelper.alert(
                  "返程日期应晚于去程日期,自动调整日期？",
                  true,
                  "确定",
                  "取消"
                ).then((ok) => {
                  if (ok) {
                    this.searchModel.roundTrip.backDate = m1
                      .add(1, "days")
                      .format("YYYY-MM-DD");
                  }
                });
              }
            }
          } else {
            this.searchModel.roundTrip.backDate = dates[0].date;
          }
          this.searchModel.roundTrip.isSelectInfo = false;
        }
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
  async openCalendar(isMulti: boolean, isFrom: boolean, trip: ITripInfo) {
    const s = this.getSearchModel();
    const trips = s.trips || [];
    const idx = s.trips && s.trips.findIndex((it) => it == trip);
    const lastTrip = idx - 1 >= 0 ? trips[idx - 1] : null;
    const m = await this.modalCtrl.create({
      component: SelectDateComponent,
      componentProps: {
        goArrivalTime:
          s.voyageType == FlightVoyageType.MultiCity
            ? (lastTrip && lastTrip.date) || ""
            : s.roundTrip.id == trip.id
            ? !isFrom
              ? s.roundTrip.date
              : ""
            : "",
        tripType: isFrom ? TripType.departureTrip : TripType.returnTrip,
        forType: FlightHotelTrainType.InternationalFlight,
        isMulti,
      },
      // animated:false
    });
    await m.present();
    const d = await m.onDidDismiss();
    return d && (d.data as DayModel[]);
  }
  private initSearchModel() {
    this.searchModel = {
      roundTrip: {
        fromCity,
        toCity,
        date: this.calendarService.getMoment(1).format("YYYY-MM-DD"),
        id: AppHelper.uuid(),
        backDate: this.calendarService.getMoment(3).format("YYYY-MM-DD"),
      },
      voyageType: FlightVoyageType.OneWay,
      trips: [
        {
          fromCity,
          toCity,
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
        label: "经济舱",
        value: FlightCabinInternationalType.ECONOMY,
      },
      cabins: [
        {
          label: "经济舱",
          value: FlightCabinInternationalType.ECONOMY,
        },
        {
          label: "超级经济舱",
          value: FlightCabinInternationalType.PREMIUM_ECONOMY,
        },
        {
          label: "头等舱",
          value: FlightCabinInternationalType.FIRST,
        },
        {
          label: "商务舱",
          value: FlightCabinInternationalType.BUSINESS,
        },
        {
          label: "超级商务舱",
          value: FlightCabinInternationalType.PREMIUM_BUSINESS,
        },
        {
          label: "超级头等舱",
          value: FlightCabinInternationalType.PREMIUM_FIRST,
        },
      ],
    } as IInternationalFlightSearchModel;
    this.searchModelSource = new BehaviorSubject(this.searchModel);
  }
  disposal() {
    this.initSearchModel();
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
          `请完善第${idx + 1}程的${!one.fromCity ? "出发城市" : ""}${
            !one.toCity ? "到达城市" : ""
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
  getFlightList(forceFetch = false): Observable<IResponse<FlightResultEntity>> {
    const m = this.searchModel;
    const result: IResponse<FlightResultEntity> = {} as any;
    result.Data = this.flightListResult;
    if (!environment.production || !forceFetch) {
      result.Data = this.initFlightRouteSegments(
        MockInternationalFlightListData as any
      );
      if (
        forceFetch ||
        !this.flightListResult ||
        !this.flightListResult.FlightRoutes ||
        !this.flightListResult.FlightRoutes.length
      ) {
        this.flightListResult = result.Data;
        this.initParagraphCondition(result.Data);
      }
      result.Data = this.filterByCondition(result.Data);
      return of(result);
    }
    if (!m || !forceFetch) {
      if (
        this.flightListResult &&
        this.flightListResult.FlightSegments &&
        this.flightListResult.FlightSegments.length
      ) {
        const data = this.initFlightRouteSegments(this.flightListResult);
        result.Data = this.filterByCondition(data);
        return of(result);
      }
    }
    const req = new RequestEntity();
    let date = this.calendarService.getMoment(0).format("YYYY-MM-DD");
    let fromAirports: string[];
    let toAirports: string[];
    req.Method = `TmcApiInternationalFlightUrl-Home-Index`;
    const days = [m.roundTrip.date, m.roundTrip.backDate];
    if (m.voyageType == FlightVoyageType.OneWay) {
      date = m.roundTrip.date;
      fromAirports = [m.roundTrip.fromCity.Code];
      toAirports = [m.roundTrip.toCity.Code];
    }
    if (m.voyageType == FlightVoyageType.GoBack) {
      date = days.join(",");
      fromAirports = [m.roundTrip.fromCity.Code];
      toAirports = [m.roundTrip.toCity.Code];
    }
    if (m.voyageType == FlightVoyageType.MultiCity) {
      date = m.trips.map((it) => it.date).join(",");
      fromAirports = m.trips
        .map((it) => it.fromCity && it.fromCity.AirportCityCode)
        .filter((it) => !!it);
      toAirports = m.trips
        .map((it) => it.toCity && it.toCity.AirportCityCode)
        .filter((it) => !!it);
    }
    req.Data = {
      Date: date,
      FromAirport: fromAirports.join(","),
      ToAirport: toAirports.join(","),
      VoyageType: m.voyageType,
      Cabin: FlightCabinInternationalType[m.cabin && m.cabin.value],
    };
    req.IsShowLoading = true;
    req.LoadingMsg = "正在获取航班列表...";
    return this.apiService.getResponse<FlightResultEntity>(req).pipe(
      tap((r) => {
        this.flightListResult = this.initFlightRouteSegments(r.Data);
        this.initParagraphCondition(this.flightListResult);
      })
    );
  }
  private filterByCondition(data: FlightResultEntity) {
    const condition = this.getFilterCondition();
    data = this.filterByAirports(data);
    data = this.filterByAirComponies(data);
    if (condition && data && data.FlightRoutes) {
      if (condition.isDirectFly) {
        data.FlightRoutes = data.FlightRoutes.filter((it) => !it.isTransfer);
      }
    }
    data = this.filterByTimeSpan(data);
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
                (fa) => fa.ToAirportName == r.fromSegment.ToAirportName
              )
            );
          });
        }
      }
    }
    return data;
  }
  private initParagraphCondition(data: FlightResultEntity) {
    let paragraph = 1;
    const m = this.getSearchModel();
    if (m) {
      if (m.voyageType == FlightVoyageType.MultiCity) {
        const pra = m.trips && m.trips.findIndex((it) => !it.bookInfo);
        if (pra > -1) {
          paragraph = pra + 1;
        }
      }
    }
    const condition = this.getFilterCondition();
    condition.airComponies = [];
    condition.fromAirports = [];
    condition.toAirports = [];
    condition.isFilter = false;
    condition.timeSpan = { lower: 0, upper: 24 };
    condition.isDirectFly = false;
    if (data && data.FlightRoutesData && paragraph) {
      data.FlightRoutes = data.FlightRoutesData.filter(
        (r) => r.Paragraphs == paragraph
      );
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
    }
  }
  private initFlightRouteSegments(data: FlightResultEntity) {
    if (data && data.FlightSegments && data.FlightFares) {
      data = { ...data };
      if (!data.FlightRoutesData || !data.FlightRoutesData.length) {
        data.FlightRoutesData = [...data.FlightRoutes];
      }
      if (data.FlightRoutesData && data.FlightRoutesData.length) {
        data.FlightRoutesData.sort((a, b) => {
          return a.FlightSegmentIds &&
            b.FlightSegmentIds &&
            a.FlightSegmentIds.length == b.FlightSegmentIds.length
            ? new Date(a.FirstTime).getTime() - new Date(b.FirstTime).getTime()
            : a.FlightSegmentIds.length - b.FlightSegmentIds.length;
        });
        data.FlightRoutesData = data.FlightRoutesData.map((flightRoute) => {
          flightRoute.FlightSegments = flightRoute.FlightSegmentIds.map((it) =>
            data.FlightSegments.find((s) => s.Id == it)
          );
          flightRoute.transferSegments = data.FlightSegments.filter((s) =>
            flightRoute.FlightSegmentIds.some((id) => id == s.Id)
          );
          flightRoute.fromSegment = flightRoute.FlightSegments[0];
          if (flightRoute.fromSegment) {
            flightRoute.fromSegment.TakeoffTimeStamp = new Date(
              flightRoute.fromSegment.TakeoffTime
            ).getTime();
          }
          flightRoute.toSegment =
            flightRoute.FlightSegments[flightRoute.FlightSegments.length - 1];
          flightRoute.isTransfer = flightRoute.transferSegments.length > 1;
          const ffs = data.FlightFares.filter(
            (f) =>
              f.FlightRouteIds &&
              f.FlightRouteIds.some((a) => a == flightRoute.Id)
          );
          let minPrice = Infinity;
          ffs.forEach((it) => {
            minPrice = Math.min(minPrice, +it.SalesPrice);
          });
          flightRoute.flightFare = ffs.find((ff) => +ff.SalesPrice == minPrice);
          return flightRoute;
        });
      }
    }
    return data;
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
  beforeSelectCity(isFrom: boolean, trip: ITripInfo) {
    if (this.searchModel) {
      this.searchModel.roundTrip.isSelectInfo =
        trip.id == this.searchModel.roundTrip.id;
      if (this.searchModel.voyageType == FlightVoyageType.MultiCity) {
        if (this.searchModel.trips) {
          this.searchModel.trips = this.searchModel.trips.map((t) => {
            t.isSelectInfo = t.id == trip.id;
            return t;
          });
        }
      }
    }
    this.setSearchModelSource(this.searchModel);
    this.router.navigate(
      [AppHelper.getRoutePath("select-international-flight-city")],
      {
        queryParams: { requestCode: isFrom ? "select_from_city" : "to_city" },
      }
    );
  }
  afterCitySelected(city: TrafficlineEntity, isFrom: boolean) {
    if (this.searchModel) {
      if (this.searchModel.voyageType == FlightVoyageType.MultiCity) {
        if (this.searchModel.trips) {
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
        }
      }
      if (
        this.searchModel.roundTrip.isSelectInfo &&
        !this.searchModel.roundTrip.isLocked
      ) {
        if (isFrom) {
          this.searchModel.roundTrip.fromCity = city;
        } else {
          this.searchModel.roundTrip.toCity = city;
        }
        this.searchModel.roundTrip.isSelectInfo = false;
      }
      this.setSearchModelSource(this.searchModel);
    }
  }
  getSearchModel() {
    return this.searchModel;
  }
  setSearchModelSource(m: IInternationalFlightSearchModel) {
    this.searchModel = m;
    this.searchModelSource.next(m);
  }
  getSearchModelSource() {
    return this.searchModelSource.asObservable();
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
  fromCity: TrafficlineEntity;
  date: string;
  toCity?: TrafficlineEntity;
  bookInfo?: IInternationalFlightSegmentInfo;
  isSelectInfo?: boolean;
}
export interface IInternationalFlightSearchModel {
  roundTrip: ITripInfo & {
    backDate: string;
    isLocked: boolean;
    goTrip: IInternationalFlightSegmentInfo;
    backTrip: IInternationalFlightSegmentInfo;
  };
  trips: ITripInfo[];
  voyageType: FlightVoyageType;
  cabin: IFlightCabinType;
  cabins: IFlightCabinType[];
}

export interface IInternationalFlightSegmentInfo {
  flightSegment: FlightSegmentEntity;
  flightPolicy: FlightPolicy;
  isDontAllowBook?: boolean;
  id?: string;
}
