import { Injectable } from "@angular/core";
import { ApiService } from "../services/api/api.service";
import { FlightSegmentEntity } from "../flight/models/flight/FlightSegmentEntity";
import { FlightPolicy } from "../flight/models/PassengerFlightInfo";
import { Subject, BehaviorSubject } from "rxjs";
import { IdentityService } from "../services/identity/identity.service";
import {
  PassengerBookInfo,
  TmcService,
  FlightHotelTrainType
} from "../tmc/tmc.service";
import { TrafficlineEntity } from "../tmc/models/TrafficlineEntity";
import { CalendarService } from "../tmc/calendar.service";
import { AppHelper } from "../appHelper";
import { Router } from "@angular/router";
import { ModalController } from "@ionic/angular";
import { SelectDateComponent } from "../tmc/components/select-date/select-date.component";
import { TripType } from "../tmc/models/TripType";
import { DayModel } from "../tmc/models/DayModel";
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
  PREMIUM_FIRST = 16
}
export enum FlightVoyageType {
  OneWay = 1,
  GoBack = 2,
  MultiCity = 3
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
  Tag: "AirportCity"
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
  Tag: "AirportCity"
} as TrafficlineEntity;
@Injectable({
  providedIn: "root"
})
export class InternationalFlightService {
  private searchModel: IInternationalFlightSearchModel;
  private searchModelSource: Subject<IInternationalFlightSearchModel>;
  private bookInfos: PassengerBookInfo<IInternationalFlightSegmentInfo>[];
  private bookInfoSource: Subject<
    PassengerBookInfo<IInternationalFlightSegmentInfo>[]
  >;
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
  }
  async onSelecFlyDate(isFrom: boolean, t: ITripInfo) {
    const dates = await this.openCalendar(false, isFrom, t);
    this.searchModel.roundTrip.isSelectInfo =
      t.id == this.searchModel.roundTrip.id;
    if (dates && dates.length) {
      if (this.searchModel) {
        if (this.searchModel.voyageType == FlightVoyageType.MultiCity) {
          const trip = this.searchModel.trips.find(it => it.id == t.id);
          if (trip) {
            trip.date = dates[0].date;
            this.searchModel.trips = this.searchModel.trips.map(it => {
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
                ).then(ok => {
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
    const idx = s.trips && s.trips.findIndex(it => it == trip);
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
        isMulti: isMulti
      }
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
        backDate: this.calendarService.getMoment(3).format("YYYY-MM-DD")
      },
      voyageType: FlightVoyageType.OneWay,
      trips: [
        {
          fromCity,
          toCity,
          date: this.calendarService.getMoment(1).format("YYYY-MM-DD"),
          id: AppHelper.uuid()
        },
        {
          id: AppHelper.uuid(),
          fromCity: toCity,
          date: this.calendarService.getMoment(3).format("YYYY-MM-DD")
        }
      ]
    } as IInternationalFlightSearchModel;
    this.searchModelSource = new BehaviorSubject(this.searchModel);
  }
  disposal() {
    this.setBookInfoSource([]);
    this.initSearchModel();
  }
  addMoreTrip() {
    if (this.searchModel && this.searchModel.trips) {
      const trips = this.searchModel.trips;
      const idx = trips.findIndex(it => !it.fromCity || !it.toCity);
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
        date: this.calendarService.getMoment(3, last.date).format("YYYY-MM-DD")
      });
      this.setSearchModelSource(this.searchModel);
    }
  }
  getInternationalAirports(forceFetch = false) {
    return this.tmcService.getInternationalAirports(forceFetch);
  }
  beforeSelectCity(isFrom: boolean, trip: ITripInfo) {
    if (this.searchModel) {
      this.searchModel.roundTrip.isSelectInfo =
        trip.id == this.searchModel.roundTrip.id;
      if (this.searchModel.voyageType == FlightVoyageType.MultiCity) {
        if (this.searchModel.trips) {
          this.searchModel.trips = this.searchModel.trips.map(t => {
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
        queryParams: { requestCode: isFrom ? "select_from_city" : "to_city" }
      }
    );
  }
  afterCitySelected(city: TrafficlineEntity, isFrom: boolean) {
    if (this.searchModel) {
      if (this.searchModel.voyageType == FlightVoyageType.MultiCity) {
        if (this.searchModel.trips) {
          const trip = this.searchModel.trips.find(t => t.isSelectInfo);
          if (trip) {
            if (isFrom) {
              trip.fromCity = city;
            } else {
              trip.toCity = city;
            }
            this.searchModel.trips = this.searchModel.trips.map(it => {
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
  getBookInfos() {
    return this.bookInfos || [];
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
}

export interface IInternationalFlightSegmentInfo {
  flightSegment: FlightSegmentEntity;
  flightPolicy: FlightPolicy;
  isDontAllowBook?: boolean;
  id?: string;
}
