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
import { FlightRouteEntity } from "../flight/models/flight/FlightRouteEntity";
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
  private lastOneWaySearchModel: IInternationalFlightSearchModel; // 上一次选择的单程trip信息
  private lastGobackSearchModel: IInternationalFlightSearchModel; // 上一次选择的往返trip信息
  private lastMultiTripSearchModel: IInternationalFlightSearchModel; // 上一次选择的多程trip信息
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
    this.initOneWaySearModel();
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
    const m = await this.modalCtrl.create({
      component: SelectDateComponent,
      componentProps: {
        goArrivalTime,
        tripType: isFrom ? TripType.departureTrip : TripType.returnTrip,
        forType: FlightHotelTrainType.InternationalFlight,
        isMulti,
      },
    });
    await m.present();
    const d = await m.onDidDismiss();
    return d && (d.data as DayModel[]);
  }
  initOneWaySearModel() {
    if (this.lastOneWaySearchModel) {
      this.setSearchModelSource(this.lastOneWaySearchModel);
      return;
    }
    this.searchModel = {
      voyageType: FlightVoyageType.OneWay,
      trips: [
        {
          fromCity,
          toCity,
          date: this.calendarService.getMoment(1).format("YYYY-MM-DD"),
          id: AppHelper.uuid(),
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
    };
    this.setSearchModelSource(this.searchModel);
  }
  initGoBackSearchModel() {
    if (this.lastGobackSearchModel) {
      this.setSearchModelSource(this.lastGobackSearchModel);
      return;
    }
    this.searchModel = {
      voyageType: FlightVoyageType.GoBack,
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
          toCity: fromCity,
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
    };
    this.setSearchModelSource(this.searchModel);
  }
  initMultiTripSearchModel() {
    if (this.lastMultiTripSearchModel) {
      this.setSearchModelSource(this.lastMultiTripSearchModel);
      return;
    }
    this.searchModel = {
      voyageType: FlightVoyageType.MultiCity,
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
    };
    if (!environment.production) {
      this.searchModel = {
        voyageType: FlightVoyageType.MultiCity,
        trips: [
          {
            fromCity: {
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
              Tag: "AirportCity",
            },
            toCity: {
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
            },
            date: "2020-04-11",
            id: "b7a753b5-65fb-4e",
            isSelectInfo: false,
            bookInfo: {
              flightPolicy: null,
              fromSegment: {
                Id: 16,
                LowestFare: 0,
                LowestCabinCode: null,
                LowestCabinId: null,
                LowestDiscount: 0,
                LowestCabinType: 0,
                LowestCabinFareType: 0,
                Tax: 0,
                FuelFee: 0,
                AirportFee: 0,
                YFare: 0,
                CFare: 0,
                FFare: 0,
                Number: "DL6541",
                Airline: "DL",
                AirlineSrc:
                  "http://test.shared.testskytrip.com/img/airlinelogo/dl.gif",
                AirlineName: "达美航空",
                PlaneType: "330",
                MealType: 0,
                Meal: "",
                Link: null,
                IsChooseSeat: false,
                PlaneTypeDescribe: "33L",
                CodeShareNumber: "MU5137",
                Carrier: "MU",
                CarrierName: "东方航空",
                FromAirport: "SHA",
                ToAirport: "PEK",
                FromAirportName: "虹桥国际机场",
                FromCityName: "上海",
                ToAirportName: "首都国际机场",
                ToCityName: "北京",
                TakeoffTime: "2020-07-08T07:00:00",
                ArrivalTime: "2020-07-08T09:20:00",
                FromTerminal: "T2",
                ToTerminal: "T2",
                IsStop: false,
                BasicPrice: 0,
                LowerPrice: 0,
                LowerFlightNumber: null,
                CurrentLowestFare: 0,
                StopCities: null,
                Variables: null,
                Distance: 676,
                CabinCode: null,
                Cabins: null,
                StopCitiesCount: 0,
                Avl:
                  "J:4,C:4,D:4,I:4,Z:0,Y:9,B:9,M:9,H:9,Q:9,K:9,L:9,U:9,T:9,X:9,V:0",
                AircraftChange: false,
                ET: true,
                Duration: 140,
                FlyTime: 140,
                FlyTimeName: "2h20m",
                MealTypeName: null,
                TakeoffTimeStamp: 1594162800000,
              },
              toSegment: {
                Id: 16,
                LowestFare: 0,
                LowestCabinCode: null,
                LowestCabinId: null,
                LowestDiscount: 0,
                LowestCabinType: 0,
                LowestCabinFareType: 0,
                Tax: 0,
                FuelFee: 0,
                AirportFee: 0,
                YFare: 0,
                CFare: 0,
                FFare: 0,
                Number: "DL6541",
                Airline: "DL",
                AirlineSrc:
                  "http://test.shared.testskytrip.com/img/airlinelogo/dl.gif",
                AirlineName: "达美航空",
                PlaneType: "330",
                MealType: 0,
                Meal: "",
                Link: null,
                IsChooseSeat: false,
                PlaneTypeDescribe: "33L",
                CodeShareNumber: "MU5137",
                Carrier: "MU",
                CarrierName: "东方航空",
                FromAirport: "SHA",
                ToAirport: "PEK",
                FromAirportName: "虹桥国际机场",
                FromCityName: "上海",
                ToAirportName: "首都国际机场",
                ToCityName: "北京",
                TakeoffTime: "2020-07-08T07:00:00",
                ArrivalTime: "2020-07-08T09:20:00",
                FromTerminal: "T2",
                ToTerminal: "T2",
                IsStop: false,
                BasicPrice: 0,
                LowerPrice: 0,
                LowerFlightNumber: null,
                CurrentLowestFare: 0,
                StopCities: null,
                Variables: null,
                Distance: 676,
                CabinCode: null,
                Cabins: null,
                StopCitiesCount: 0,
                Avl:
                  "J:4,C:4,D:4,I:4,Z:0,Y:9,B:9,M:9,H:9,Q:9,K:9,L:9,U:9,T:9,X:9,V:0",
                AircraftChange: false,
                ET: true,
                Duration: 140,
                FlyTime: 140,
                FlyTimeName: "2h20m",
                MealTypeName: null,
                TakeoffTimeStamp: 1594162800000,
              },
              flightRoute: {
                Id: 11,
                FlightSegmentIds: [16],
                Paragraphs: 1,
                FirstTime: "2020-07-08T07:00:00",
                Week: "周三",
                ArrivalTime: "2020-07-08T09:20:00",
                Airline: "DL",
                FlightRouteIds: [8, 8, 8, 8, 8],
                Origin: "SHA",
                FromCountry: "CN",
                Destination: "BJS",
                ToCountry: "CN",
                Duration: 140,
                MaxDuration: 140,
                Type: 1,
                TypeName: "经济舱",
                Cabin: "Y",
                YFare: 0,
                CFare: 0,
                FFare: 0,
                IsAllowOrder: false,
                Rules: null,
                Key: "3993CB0445DB6375900B5518E12752AE",
                FlightSegments: [
                  {
                    Id: 16,
                    LowestFare: 0,
                    LowestCabinCode: null,
                    LowestCabinId: null,
                    LowestDiscount: 0,
                    LowestCabinType: 0,
                    LowestCabinFareType: 0,
                    Tax: 0,
                    FuelFee: 0,
                    AirportFee: 0,
                    YFare: 0,
                    CFare: 0,
                    FFare: 0,
                    Number: "DL6541",
                    Airline: "DL",
                    AirlineSrc:
                      "http://test.shared.testskytrip.com/img/airlinelogo/dl.gif",
                    AirlineName: "达美航空",
                    PlaneType: "330",
                    MealType: 0,
                    Meal: "",
                    Link: null,
                    IsChooseSeat: false,
                    PlaneTypeDescribe: "33L",
                    CodeShareNumber: "MU5137",
                    Carrier: "MU",
                    CarrierName: "东方航空",
                    FromAirport: "SHA",
                    ToAirport: "PEK",
                    FromAirportName: "虹桥国际机场",
                    FromCityName: "上海",
                    ToAirportName: "首都国际机场",
                    ToCityName: "北京",
                    TakeoffTime: "2020-07-08T07:00:00",
                    ArrivalTime: "2020-07-08T09:20:00",
                    FromTerminal: "T2",
                    ToTerminal: "T2",
                    IsStop: false,
                    BasicPrice: 0,
                    LowerPrice: 0,
                    LowerFlightNumber: null,
                    CurrentLowestFare: 0,
                    StopCities: null,
                    Variables: null,
                    Distance: 676,
                    CabinCode: null,
                    Cabins: null,
                    StopCitiesCount: 0,
                    Avl:
                      "J:4,C:4,D:4,I:4,Z:0,Y:9,B:9,M:9,H:9,Q:9,K:9,L:9,U:9,T:9,X:9,V:0",
                    AircraftChange: false,
                    ET: true,
                    Duration: 140,
                    FlyTime: 140,
                    FlyTimeName: "2h20m",
                    MealTypeName: null,
                    TakeoffTimeStamp: 1594162800000,
                  },
                ],
                transferSegments: [
                  {
                    Id: 16,
                    LowestFare: 0,
                    LowestCabinCode: null,
                    LowestCabinId: null,
                    LowestDiscount: 0,
                    LowestCabinType: 0,
                    LowestCabinFareType: 0,
                    Tax: 0,
                    FuelFee: 0,
                    AirportFee: 0,
                    YFare: 0,
                    CFare: 0,
                    FFare: 0,
                    Number: "DL6541",
                    Airline: "DL",
                    AirlineSrc:
                      "http://test.shared.testskytrip.com/img/airlinelogo/dl.gif",
                    AirlineName: "达美航空",
                    PlaneType: "330",
                    MealType: 0,
                    Meal: "",
                    Link: null,
                    IsChooseSeat: false,
                    PlaneTypeDescribe: "33L",
                    CodeShareNumber: "MU5137",
                    Carrier: "MU",
                    CarrierName: "东方航空",
                    FromAirport: "SHA",
                    ToAirport: "PEK",
                    FromAirportName: "虹桥国际机场",
                    FromCityName: "上海",
                    ToAirportName: "首都国际机场",
                    ToCityName: "北京",
                    TakeoffTime: "2020-07-08T07:00:00",
                    ArrivalTime: "2020-07-08T09:20:00",
                    FromTerminal: "T2",
                    ToTerminal: "T2",
                    IsStop: false,
                    BasicPrice: 0,
                    LowerPrice: 0,
                    LowerFlightNumber: null,
                    CurrentLowestFare: 0,
                    StopCities: null,
                    Variables: null,
                    Distance: 676,
                    CabinCode: null,
                    Cabins: null,
                    StopCitiesCount: 0,
                    Avl:
                      "J:4,C:4,D:4,I:4,Z:0,Y:9,B:9,M:9,H:9,Q:9,K:9,L:9,U:9,T:9,X:9,V:0",
                    AircraftChange: false,
                    ET: true,
                    Duration: 140,
                    FlyTime: 140,
                    FlyTimeName: "2h20m",
                    MealTypeName: null,
                    TakeoffTimeStamp: 1594162800000,
                  },
                ],
                fromSegment: {
                  Id: 16,
                  LowestFare: 0,
                  LowestCabinCode: null,
                  LowestCabinId: null,
                  LowestDiscount: 0,
                  LowestCabinType: 0,
                  LowestCabinFareType: 0,
                  Tax: 0,
                  FuelFee: 0,
                  AirportFee: 0,
                  YFare: 0,
                  CFare: 0,
                  FFare: 0,
                  Number: "DL6541",
                  Airline: "DL",
                  AirlineSrc:
                    "http://test.shared.testskytrip.com/img/airlinelogo/dl.gif",
                  AirlineName: "达美航空",
                  PlaneType: "330",
                  MealType: 0,
                  Meal: "",
                  Link: null,
                  IsChooseSeat: false,
                  PlaneTypeDescribe: "33L",
                  CodeShareNumber: "MU5137",
                  Carrier: "MU",
                  CarrierName: "东方航空",
                  FromAirport: "SHA",
                  ToAirport: "PEK",
                  FromAirportName: "虹桥国际机场",
                  FromCityName: "上海",
                  ToAirportName: "首都国际机场",
                  ToCityName: "北京",
                  TakeoffTime: "2020-07-08T07:00:00",
                  ArrivalTime: "2020-07-08T09:20:00",
                  FromTerminal: "T2",
                  ToTerminal: "T2",
                  IsStop: false,
                  BasicPrice: 0,
                  LowerPrice: 0,
                  LowerFlightNumber: null,
                  CurrentLowestFare: 0,
                  StopCities: null,
                  Variables: null,
                  Distance: 676,
                  CabinCode: null,
                  Cabins: null,
                  StopCitiesCount: 0,
                  Avl:
                    "J:4,C:4,D:4,I:4,Z:0,Y:9,B:9,M:9,H:9,Q:9,K:9,L:9,U:9,T:9,X:9,V:0",
                  AircraftChange: false,
                  ET: true,
                  Duration: 140,
                  FlyTime: 140,
                  FlyTimeName: "2h20m",
                  MealTypeName: null,
                  TakeoffTimeStamp: 1594162800000,
                },
                toSegment: {
                  Id: 16,
                  LowestFare: 0,
                  LowestCabinCode: null,
                  LowestCabinId: null,
                  LowestDiscount: 0,
                  LowestCabinType: 0,
                  LowestCabinFareType: 0,
                  Tax: 0,
                  FuelFee: 0,
                  AirportFee: 0,
                  YFare: 0,
                  CFare: 0,
                  FFare: 0,
                  Number: "DL6541",
                  Airline: "DL",
                  AirlineSrc:
                    "http://test.shared.testskytrip.com/img/airlinelogo/dl.gif",
                  AirlineName: "达美航空",
                  PlaneType: "330",
                  MealType: 0,
                  Meal: "",
                  Link: null,
                  IsChooseSeat: false,
                  PlaneTypeDescribe: "33L",
                  CodeShareNumber: "MU5137",
                  Carrier: "MU",
                  CarrierName: "东方航空",
                  FromAirport: "SHA",
                  ToAirport: "PEK",
                  FromAirportName: "虹桥国际机场",
                  FromCityName: "上海",
                  ToAirportName: "首都国际机场",
                  ToCityName: "北京",
                  TakeoffTime: "2020-07-08T07:00:00",
                  ArrivalTime: "2020-07-08T09:20:00",
                  FromTerminal: "T2",
                  ToTerminal: "T2",
                  IsStop: false,
                  BasicPrice: 0,
                  LowerPrice: 0,
                  LowerFlightNumber: null,
                  CurrentLowestFare: 0,
                  StopCities: null,
                  Variables: null,
                  Distance: 676,
                  CabinCode: null,
                  Cabins: null,
                  StopCitiesCount: 0,
                  Avl:
                    "J:4,C:4,D:4,I:4,Z:0,Y:9,B:9,M:9,H:9,Q:9,K:9,L:9,U:9,T:9,X:9,V:0",
                  AircraftChange: false,
                  ET: true,
                  Duration: 140,
                  FlyTime: 140,
                  FlyTimeName: "2h20m",
                  MealTypeName: null,
                  TakeoffTimeStamp: 1594162800000,
                },
                isTransfer: false,
                flightFare: {
                  Id: 7,
                  FlightRouteIds: [11, 8, 9],
                  FlightFareBasics: [
                    {
                      FlightRouteId: 11,
                      FareBasic: "KHW0ZLMD",
                      IsOnlyFareIdBasic: false,
                    },
                    {
                      FlightRouteId: 8,
                      FareBasic: "KHW0ZLMD",
                      IsOnlyFareIdBasic: false,
                    },
                    {
                      FlightRouteId: 9,
                      FareBasic: "TKX0ZRME",
                      IsOnlyFareIdBasic: true,
                    },
                  ],
                  BookType: 4,
                  BookCode: null,
                  FlightNumber: null,
                  SupplierType: 1,
                  FareType: 1,
                  Name: null,
                  Type: 1,
                  Code: null,
                  CabinCodes: { "12": "K", "13": "T", "14": "T", "16": "K" },
                  OfficeCode: "SHA396",
                  TicketPrice: 9010,
                  SettlePrice: 9010,
                  SalesPrice: 9010,
                  Tax: 2169,
                  SettleTax: 0,
                  Reward: 0,
                  Discount: 0,
                  Count: 1,
                  Variables: { FareBasis: "KHW0ZLMD,TKX0ZRME" },
                  Explain: null,
                  FlightFareRules: [
                    {
                      RouteId: 11,
                      Bags: [
                        {
                          FlightNumber: "DL6541",
                          AllowedPieces: 2,
                          AllowedWeight: 0,
                          AllowedWeightUnit: "",
                          FreeAllowedPieces: 1,
                          FreeAllowedWeight: 0,
                          FreeAllowedWeightUnit: "",
                        },
                      ],
                      Variables: {
                        RuleRef1:
                          "key(RuleTariff::Rule::OWRT::Routing::Footnote1::Footnote2::PassengerType::FareType::OriginAddonTariff::OriginAddonFootnote1::OriginAddonFootnote2::DestinationAddonTariff::DestinationAddonFootnote1::DestinationAddonFootnote2::TravelAgencyCode::IataNumber::DepartmentCode::Origin::Destination::FareSource::FbrBaseTariff::FbrBaseRule::AccountCode::FbrBaseFareBasis::OriginAddonRouting::DestinationAddonRouting)",
                        RuleRef2:
                          "003::4MTR::2::1300::::::ADT::XAP::::::::::::::SHA396::08300843::::SHA::SEA::ATPCO::::::::::::",
                      },
                    },
                    {
                      RouteId: 8,
                      Bags: [
                        {
                          FlightNumber: "DL128",
                          AllowedPieces: 2,
                          AllowedWeight: 0,
                          AllowedWeightUnit: "",
                          FreeAllowedPieces: 1,
                          FreeAllowedWeight: 0,
                          FreeAllowedWeightUnit: "",
                        },
                      ],
                      Variables: {
                        RuleRef1:
                          "key(RuleTariff::Rule::OWRT::Routing::Footnote1::Footnote2::PassengerType::FareType::OriginAddonTariff::OriginAddonFootnote1::OriginAddonFootnote2::DestinationAddonTariff::DestinationAddonFootnote1::DestinationAddonFootnote2::TravelAgencyCode::IataNumber::DepartmentCode::Origin::Destination::FareSource::FbrBaseTariff::FbrBaseRule::AccountCode::FbrBaseFareBasis::OriginAddonRouting::DestinationAddonRouting)",
                        RuleRef2:
                          "003::4MTR::2::1300::::::ADT::XAP::::::::::::::SHA396::08300843::::SHA::SEA::ATPCO::::::::::::",
                      },
                    },
                    {
                      RouteId: 9,
                      Bags: [
                        {
                          FlightNumber: "DL9011",
                          AllowedPieces: 2,
                          AllowedWeight: 0,
                          AllowedWeightUnit: "",
                          FreeAllowedPieces: 1,
                          FreeAllowedWeight: 0,
                          FreeAllowedWeightUnit: "",
                        },
                        {
                          FlightNumber: "DL7852",
                          AllowedPieces: 2,
                          AllowedWeight: 0,
                          AllowedWeightUnit: "",
                          FreeAllowedPieces: 1,
                          FreeAllowedWeight: 0,
                          FreeAllowedWeightUnit: "",
                        },
                      ],
                      Variables: {
                        RuleRef1:
                          "key(RuleTariff::Rule::OWRT::Routing::Footnote1::Footnote2::PassengerType::FareType::OriginAddonTariff::OriginAddonFootnote1::OriginAddonFootnote2::DestinationAddonTariff::DestinationAddonFootnote1::DestinationAddonFootnote2::TravelAgencyCode::IataNumber::DepartmentCode::Origin::Destination::FareSource::FbrBaseTariff::FbrBaseRule::AccountCode::FbrBaseFareBasis::OriginAddonRouting::DestinationAddonRouting)",
                        RuleRef2:
                          "003::2MTR::2::7000::::::ADT::XAP::::::::::::::SHA396::08300843::::SEA::BKK::ATPCO::::::::::::",
                      },
                    },
                  ],
                  LowerSegment: null,
                  InsuranceProducts: null,
                  TicketTimeLimit: "2020-04-12T14:02:00",
                  Percent: 0,
                  IataTax: 403,
                  YQYRTax: 1766,
                  PlatingCarrier: "DL",
                  Forms: null,
                  TmcId: 0,
                  TypeName: "经济舱",
                  FareTypeName: "公布运价",
                  SupplierTypeName: "Ibe",
                  IsAllowOrder: false,
                  Rules: null,
                  FlightPolicy: null,
                },
              },
              id: "e153d92c-8ed5-45",
            },
          },
          {
            id: "2fa08a8b-9a27-40",
            fromCity: {
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
            },
            date: "2020-04-13",
            isSelectInfo: false,
            toCity: {
              Id: 6711,
              Tag: "AirportInternational",
              Code: "SEA",
              Name: "塔克马国际机场",
              Nickname: "塔克马国际机场",
              Pinyin: "TAKEMA",
              Initial: "TKM",
              AirportCityCode: "SEA",
              CityCode: "SEA",
              CityName: "西雅图",
              Description: "",
              IsHot: true,
              CountryCode: "US",
              Sequence: 0,
              EnglishName: "SEATTLE/TACOMA INTERNATIONAL APT",
              Country: { Id: 207, Name: "美国", Code: "US", Sequence: 2 },
              matchStr: "sea,塔克马国际机场,塔克马国际机场,西雅图,takema,sea",
            },
            bookInfo: {
              flightPolicy: null,
              fromSegment: {
                Id: 12,
                LowestFare: 0,
                LowestCabinCode: null,
                LowestCabinId: null,
                LowestDiscount: 0,
                LowestCabinType: 0,
                LowestCabinFareType: 0,
                Tax: 0,
                FuelFee: 0,
                AirportFee: 0,
                YFare: 0,
                CFare: 0,
                FFare: 0,
                Number: "DL128",
                Airline: "DL",
                AirlineSrc:
                  "http://test.shared.testskytrip.com/img/airlinelogo/dl.gif",
                AirlineName: "达美航空",
                PlaneType: "330",
                MealType: 0,
                Meal: "D",
                Link: null,
                IsChooseSeat: false,
                PlaneTypeDescribe: "339",
                CodeShareNumber: null,
                Carrier: "DL",
                CarrierName: "达美航空",
                FromAirport: "PKX",
                ToAirport: "SEA",
                FromAirportName: "大兴国际机场",
                FromCityName: "北京",
                ToAirportName: "塔克马国际机场",
                ToCityName: "西雅图",
                TakeoffTime: "2020-07-11T11:45:00",
                ArrivalTime: "2020-07-11T07:44:00",
                FromTerminal: "",
                ToTerminal: "",
                IsStop: false,
                BasicPrice: 0,
                LowerPrice: 0,
                LowerFlightNumber: null,
                CurrentLowestFare: 0,
                StopCities: null,
                Variables: null,
                Distance: 5393,
                CabinCode: null,
                Cabins: null,
                StopCitiesCount: 0,
                Avl:
                  "J:9,C:9,D:9,I:9,Z:9,P:9,A:9,G:9,W:9,S:9,Y:9,B:9,M:9,H:9,Q:9,K:9,L:9,U:9,T:9,X:9,V:9,E:9",
                AircraftChange: false,
                ET: true,
                Duration: 659,
                FlyTime: -241,
                FlyTimeName: "-5h-1m",
                MealTypeName: null,
                TakeoffTimeStamp: 1594439100000,
              },
              toSegment: {
                Id: 12,
                LowestFare: 0,
                LowestCabinCode: null,
                LowestCabinId: null,
                LowestDiscount: 0,
                LowestCabinType: 0,
                LowestCabinFareType: 0,
                Tax: 0,
                FuelFee: 0,
                AirportFee: 0,
                YFare: 0,
                CFare: 0,
                FFare: 0,
                Number: "DL128",
                Airline: "DL",
                AirlineSrc:
                  "http://test.shared.testskytrip.com/img/airlinelogo/dl.gif",
                AirlineName: "达美航空",
                PlaneType: "330",
                MealType: 0,
                Meal: "D",
                Link: null,
                IsChooseSeat: false,
                PlaneTypeDescribe: "339",
                CodeShareNumber: null,
                Carrier: "DL",
                CarrierName: "达美航空",
                FromAirport: "PKX",
                ToAirport: "SEA",
                FromAirportName: "大兴国际机场",
                FromCityName: "北京",
                ToAirportName: "塔克马国际机场",
                ToCityName: "西雅图",
                TakeoffTime: "2020-07-11T11:45:00",
                ArrivalTime: "2020-07-11T07:44:00",
                FromTerminal: "",
                ToTerminal: "",
                IsStop: false,
                BasicPrice: 0,
                LowerPrice: 0,
                LowerFlightNumber: null,
                CurrentLowestFare: 0,
                StopCities: null,
                Variables: null,
                Distance: 5393,
                CabinCode: null,
                Cabins: null,
                StopCitiesCount: 0,
                Avl:
                  "J:9,C:9,D:9,I:9,Z:9,P:9,A:9,G:9,W:9,S:9,Y:9,B:9,M:9,H:9,Q:9,K:9,L:9,U:9,T:9,X:9,V:9,E:9",
                AircraftChange: false,
                ET: true,
                Duration: 659,
                FlyTime: -241,
                FlyTimeName: "-5h-1m",
                MealTypeName: null,
                TakeoffTimeStamp: 1594439100000,
              },
              flightRoute: {
                Id: 8,
                FlightSegmentIds: [12],
                Paragraphs: 2,
                FirstTime: "2020-07-11T11:45:00",
                Week: "周六",
                ArrivalTime: "2020-07-11T07:44:00",
                Airline: "DL",
                FlightRouteIds: [
                  9,
                  9,
                  9,
                  9,
                  9,
                  14,
                  14,
                  14,
                  14,
                  14,
                  15,
                  15,
                  15,
                  15,
                  15,
                  16,
                  17,
                  17,
                  17,
                  17,
                  17,
                  16,
                  16,
                  16,
                  16,
                ],
                Origin: "BJS",
                FromCountry: "CN",
                Destination: "SEA",
                ToCountry: "US",
                Duration: 659,
                MaxDuration: 659,
                Type: 1,
                TypeName: "经济舱",
                Cabin: "Y",
                YFare: 0,
                CFare: 0,
                FFare: 0,
                IsAllowOrder: false,
                Rules: null,
                Key: "2B91FE95D3D0E87E6FD407946555085F",
                FlightSegments: [
                  {
                    Id: 12,
                    LowestFare: 0,
                    LowestCabinCode: null,
                    LowestCabinId: null,
                    LowestDiscount: 0,
                    LowestCabinType: 0,
                    LowestCabinFareType: 0,
                    Tax: 0,
                    FuelFee: 0,
                    AirportFee: 0,
                    YFare: 0,
                    CFare: 0,
                    FFare: 0,
                    Number: "DL128",
                    Airline: "DL",
                    AirlineSrc:
                      "http://test.shared.testskytrip.com/img/airlinelogo/dl.gif",
                    AirlineName: "达美航空",
                    PlaneType: "330",
                    MealType: 0,
                    Meal: "D",
                    Link: null,
                    IsChooseSeat: false,
                    PlaneTypeDescribe: "339",
                    CodeShareNumber: null,
                    Carrier: "DL",
                    CarrierName: "达美航空",
                    FromAirport: "PKX",
                    ToAirport: "SEA",
                    FromAirportName: "大兴国际机场",
                    FromCityName: "北京",
                    ToAirportName: "塔克马国际机场",
                    ToCityName: "西雅图",
                    TakeoffTime: "2020-07-11T11:45:00",
                    ArrivalTime: "2020-07-11T07:44:00",
                    FromTerminal: "",
                    ToTerminal: "",
                    IsStop: false,
                    BasicPrice: 0,
                    LowerPrice: 0,
                    LowerFlightNumber: null,
                    CurrentLowestFare: 0,
                    StopCities: null,
                    Variables: null,
                    Distance: 5393,
                    CabinCode: null,
                    Cabins: null,
                    StopCitiesCount: 0,
                    Avl:
                      "J:9,C:9,D:9,I:9,Z:9,P:9,A:9,G:9,W:9,S:9,Y:9,B:9,M:9,H:9,Q:9,K:9,L:9,U:9,T:9,X:9,V:9,E:9",
                    AircraftChange: false,
                    ET: true,
                    Duration: 659,
                    FlyTime: -241,
                    FlyTimeName: "-5h-1m",
                    MealTypeName: null,
                    TakeoffTimeStamp: 1594439100000,
                  },
                ],
                transferSegments: [
                  {
                    Id: 12,
                    LowestFare: 0,
                    LowestCabinCode: null,
                    LowestCabinId: null,
                    LowestDiscount: 0,
                    LowestCabinType: 0,
                    LowestCabinFareType: 0,
                    Tax: 0,
                    FuelFee: 0,
                    AirportFee: 0,
                    YFare: 0,
                    CFare: 0,
                    FFare: 0,
                    Number: "DL128",
                    Airline: "DL",
                    AirlineSrc:
                      "http://test.shared.testskytrip.com/img/airlinelogo/dl.gif",
                    AirlineName: "达美航空",
                    PlaneType: "330",
                    MealType: 0,
                    Meal: "D",
                    Link: null,
                    IsChooseSeat: false,
                    PlaneTypeDescribe: "339",
                    CodeShareNumber: null,
                    Carrier: "DL",
                    CarrierName: "达美航空",
                    FromAirport: "PKX",
                    ToAirport: "SEA",
                    FromAirportName: "大兴国际机场",
                    FromCityName: "北京",
                    ToAirportName: "塔克马国际机场",
                    ToCityName: "西雅图",
                    TakeoffTime: "2020-07-11T11:45:00",
                    ArrivalTime: "2020-07-11T07:44:00",
                    FromTerminal: "",
                    ToTerminal: "",
                    IsStop: false,
                    BasicPrice: 0,
                    LowerPrice: 0,
                    LowerFlightNumber: null,
                    CurrentLowestFare: 0,
                    StopCities: null,
                    Variables: null,
                    Distance: 5393,
                    CabinCode: null,
                    Cabins: null,
                    StopCitiesCount: 0,
                    Avl:
                      "J:9,C:9,D:9,I:9,Z:9,P:9,A:9,G:9,W:9,S:9,Y:9,B:9,M:9,H:9,Q:9,K:9,L:9,U:9,T:9,X:9,V:9,E:9",
                    AircraftChange: false,
                    ET: true,
                    Duration: 659,
                    FlyTime: -241,
                    FlyTimeName: "-5h-1m",
                    MealTypeName: null,
                    TakeoffTimeStamp: 1594439100000,
                  },
                ],
                fromSegment: {
                  Id: 12,
                  LowestFare: 0,
                  LowestCabinCode: null,
                  LowestCabinId: null,
                  LowestDiscount: 0,
                  LowestCabinType: 0,
                  LowestCabinFareType: 0,
                  Tax: 0,
                  FuelFee: 0,
                  AirportFee: 0,
                  YFare: 0,
                  CFare: 0,
                  FFare: 0,
                  Number: "DL128",
                  Airline: "DL",
                  AirlineSrc:
                    "http://test.shared.testskytrip.com/img/airlinelogo/dl.gif",
                  AirlineName: "达美航空",
                  PlaneType: "330",
                  MealType: 0,
                  Meal: "D",
                  Link: null,
                  IsChooseSeat: false,
                  PlaneTypeDescribe: "339",
                  CodeShareNumber: null,
                  Carrier: "DL",
                  CarrierName: "达美航空",
                  FromAirport: "PKX",
                  ToAirport: "SEA",
                  FromAirportName: "大兴国际机场",
                  FromCityName: "北京",
                  ToAirportName: "塔克马国际机场",
                  ToCityName: "西雅图",
                  TakeoffTime: "2020-07-11T11:45:00",
                  ArrivalTime: "2020-07-11T07:44:00",
                  FromTerminal: "",
                  ToTerminal: "",
                  IsStop: false,
                  BasicPrice: 0,
                  LowerPrice: 0,
                  LowerFlightNumber: null,
                  CurrentLowestFare: 0,
                  StopCities: null,
                  Variables: null,
                  Distance: 5393,
                  CabinCode: null,
                  Cabins: null,
                  StopCitiesCount: 0,
                  Avl:
                    "J:9,C:9,D:9,I:9,Z:9,P:9,A:9,G:9,W:9,S:9,Y:9,B:9,M:9,H:9,Q:9,K:9,L:9,U:9,T:9,X:9,V:9,E:9",
                  AircraftChange: false,
                  ET: true,
                  Duration: 659,
                  FlyTime: -241,
                  FlyTimeName: "-5h-1m",
                  MealTypeName: null,
                  TakeoffTimeStamp: 1594439100000,
                },
                toSegment: {
                  Id: 12,
                  LowestFare: 0,
                  LowestCabinCode: null,
                  LowestCabinId: null,
                  LowestDiscount: 0,
                  LowestCabinType: 0,
                  LowestCabinFareType: 0,
                  Tax: 0,
                  FuelFee: 0,
                  AirportFee: 0,
                  YFare: 0,
                  CFare: 0,
                  FFare: 0,
                  Number: "DL128",
                  Airline: "DL",
                  AirlineSrc:
                    "http://test.shared.testskytrip.com/img/airlinelogo/dl.gif",
                  AirlineName: "达美航空",
                  PlaneType: "330",
                  MealType: 0,
                  Meal: "D",
                  Link: null,
                  IsChooseSeat: false,
                  PlaneTypeDescribe: "339",
                  CodeShareNumber: null,
                  Carrier: "DL",
                  CarrierName: "达美航空",
                  FromAirport: "PKX",
                  ToAirport: "SEA",
                  FromAirportName: "大兴国际机场",
                  FromCityName: "北京",
                  ToAirportName: "塔克马国际机场",
                  ToCityName: "西雅图",
                  TakeoffTime: "2020-07-11T11:45:00",
                  ArrivalTime: "2020-07-11T07:44:00",
                  FromTerminal: "",
                  ToTerminal: "",
                  IsStop: false,
                  BasicPrice: 0,
                  LowerPrice: 0,
                  LowerFlightNumber: null,
                  CurrentLowestFare: 0,
                  StopCities: null,
                  Variables: null,
                  Distance: 5393,
                  CabinCode: null,
                  Cabins: null,
                  StopCitiesCount: 0,
                  Avl:
                    "J:9,C:9,D:9,I:9,Z:9,P:9,A:9,G:9,W:9,S:9,Y:9,B:9,M:9,H:9,Q:9,K:9,L:9,U:9,T:9,X:9,V:9,E:9",
                  AircraftChange: false,
                  ET: true,
                  Duration: 659,
                  FlyTime: -241,
                  FlyTimeName: "-5h-1m",
                  MealTypeName: null,
                  TakeoffTimeStamp: 1594439100000,
                },
                isTransfer: false,
                flightFare: {
                  Id: 5,
                  FlightRouteIds: [7, 8, 9],
                  FlightFareBasics: [
                    {
                      FlightRouteId: 7,
                      FareBasic: "KHW0ZLMD",
                      IsOnlyFareIdBasic: false,
                    },
                    {
                      FlightRouteId: 8,
                      FareBasic: "KHW0ZLMD",
                      IsOnlyFareIdBasic: false,
                    },
                    {
                      FlightRouteId: 9,
                      FareBasic: "TKX0ZRME",
                      IsOnlyFareIdBasic: true,
                    },
                  ],
                  BookType: 4,
                  BookCode: null,
                  FlightNumber: null,
                  SupplierType: 1,
                  FareType: 1,
                  Name: null,
                  Type: 1,
                  Code: null,
                  CabinCodes: { "11": "K", "12": "K", "13": "T", "14": "T" },
                  OfficeCode: "SHA396",
                  TicketPrice: 9010,
                  SettlePrice: 9010,
                  SalesPrice: 9010,
                  Tax: 2169,
                  SettleTax: 0,
                  Reward: 0,
                  Discount: 0,
                  Count: 1,
                  Variables: { FareBasis: "KHW0ZLMD,TKX0ZRME" },
                  Explain: null,
                  FlightFareRules: [
                    {
                      RouteId: 7,
                      Bags: [
                        {
                          FlightNumber: "DL6410",
                          AllowedPieces: 2,
                          AllowedWeight: 0,
                          AllowedWeightUnit: "",
                          FreeAllowedPieces: 1,
                          FreeAllowedWeight: 0,
                          FreeAllowedWeightUnit: "",
                        },
                      ],
                      Variables: {
                        RuleRef1:
                          "key(RuleTariff::Rule::OWRT::Routing::Footnote1::Footnote2::PassengerType::FareType::OriginAddonTariff::OriginAddonFootnote1::OriginAddonFootnote2::DestinationAddonTariff::DestinationAddonFootnote1::DestinationAddonFootnote2::TravelAgencyCode::IataNumber::DepartmentCode::Origin::Destination::FareSource::FbrBaseTariff::FbrBaseRule::AccountCode::FbrBaseFareBasis::OriginAddonRouting::DestinationAddonRouting)",
                        RuleRef2:
                          "003::4MTR::2::1300::::::ADT::XAP::::::::::::::SHA396::08300843::::SHA::SEA::ATPCO::::::::::::",
                      },
                    },
                    {
                      RouteId: 8,
                      Bags: [
                        {
                          FlightNumber: "DL128",
                          AllowedPieces: 2,
                          AllowedWeight: 0,
                          AllowedWeightUnit: "",
                          FreeAllowedPieces: 1,
                          FreeAllowedWeight: 0,
                          FreeAllowedWeightUnit: "",
                        },
                      ],
                      Variables: {
                        RuleRef1:
                          "key(RuleTariff::Rule::OWRT::Routing::Footnote1::Footnote2::PassengerType::FareType::OriginAddonTariff::OriginAddonFootnote1::OriginAddonFootnote2::DestinationAddonTariff::DestinationAddonFootnote1::DestinationAddonFootnote2::TravelAgencyCode::IataNumber::DepartmentCode::Origin::Destination::FareSource::FbrBaseTariff::FbrBaseRule::AccountCode::FbrBaseFareBasis::OriginAddonRouting::DestinationAddonRouting)",
                        RuleRef2:
                          "003::4MTR::2::1300::::::ADT::XAP::::::::::::::SHA396::08300843::::SHA::SEA::ATPCO::::::::::::",
                      },
                    },
                    {
                      RouteId: 9,
                      Bags: [
                        {
                          FlightNumber: "DL9011",
                          AllowedPieces: 2,
                          AllowedWeight: 0,
                          AllowedWeightUnit: "",
                          FreeAllowedPieces: 1,
                          FreeAllowedWeight: 0,
                          FreeAllowedWeightUnit: "",
                        },
                        {
                          FlightNumber: "DL7852",
                          AllowedPieces: 2,
                          AllowedWeight: 0,
                          AllowedWeightUnit: "",
                          FreeAllowedPieces: 1,
                          FreeAllowedWeight: 0,
                          FreeAllowedWeightUnit: "",
                        },
                      ],
                      Variables: {
                        RuleRef1:
                          "key(RuleTariff::Rule::OWRT::Routing::Footnote1::Footnote2::PassengerType::FareType::OriginAddonTariff::OriginAddonFootnote1::OriginAddonFootnote2::DestinationAddonTariff::DestinationAddonFootnote1::DestinationAddonFootnote2::TravelAgencyCode::IataNumber::DepartmentCode::Origin::Destination::FareSource::FbrBaseTariff::FbrBaseRule::AccountCode::FbrBaseFareBasis::OriginAddonRouting::DestinationAddonRouting)",
                        RuleRef2:
                          "003::2MTR::2::7000::::::ADT::XAP::::::::::::::SHA396::08300843::::SEA::BKK::ATPCO::::::::::::",
                      },
                    },
                  ],
                  LowerSegment: null,
                  InsuranceProducts: null,
                  TicketTimeLimit: "2020-04-12T14:02:00",
                  Percent: 0,
                  IataTax: 403,
                  YQYRTax: 1766,
                  PlatingCarrier: "DL",
                  Forms: null,
                  TmcId: 0,
                  TypeName: "经济舱",
                  FareTypeName: "公布运价",
                  SupplierTypeName: "Ibe",
                  IsAllowOrder: false,
                  Rules: null,
                  FlightPolicy: null,
                },
              },
              id: "c5cfb668-79cf-4a",
            },
          },
          {
            id: "dc5bf1c8-d46d-4a",
            fromCity: {
              Id: 6711,
              Tag: "AirportInternational",
              Code: "SEA",
              Name: "塔克马国际机场",
              Nickname: "塔克马国际机场",
              Pinyin: "TAKEMA",
              Initial: "TKM",
              AirportCityCode: "SEA",
              CityCode: "SEA",
              CityName: "西雅图",
              Description: "",
              IsHot: true,
              CountryCode: "US",
              Sequence: 0,
              EnglishName: "SEATTLE/TACOMA INTERNATIONAL APT",
              Country: { Id: 207, Name: "美国", Code: "US", Sequence: 2 },
              matchStr: "sea,塔克马国际机场,塔克马国际机场,西雅图,takema,sea",
            },
            date: "2020-04-16",
            isSelectInfo: false,
            toCity: {
              Id: 778,
              Tag: "AirportInternational",
              Code: "BKK",
              Name: "曼谷国际机场",
              Nickname: "曼谷国际机场",
              Pinyin: "manguguojijichang",
              Initial: "MGGJJC",
              AirportCityCode: "BKK",
              CityCode: "BKK",
              CityName: "曼谷",
              Description: "",
              IsHot: true,
              CountryCode: "TH",
              Sequence: 0,
              EnglishName: "BANGKOK SUVARNABHUMI INTERNATIONAL APT",
              Country: { Id: 194, Name: "泰国", Code: "TH", Sequence: 999 },
              matchStr:
                "bkk,曼谷国际机场,曼谷国际机场,曼谷,manguguojijichang,bkk",
            },
            bookInfo: {
              flightPolicy: null,
              fromSegment: {
                Id: 21,
                LowestFare: 0,
                LowestCabinCode: null,
                LowestCabinId: null,
                LowestDiscount: 0,
                LowestCabinType: 0,
                LowestCabinFareType: 0,
                Tax: 0,
                FuelFee: 0,
                AirportFee: 0,
                YFare: 0,
                CFare: 0,
                FFare: 0,
                Number: "DL281",
                Airline: "DL",
                AirlineSrc:
                  "http://test.shared.testskytrip.com/img/airlinelogo/dl.gif",
                AirlineName: "达美航空",
                PlaneType: "330",
                MealType: 0,
                Meal: "D",
                Link: null,
                IsChooseSeat: false,
                PlaneTypeDescribe: "339",
                CodeShareNumber: null,
                Carrier: "DL",
                CarrierName: "达美航空",
                FromAirport: "SEA",
                ToAirport: "PVG",
                FromAirportName: "塔克马国际机场",
                FromCityName: "西雅图",
                ToAirportName: "浦东国际机场",
                ToCityName: "上海",
                TakeoffTime: "2020-07-20T11:47:00",
                ArrivalTime: "2020-07-21T15:10:00",
                FromTerminal: "",
                ToTerminal: "1",
                IsStop: false,
                BasicPrice: 0,
                LowerPrice: 0,
                LowerFlightNumber: null,
                CurrentLowestFare: 0,
                StopCities: null,
                Variables: { AddDaysTip: "0" },
                Distance: 5717,
                CabinCode: null,
                Cabins: null,
                StopCitiesCount: 0,
                Avl:
                  "J:9,C:9,D:9,I:4,Z:4,P:9,A:9,G:9,W:9,S:9,Y:9,B:9,M:9,H:9,Q:9,K:9,L:9,U:9,T:9,X:9,V:9,E:9",
                AircraftChange: false,
                ET: true,
                Duration: 743,
                FlyTime: 1643,
                FlyTimeName: "27h23m",
                MealTypeName: null,
                TakeoffTimeStamp: 1595216820000,
              },
              toSegment: {
                Id: 22,
                LowestFare: 0,
                LowestCabinCode: null,
                LowestCabinId: null,
                LowestDiscount: 0,
                LowestCabinType: 0,
                LowestCabinFareType: 0,
                Tax: 0,
                FuelFee: 0,
                AirportFee: 0,
                YFare: 0,
                CFare: 0,
                FFare: 0,
                Number: "DL6341",
                Airline: "DL",
                AirlineSrc:
                  "http://test.shared.testskytrip.com/img/airlinelogo/dl.gif",
                AirlineName: "达美航空",
                PlaneType: "737",
                MealType: 0,
                Meal: "",
                Link: null,
                IsChooseSeat: false,
                PlaneTypeDescribe: "73E",
                CodeShareNumber: "FM853",
                Carrier: "FM",
                CarrierName: "上海航空",
                FromAirport: "PVG",
                ToAirport: "BKK",
                FromAirportName: "浦东国际机场",
                FromCityName: "上海",
                ToAirportName: "曼谷国际机场",
                ToCityName: "曼谷",
                TakeoffTime: "2020-07-21T18:25:00",
                ArrivalTime: "2020-07-21T21:55:00",
                FromTerminal: "T1",
                ToTerminal: "",
                IsStop: false,
                BasicPrice: 0,
                LowerPrice: 0,
                LowerFlightNumber: null,
                CurrentLowestFare: 0,
                StopCities: null,
                Variables: { AddDaysTip: "1" },
                Distance: 1787,
                CabinCode: null,
                Cabins: null,
                StopCitiesCount: 0,
                Avl:
                  "J:4,C:4,D:4,I:4,Z:4,Y:9,B:9,M:9,H:9,Q:9,K:9,L:9,U:9,T:0,X:0,V:0",
                AircraftChange: false,
                ET: true,
                Duration: 270,
                FlyTime: 210,
                FlyTimeName: "3h30m",
                MealTypeName: null,
              },
              flightRoute: {
                Id: 17,
                FlightSegmentIds: [21, 22],
                Paragraphs: 3,
                FirstTime: "2020-07-20T11:47:00",
                Week: "周一",
                ArrivalTime: "2020-07-21T21:55:00",
                Airline: "DL",
                FlightRouteIds: null,
                Origin: "SEA",
                FromCountry: "US",
                Destination: "BKK",
                ToCountry: "TH",
                Duration: 1208,
                MaxDuration: 743,
                Type: 1,
                TypeName: "经济舱",
                Cabin: "Y",
                YFare: 0,
                CFare: 0,
                FFare: 0,
                IsAllowOrder: false,
                Rules: null,
                Key: "1F9E406A6EFD1CDA5C2FF7E49B215719",
                FlightSegments: [
                  {
                    Id: 21,
                    LowestFare: 0,
                    LowestCabinCode: null,
                    LowestCabinId: null,
                    LowestDiscount: 0,
                    LowestCabinType: 0,
                    LowestCabinFareType: 0,
                    Tax: 0,
                    FuelFee: 0,
                    AirportFee: 0,
                    YFare: 0,
                    CFare: 0,
                    FFare: 0,
                    Number: "DL281",
                    Airline: "DL",
                    AirlineSrc:
                      "http://test.shared.testskytrip.com/img/airlinelogo/dl.gif",
                    AirlineName: "达美航空",
                    PlaneType: "330",
                    MealType: 0,
                    Meal: "D",
                    Link: null,
                    IsChooseSeat: false,
                    PlaneTypeDescribe: "339",
                    CodeShareNumber: null,
                    Carrier: "DL",
                    CarrierName: "达美航空",
                    FromAirport: "SEA",
                    ToAirport: "PVG",
                    FromAirportName: "塔克马国际机场",
                    FromCityName: "西雅图",
                    ToAirportName: "浦东国际机场",
                    ToCityName: "上海",
                    TakeoffTime: "2020-07-20T11:47:00",
                    ArrivalTime: "2020-07-21T15:10:00",
                    FromTerminal: "",
                    ToTerminal: "1",
                    IsStop: false,
                    BasicPrice: 0,
                    LowerPrice: 0,
                    LowerFlightNumber: null,
                    CurrentLowestFare: 0,
                    StopCities: null,
                    Variables: { AddDaysTip: "0" },
                    Distance: 5717,
                    CabinCode: null,
                    Cabins: null,
                    StopCitiesCount: 0,
                    Avl:
                      "J:9,C:9,D:9,I:4,Z:4,P:9,A:9,G:9,W:9,S:9,Y:9,B:9,M:9,H:9,Q:9,K:9,L:9,U:9,T:9,X:9,V:9,E:9",
                    AircraftChange: false,
                    ET: true,
                    Duration: 743,
                    FlyTime: 1643,
                    FlyTimeName: "27h23m",
                    MealTypeName: null,
                    TakeoffTimeStamp: 1595216820000,
                  },
                  {
                    Id: 22,
                    LowestFare: 0,
                    LowestCabinCode: null,
                    LowestCabinId: null,
                    LowestDiscount: 0,
                    LowestCabinType: 0,
                    LowestCabinFareType: 0,
                    Tax: 0,
                    FuelFee: 0,
                    AirportFee: 0,
                    YFare: 0,
                    CFare: 0,
                    FFare: 0,
                    Number: "DL6341",
                    Airline: "DL",
                    AirlineSrc:
                      "http://test.shared.testskytrip.com/img/airlinelogo/dl.gif",
                    AirlineName: "达美航空",
                    PlaneType: "737",
                    MealType: 0,
                    Meal: "",
                    Link: null,
                    IsChooseSeat: false,
                    PlaneTypeDescribe: "73E",
                    CodeShareNumber: "FM853",
                    Carrier: "FM",
                    CarrierName: "上海航空",
                    FromAirport: "PVG",
                    ToAirport: "BKK",
                    FromAirportName: "浦东国际机场",
                    FromCityName: "上海",
                    ToAirportName: "曼谷国际机场",
                    ToCityName: "曼谷",
                    TakeoffTime: "2020-07-21T18:25:00",
                    ArrivalTime: "2020-07-21T21:55:00",
                    FromTerminal: "T1",
                    ToTerminal: "",
                    IsStop: false,
                    BasicPrice: 0,
                    LowerPrice: 0,
                    LowerFlightNumber: null,
                    CurrentLowestFare: 0,
                    StopCities: null,
                    Variables: { AddDaysTip: "1" },
                    Distance: 1787,
                    CabinCode: null,
                    Cabins: null,
                    StopCitiesCount: 0,
                    Avl:
                      "J:4,C:4,D:4,I:4,Z:4,Y:9,B:9,M:9,H:9,Q:9,K:9,L:9,U:9,T:0,X:0,V:0",
                    AircraftChange: false,
                    ET: true,
                    Duration: 270,
                    FlyTime: 210,
                    FlyTimeName: "3h30m",
                    MealTypeName: null,
                  },
                ],
                transferSegments: [
                  {
                    Id: 21,
                    LowestFare: 0,
                    LowestCabinCode: null,
                    LowestCabinId: null,
                    LowestDiscount: 0,
                    LowestCabinType: 0,
                    LowestCabinFareType: 0,
                    Tax: 0,
                    FuelFee: 0,
                    AirportFee: 0,
                    YFare: 0,
                    CFare: 0,
                    FFare: 0,
                    Number: "DL281",
                    Airline: "DL",
                    AirlineSrc:
                      "http://test.shared.testskytrip.com/img/airlinelogo/dl.gif",
                    AirlineName: "达美航空",
                    PlaneType: "330",
                    MealType: 0,
                    Meal: "D",
                    Link: null,
                    IsChooseSeat: false,
                    PlaneTypeDescribe: "339",
                    CodeShareNumber: null,
                    Carrier: "DL",
                    CarrierName: "达美航空",
                    FromAirport: "SEA",
                    ToAirport: "PVG",
                    FromAirportName: "塔克马国际机场",
                    FromCityName: "西雅图",
                    ToAirportName: "浦东国际机场",
                    ToCityName: "上海",
                    TakeoffTime: "2020-07-20T11:47:00",
                    ArrivalTime: "2020-07-21T15:10:00",
                    FromTerminal: "",
                    ToTerminal: "1",
                    IsStop: false,
                    BasicPrice: 0,
                    LowerPrice: 0,
                    LowerFlightNumber: null,
                    CurrentLowestFare: 0,
                    StopCities: null,
                    Variables: { AddDaysTip: "0" },
                    Distance: 5717,
                    CabinCode: null,
                    Cabins: null,
                    StopCitiesCount: 0,
                    Avl:
                      "J:9,C:9,D:9,I:4,Z:4,P:9,A:9,G:9,W:9,S:9,Y:9,B:9,M:9,H:9,Q:9,K:9,L:9,U:9,T:9,X:9,V:9,E:9",
                    AircraftChange: false,
                    ET: true,
                    Duration: 743,
                    FlyTime: 1643,
                    FlyTimeName: "27h23m",
                    MealTypeName: null,
                    TakeoffTimeStamp: 1595216820000,
                  },
                  {
                    Id: 22,
                    LowestFare: 0,
                    LowestCabinCode: null,
                    LowestCabinId: null,
                    LowestDiscount: 0,
                    LowestCabinType: 0,
                    LowestCabinFareType: 0,
                    Tax: 0,
                    FuelFee: 0,
                    AirportFee: 0,
                    YFare: 0,
                    CFare: 0,
                    FFare: 0,
                    Number: "DL6341",
                    Airline: "DL",
                    AirlineSrc:
                      "http://test.shared.testskytrip.com/img/airlinelogo/dl.gif",
                    AirlineName: "达美航空",
                    PlaneType: "737",
                    MealType: 0,
                    Meal: "",
                    Link: null,
                    IsChooseSeat: false,
                    PlaneTypeDescribe: "73E",
                    CodeShareNumber: "FM853",
                    Carrier: "FM",
                    CarrierName: "上海航空",
                    FromAirport: "PVG",
                    ToAirport: "BKK",
                    FromAirportName: "浦东国际机场",
                    FromCityName: "上海",
                    ToAirportName: "曼谷国际机场",
                    ToCityName: "曼谷",
                    TakeoffTime: "2020-07-21T18:25:00",
                    ArrivalTime: "2020-07-21T21:55:00",
                    FromTerminal: "T1",
                    ToTerminal: "",
                    IsStop: false,
                    BasicPrice: 0,
                    LowerPrice: 0,
                    LowerFlightNumber: null,
                    CurrentLowestFare: 0,
                    StopCities: null,
                    Variables: { AddDaysTip: "1" },
                    Distance: 1787,
                    CabinCode: null,
                    Cabins: null,
                    StopCitiesCount: 0,
                    Avl:
                      "J:4,C:4,D:4,I:4,Z:4,Y:9,B:9,M:9,H:9,Q:9,K:9,L:9,U:9,T:0,X:0,V:0",
                    AircraftChange: false,
                    ET: true,
                    Duration: 270,
                    FlyTime: 210,
                    FlyTimeName: "3h30m",
                    MealTypeName: null,
                  },
                ],
                fromSegment: {
                  Id: 21,
                  LowestFare: 0,
                  LowestCabinCode: null,
                  LowestCabinId: null,
                  LowestDiscount: 0,
                  LowestCabinType: 0,
                  LowestCabinFareType: 0,
                  Tax: 0,
                  FuelFee: 0,
                  AirportFee: 0,
                  YFare: 0,
                  CFare: 0,
                  FFare: 0,
                  Number: "DL281",
                  Airline: "DL",
                  AirlineSrc:
                    "http://test.shared.testskytrip.com/img/airlinelogo/dl.gif",
                  AirlineName: "达美航空",
                  PlaneType: "330",
                  MealType: 0,
                  Meal: "D",
                  Link: null,
                  IsChooseSeat: false,
                  PlaneTypeDescribe: "339",
                  CodeShareNumber: null,
                  Carrier: "DL",
                  CarrierName: "达美航空",
                  FromAirport: "SEA",
                  ToAirport: "PVG",
                  FromAirportName: "塔克马国际机场",
                  FromCityName: "西雅图",
                  ToAirportName: "浦东国际机场",
                  ToCityName: "上海",
                  TakeoffTime: "2020-07-20T11:47:00",
                  ArrivalTime: "2020-07-21T15:10:00",
                  FromTerminal: "",
                  ToTerminal: "1",
                  IsStop: false,
                  BasicPrice: 0,
                  LowerPrice: 0,
                  LowerFlightNumber: null,
                  CurrentLowestFare: 0,
                  StopCities: null,
                  Variables: { AddDaysTip: "0" },
                  Distance: 5717,
                  CabinCode: null,
                  Cabins: null,
                  StopCitiesCount: 0,
                  Avl:
                    "J:9,C:9,D:9,I:4,Z:4,P:9,A:9,G:9,W:9,S:9,Y:9,B:9,M:9,H:9,Q:9,K:9,L:9,U:9,T:9,X:9,V:9,E:9",
                  AircraftChange: false,
                  ET: true,
                  Duration: 743,
                  FlyTime: 1643,
                  FlyTimeName: "27h23m",
                  MealTypeName: null,
                  TakeoffTimeStamp: 1595216820000,
                },
                toSegment: {
                  Id: 22,
                  LowestFare: 0,
                  LowestCabinCode: null,
                  LowestCabinId: null,
                  LowestDiscount: 0,
                  LowestCabinType: 0,
                  LowestCabinFareType: 0,
                  Tax: 0,
                  FuelFee: 0,
                  AirportFee: 0,
                  YFare: 0,
                  CFare: 0,
                  FFare: 0,
                  Number: "DL6341",
                  Airline: "DL",
                  AirlineSrc:
                    "http://test.shared.testskytrip.com/img/airlinelogo/dl.gif",
                  AirlineName: "达美航空",
                  PlaneType: "737",
                  MealType: 0,
                  Meal: "",
                  Link: null,
                  IsChooseSeat: false,
                  PlaneTypeDescribe: "73E",
                  CodeShareNumber: "FM853",
                  Carrier: "FM",
                  CarrierName: "上海航空",
                  FromAirport: "PVG",
                  ToAirport: "BKK",
                  FromAirportName: "浦东国际机场",
                  FromCityName: "上海",
                  ToAirportName: "曼谷国际机场",
                  ToCityName: "曼谷",
                  TakeoffTime: "2020-07-21T18:25:00",
                  ArrivalTime: "2020-07-21T21:55:00",
                  FromTerminal: "T1",
                  ToTerminal: "",
                  IsStop: false,
                  BasicPrice: 0,
                  LowerPrice: 0,
                  LowerFlightNumber: null,
                  CurrentLowestFare: 0,
                  StopCities: null,
                  Variables: { AddDaysTip: "1" },
                  Distance: 1787,
                  CabinCode: null,
                  Cabins: null,
                  StopCitiesCount: 0,
                  Avl:
                    "J:4,C:4,D:4,I:4,Z:4,Y:9,B:9,M:9,H:9,Q:9,K:9,L:9,U:9,T:0,X:0,V:0",
                  AircraftChange: false,
                  ET: true,
                  Duration: 270,
                  FlyTime: 210,
                  FlyTimeName: "3h30m",
                  MealTypeName: null,
                },
                isTransfer: true,
                flightFare: {
                  Id: 21,
                  FlightRouteIds: [7, 8, 17],
                  FlightFareBasics: [
                    {
                      FlightRouteId: 7,
                      FareBasic: "KHW0ZLMD",
                      IsOnlyFareIdBasic: false,
                    },
                    {
                      FlightRouteId: 8,
                      FareBasic: "KHW0ZLMD",
                      IsOnlyFareIdBasic: false,
                    },
                    {
                      FlightRouteId: 17,
                      FareBasic: "UKX0ZRME",
                      IsOnlyFareIdBasic: true,
                    },
                  ],
                  BookType: 4,
                  BookCode: null,
                  FlightNumber: null,
                  SupplierType: 1,
                  FareType: 1,
                  Name: null,
                  Type: 1,
                  Code: null,
                  CabinCodes: { "11": "K", "12": "K", "21": "U", "22": "U" },
                  OfficeCode: "SHA396",
                  TicketPrice: 9470,
                  SettlePrice: 9470,
                  SalesPrice: 9470,
                  Tax: 2200,
                  SettleTax: 0,
                  Reward: 0,
                  Discount: 0,
                  Count: 1,
                  Variables: { FareBasis: "KHW0ZLMD,UKX0ZRME" },
                  Explain: null,
                  FlightFareRules: [
                    {
                      RouteId: 7,
                      Bags: [
                        {
                          FlightNumber: "DL6410",
                          AllowedPieces: 2,
                          AllowedWeight: 0,
                          AllowedWeightUnit: "",
                          FreeAllowedPieces: 1,
                          FreeAllowedWeight: 0,
                          FreeAllowedWeightUnit: "",
                        },
                      ],
                      Variables: {
                        RuleRef1:
                          "key(RuleTariff::Rule::OWRT::Routing::Footnote1::Footnote2::PassengerType::FareType::OriginAddonTariff::OriginAddonFootnote1::OriginAddonFootnote2::DestinationAddonTariff::DestinationAddonFootnote1::DestinationAddonFootnote2::TravelAgencyCode::IataNumber::DepartmentCode::Origin::Destination::FareSource::FbrBaseTariff::FbrBaseRule::AccountCode::FbrBaseFareBasis::OriginAddonRouting::DestinationAddonRouting)",
                        RuleRef2:
                          "003::4MTR::2::1300::::::ADT::XAP::::::::::::::SHA396::08300843::::SHA::SEA::ATPCO::::::::::::",
                      },
                    },
                    {
                      RouteId: 8,
                      Bags: [
                        {
                          FlightNumber: "DL128",
                          AllowedPieces: 2,
                          AllowedWeight: 0,
                          AllowedWeightUnit: "",
                          FreeAllowedPieces: 1,
                          FreeAllowedWeight: 0,
                          FreeAllowedWeightUnit: "",
                        },
                      ],
                      Variables: {
                        RuleRef1:
                          "key(RuleTariff::Rule::OWRT::Routing::Footnote1::Footnote2::PassengerType::FareType::OriginAddonTariff::OriginAddonFootnote1::OriginAddonFootnote2::DestinationAddonTariff::DestinationAddonFootnote1::DestinationAddonFootnote2::TravelAgencyCode::IataNumber::DepartmentCode::Origin::Destination::FareSource::FbrBaseTariff::FbrBaseRule::AccountCode::FbrBaseFareBasis::OriginAddonRouting::DestinationAddonRouting)",
                        RuleRef2:
                          "003::4MTR::2::1300::::::ADT::XAP::::::::::::::SHA396::08300843::::SHA::SEA::ATPCO::::::::::::",
                      },
                    },
                    {
                      RouteId: 17,
                      Bags: [
                        {
                          FlightNumber: "DL281",
                          AllowedPieces: 2,
                          AllowedWeight: 0,
                          AllowedWeightUnit: "",
                          FreeAllowedPieces: 1,
                          FreeAllowedWeight: 0,
                          FreeAllowedWeightUnit: "",
                        },
                        {
                          FlightNumber: "DL6341",
                          AllowedPieces: 2,
                          AllowedWeight: 0,
                          AllowedWeightUnit: "",
                          FreeAllowedPieces: 1,
                          FreeAllowedWeight: 0,
                          FreeAllowedWeightUnit: "",
                        },
                      ],
                      Variables: {
                        RuleRef1:
                          "key(RuleTariff::Rule::OWRT::Routing::Footnote1::Footnote2::PassengerType::FareType::OriginAddonTariff::OriginAddonFootnote1::OriginAddonFootnote2::DestinationAddonTariff::DestinationAddonFootnote1::DestinationAddonFootnote2::TravelAgencyCode::IataNumber::DepartmentCode::Origin::Destination::FareSource::FbrBaseTariff::FbrBaseRule::AccountCode::FbrBaseFareBasis::OriginAddonRouting::DestinationAddonRouting)",
                        RuleRef2:
                          "003::2MTR::2::7300::::::ADT::XAP::::::::::::::SHA396::08300843::::SEA::BKK::ATPCO::::::::::::",
                      },
                    },
                  ],
                  LowerSegment: null,
                  InsuranceProducts: null,
                  TicketTimeLimit: "2020-04-12T14:02:00",
                  Percent: 0,
                  IataTax: 434,
                  YQYRTax: 1766,
                  PlatingCarrier: "DL",
                  Forms: null,
                  TmcId: 0,
                  TypeName: "经济舱",
                  FareTypeName: "公布运价",
                  SupplierTypeName: "Ibe",
                  IsAllowOrder: false,
                  Rules: null,
                  FlightPolicy: null,
                },
              },
              id: "73199181-6319-47",
            },
          },
        ],
        cabin: { label: "经济舱", value: 11 },
        cabins: [
          { label: "经济舱", value: 11 },
          { label: "超级经济舱", value: 12 },
          { label: "头等舱", value: 13 },
          { label: "商务舱", value: 14 },
          { label: "超级商务舱", value: 15 },
          { label: "超级头等舱", value: 16 },
        ],
      } as any;
    }
    this.setSearchModelSource(this.searchModel);
  }
  disposal() {
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
  getFlightList(query: {
    forceFetch: boolean;
    keepFilterCondition: boolean;
  }): Observable<IResponse<FlightResultEntity>> {
    const m = this.searchModel;
    const result: IResponse<FlightResultEntity> = {} as any;
    result.Data = this.flightListResult;
    const { forceFetch, keepFilterCondition } = query;
    if (!environment.production) {
      result.Data = this.initFlightRouteSegments(
        MockInternationalFlightListData as any
      );
      if (
        !this.flightListResult ||
        !this.flightListResult.FlightRoutes ||
        !this.flightListResult.FlightRoutes.length
      ) {
        this.flightListResult = result.Data;
        this.initParagraphCondition(result.Data);
      }
      if (!keepFilterCondition) {
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
        if (!keepFilterCondition) {
          this.initParagraphCondition(data);
        }
        result.Data = this.filterByCondition(data);
        return of(result);
      }
    }
    let date = this.calendarService.getMoment(0).format("YYYY-MM-DD");
    let fromAirports: string[];
    let toAirports: string[];
    const req = new RequestEntity();
    req.Method = `TmcApiInternationalFlightUrl-Home-Index`;
    let days: string[] = [];
    if (m.voyageType == FlightVoyageType.OneWay) {
      const trip = m.trips[0];
      date = trip.date;
      fromAirports = [trip.fromCity.Code];
      toAirports = [trip.toCity.Code];
    }
    if (m.voyageType == FlightVoyageType.GoBack) {
      const goTrip = m.trips[0];
      const backTrip = m.trips[1];
      days = [goTrip.date, backTrip.date];
      date = days.join(",");
      fromAirports = [goTrip.fromCity.Code];
      toAirports = [backTrip.toCity.Code];
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
  private checkRoutePolicy() {
    const req = new RequestEntity();
    req.Method = `TmcApiInternationalFlightUrl-Home-Index`;
    const bookInfos = this.getBookInfos();
    const notWhitelist = bookInfos.filter((it) => it.isNotWhitelist);
    const whitelist = bookInfos.filter((it) => !it.isNotWhitelist);
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
    let flightRoute: FlightRouteEntity;
    let index = -1;
    const m = this.getSearchModel();
    if (m) {
      if (m.voyageType == FlightVoyageType.MultiCity) {
        const one =
          m.trips &&
          m.trips
            .slice(0)
            .reverse()
            .find((it) => !!it.bookInfo);
        flightRoute =
          one && one.bookInfo && one.bookInfo && one.bookInfo.flightRoute;
        if (one && m.trips) {
          index = m.trips.findIndex((it) => it.id == one.id);
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
    if (data && data.FlightRoutesData) {
      if (!flightRoute) {
        data.FlightRoutes = data.FlightRoutesData.filter(
          (r) => r.Paragraphs == 1
        );
      } else {
        const fares = data.FlightFares.filter(
          (it) =>
            it.FlightRouteIds && it.FlightRouteIds[index] == flightRoute.Id
        )
          .map((it) => it.FlightRouteIds[index + 1])
          .filter((it) => !!it);
        data.FlightRoutes = data.FlightRoutesData.filter((it) =>
          fares.some((f) => f == it.Id)
        );
      }
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
      if (this.searchModel.trips) {
        this.searchModel.trips = this.searchModel.trips.map((t) => {
          t.isSelectInfo = t.id == trip.id;
          return t;
        });
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
        this.lastGobackSearchModel = m;
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
      if (m.voyageType == FlightVoyageType.MultiCity) {
        this.lastMultiTripSearchModel = m;
      }
    }
    if (this.searchModelSource) {
      this.searchModelSource.next(m);
    } else {
      this.searchModelSource = new BehaviorSubject(this.searchModel);
    }
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
  trips: ITripInfo[];
  voyageType: FlightVoyageType;
  cabin: IFlightCabinType;
  cabins: IFlightCabinType[];
}

export interface IInternationalFlightSegmentInfo {
  fromSegment: FlightSegmentEntity;
  toSegment: FlightSegmentEntity;
  flightRoute: FlightRouteEntity;
  flightPolicy: FlightPolicy;
  isDontAllowBook?: boolean;
  id?: string;
}
