import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { FlightCityService } from "../flight/flight-city.service";
import { FlightResultEntity } from "../flight/models/FlightResultEntity";
import { IFlightSegmentInfo } from "../flight/models/PassengerFlightInfo";
import { ApiService } from "../services/api/api.service";
import { RequestEntity } from "../services/api/Request.entity";
import { CalendarService } from "../tmc/calendar.service";
import { TrafficlineEntity } from "../tmc/models/TrafficlineEntity";
import { TripType } from "../tmc/models/TripType";
import {
  FlightHotelTrainType,
  PassengerBookInfo,
  TmcService,
} from "../tmc/tmc.service";

export class SearchDynamicModule {
  Date: string;
  FromAirport: string;
  ToAirport: string;
  FromAsAirport: boolean; //  No 始发以机场查询
  ToAsAirport: boolean; //  No 到达以机场查询
  FlightNumber: string;
  fromCity: TrafficlineEntity;
  toCity: TrafficlineEntity;
}

@Injectable({
  providedIn: "root",
})
export class FlightDynamicService {
  private searchDynamicModel: SearchDynamicModule;
  private searchDynamicModelSource: Subject<SearchDynamicModule>;
  private passengerBookInfos: PassengerBookInfo<IFlightSegmentInfo>[];
  private passengerBookInfoSource: Subject<
    PassengerBookInfo<IFlightSegmentInfo>[]
  >;
  flightResult: FlightResultEntity;
  constructor(
    private apiService: ApiService,
    private calendarService: CalendarService,
    private tmcService: TmcService,
    private flightCityService: FlightCityService
  ) {
    this.searchDynamicModel = new SearchDynamicModule();
    this.searchDynamicModelSource = new BehaviorSubject(
      this.searchDynamicModel
    );
    this.passengerBookInfos = [];
    this.passengerBookInfoSource = new BehaviorSubject(this.passengerBookInfos);
    this.setSearchDynamicModelSource(new SearchDynamicModule());
  }
  get isShowingPage(){
    return this.flightCityService.isShowingPage;
  }
  async onSelectCity(data: {
    isShowPage: boolean;
    isFrom: boolean;
    isShowAirports?: boolean;
    isDomestic?: boolean;
    isShowSegs?: boolean;
    isShowHotCity?: boolean;
    isFlyDynamic?: boolean;
  }) {
    const domesticAirports = await this.getDomesticAirports();
    const internationalAirports = [];
    return this.flightCityService.onSelectCity({
      ...data,
      hideCityCodes: ["BJS", "SHA", "CAN"],
      extraHotAirports: ["SHA", "PVG", "PKX", "PEK"],
      pageClassName: "select-flight-dynamic-city-page-container",
      domesticAirports,
      internationalAirports,
      isShow3Code:true
    });
  }
  getPassengerBookInfos() {
    this.passengerBookInfos = this.passengerBookInfos || [];
    return this.passengerBookInfos;
  }

  getPassengerBookInfoSource() {
    return this.passengerBookInfoSource.asObservable();
  }

  async getDomesticAirports(forceFetch: boolean = false) {
    return this.tmcService.getDomesticAirports(forceFetch);
  }

  openCalendar(isMulti: boolean, tripType?: TripType) {
    const goFlight = this.getPassengerBookInfos().find(
      (f) => f.bookInfo && f.bookInfo.tripType == TripType.departureTrip
    );
    const backFlight = this.getPassengerBookInfos().find(
      (f) => f.bookInfo && f.bookInfo.tripType == TripType.returnTrip
    );
    let s = this.getSearchDynamicModel();

    s = this.getSearchDynamicModel();
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
    return this.calendarService.openCalendar({
      goArrivalTime,
      tripType,
      forType: FlightHotelTrainType.Flight,
      isMulti,
      beginDate: s.Date,
      endDate: "",
      isEnableSelectAllDate: true,
    });
  }

  setSearchDynamicModelSource(m: SearchDynamicModule) {
    console.log("setSearchFlightModel", m);
    this.searchDynamicModel = m;
    if (m && m.toCity && m.fromCity) {
      this.searchDynamicModel.ToAirport = m.ToAsAirport
        ? m.toCity.Code
        : m.toCity.AirportCityCode;
      this.searchDynamicModel.FromAirport = m.FromAsAirport
        ? m.fromCity.Code
        : m.fromCity.AirportCityCode;
    }

    this.searchDynamicModelSource.next(this.searchDynamicModel);
  }
  getSearchDynamicModel() {
    return { ...(this.searchDynamicModel || new SearchDynamicModule()) };
  }
  getSearchDynamicModelSource() {
    return this.searchDynamicModelSource.asObservable();
  }

  onSwapsCity() {
    const s = this.getSearchDynamicModel();
    this.setSearchDynamicModelSource({
      ...s,
      fromCity: s.toCity,
      toCity: s.fromCity,
      FromAirport: s.toCity.Code,
      ToAirport: s.fromCity.Code,
      FromAsAirport: s.ToAsAirport,
      ToAsAirport: s.FromAsAirport,
    });
  }

  onHisCity(data: any) {
    this.setSearchDynamicModelSource({
      ...data,
      fromCity: data.fromCity,
      toCity: data.toCity,
      FromAirport: data.FromAirport,
      ToAirport: data.ToAirport,
      FromAsAirport: data.FromAsAirport,
      ToAsAirport: data.ToAsAirport,
    });
  }

  getFlightDynamicList(d: {
    Date: string;
    FromAirport: string;
    ToAirport: string;
    FlightNumber: string;
  }) {
    const req = new RequestEntity();
    req.Method = "TmcApiFlightDynamicUrl-Home-Search";
    req.Data = {
      Date: d.Date,
      FromAirport: d.FromAirport,
      ToAirport: d.ToAirport,
      FlightNumber: d.FlightNumber,
    };
    req.IsShowLoading=true;
    return this.apiService.getPromiseData<any[]>(req);
  }
  getFlightDynamicDetails(Date: string, FlightNumber: string) {
    const req = new RequestEntity();
    req.Method = "TmcApiFlightDynamicUrl-Home-Detail";

    req.IsShowLoading = true;
    req.LoadingMsg = "正在获取详情";
    req.Data = {
      date: Date,
      flightNumber: FlightNumber,
    };

    return this.apiService.getPromiseData<any[]>(req);
  }

  getFlightDynamicDetail(d: {
    Date: string;
    FlightNumber: string;
    distinguish;
  }) {
    const req = new RequestEntity();
    req.Method = "TmcApiFlightDynamicUrl-Home-Detail";
    req.IsShowLoading = true;
    req.LoadingMsg = "正在获取详情";
    req.Data = {
      flightNumber: d.FlightNumber,
      date: d.Date,
      distinguish: d.distinguish,
    };
    return this.apiService.getPromiseData<any>(req);
  }
  getFlightDynamicDetailes(d: {
    Date: string;
    FlightNumber: string;
    startDate: string;
    enDate: string;
  }) {
    const req = new RequestEntity();
    req.Method = "TmcApiFlightDynamicUrl-Home-Detail";
    req.IsShowLoading = true;
    req.LoadingMsg = "正在获取详情";
    req.Data = {
      flightNumber: d.FlightNumber,
      date: d.Date,
      startDate: d.startDate,
      enDate: d.enDate,
    };
    return this.apiService.getPromiseData<any>(req);
  }
}
