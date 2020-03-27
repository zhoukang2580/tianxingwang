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
  async onSelecFlyDate(isFrom: boolean, t: { isSelectDate: boolean }) {
    const dates = await this.openCalendar(false, isFrom, t);
    if (dates && dates.length) {
      if (dates.length && this.searchModel) {
        this.searchModel.trips = this.searchModel.trips.map(it => {
          it.isSelectDate = it == t;
          return it;
        });
        const trip = this.searchModel.trips.find(it => it.isSelectDate);
        if (trip) {
          if (isFrom) {
            trip.date = dates[0].date;
          } else {
            trip.backDate = dates[0].date;
          }
        }
      }
    }
    this.setSearchModelSource(this.searchModel);
  }
  async openCalendar(
    isMulti: boolean,
    isFrom: boolean,
    trip: { isSelectDate: boolean }
  ) {
    const s = this.getSearchModel();
    const trips = s.trips || [];
    const idx = s.trips && s.trips.findIndex(it => it == trip);
    const lastTrip = trips[idx - 1 < 0 ? 0 : idx - 1];
    const m = await this.modalCtrl.create({
      component: SelectDateComponent,
      componentProps: {
        goArrivalTime: (lastTrip && lastTrip.date) || "",
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
      fromCity,
      toCity,
      voyageType: FlightVoyageType.OneWay,
      trips: [
        {
          fromCity,
          toCity,
          date: this.calendarService.getMoment(1).format("YYYY-MM-DD"),
          backDate: this.calendarService.getMoment(3).format("YYYY-MM-DD")
        },
        {
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
        fromCity: last.toCity,
        date: this.calendarService.getMoment(3, last.date).format("YYYY-MM-DD")
      });
      this.setSearchModelSource(this.searchModel);
    }
  }
  getInternationalAirports(forceFetch = false) {
    return this.tmcService.getInternationalAirports(forceFetch);
  }
  selectCity(isFrom: boolean, trip?: { isSelectCity: boolean }) {
    if (this.searchModel && this.searchModel.trips) {
      this.searchModel.trips = this.searchModel.trips.map(t => {
        t.isSelectCity = t == trip;
        return t;
      });
      this.setSearchModelSource(this.searchModel);
    }
    this.router.navigate(
      [AppHelper.getRoutePath("select-international-flight-city")],
      {
        queryParams: { requestCode: isFrom ? "select_from_city" : "to_city" }
      }
    );
  }
  onCitySelected(city: TrafficlineEntity, isFrom: boolean) {
    if (this.searchModel) {
      if (this.searchModel.voyageType != FlightVoyageType.MultiCity) {
        this.setSearchModelSource({
          ...this.searchModel,
          fromCity: isFrom ? city : this.searchModel.fromCity,
          toCity: isFrom ? this.searchModel.toCity : city
        });
      } else {
        if (this.searchModel.trips) {
          const trip = this.searchModel.trips.find(t => t.isSelectCity);
          if (trip) {
            if (isFrom) {
              trip.fromCity = city;
            } else {
              trip.toCity = city;
            }
          }
        }
        this.setSearchModelSource(this.searchModel);
      }
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
export interface IInternationalFlightSearchModel {
  trips: {
    fromCity: TrafficlineEntity;
    date: string;
    backDate?: string;
    toCity?: TrafficlineEntity;
    bookInfo?: IInternationalFlightSegmentInfo;
    isSelectCity?: boolean;
    isSelectDate?: boolean;
  }[];
  fromCity: TrafficlineEntity;
  toCity: TrafficlineEntity;
  voyageType: FlightVoyageType;
}

export interface IInternationalFlightSegmentInfo {
  flightSegment: FlightSegmentEntity;
  flightPolicy: FlightPolicy;
  isDontAllowBook?: boolean;
  id?: string;
}
