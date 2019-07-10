import { AppHelper } from "src/app/appHelper";
import { FlightCabinEntity } from "./models/flight/FlightCabinEntity";
import { StaffBookType } from "./../tmc/models/StaffBookType";
import { FilterConditionModel } from "./models/flight/advanced-search-cond/FilterConditionModel";
import { IdentityService } from "./../services/identity/identity.service";
import { HrService } from "./../hr/hr.service";
import { Injectable } from "@angular/core";

import { environment } from "../../environments/environment";
import { Subject, BehaviorSubject } from "rxjs";

import * as moment from "moment";
import { ApiService } from "../services/api/api.service";
import { SearchFlightModel } from "./models/flight/SearchFlightModel";
import { FlightJourneyEntity } from "./models/flight/FlightJourneyEntity";
import { FlightSegmentEntity } from "./models/flight/FlightSegmentEntity";
import { RequestEntity } from "../services/api/Request.entity";
import { Storage } from "@ionic/storage";
import { TrafficlineModel } from "./components/select-city/models/TrafficlineModel";
import { LanguageHelper } from "../languageHelper";
import { Staff } from "../tmc/models/Staff";
import { HttpClient } from "@angular/common/http";

export const KEY_HOME_AIRPORTS = `ApiHomeUrl-Resource-Airport`;
export const KEY_INTERNATIONAL_AIRPORTS = `ApiHomeUrl-Resource-InternationalAirport`;

export interface PassengerFlightSegments {
  passenger: Staff;
  flightSegments: FlightSegmentEntity[];
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
  Cabin: FlightCabinEntity;
  FlightNo: string; // String Yes 航班号
  CabinCode: string; // string Yes 舱位代码
  IsAllowBook: boolean; // Bool Yes 是否可预订
  Discount: string; // Decimal Yes 折扣率
  LowerSegment: FlightSegmentModel;
  Rules: string[]; // List<string> No 违反的差标信息
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
}
interface LocalStorageAirport {
  LastUpdateTime: number;
  Trafficlines: Trafficline[];
}
@Injectable({
  providedIn: "root"
})
export class FlightService {
  private worker = null;
  private filterPanelShowHideSource: Subject<boolean>;
  private openCloseSelectCitySources: Subject<boolean>;
  private filterCondSources: Subject<FilterConditionModel>;
  private localInternationAirports: LocalStorageAirport;
  private localDomesticAirports: LocalStorageAirport;
  private selectedCitySource: Subject<TrafficlineModel>;
  private passengerFlightSegments: PassengerFlightSegments[]; // 记录乘客及其研究选择的航班
  currentViewtFlightSegment: FlightSegmentEntity;

  constructor(private apiService: ApiService, private storage: Storage) {
    this.selectedCitySource = new BehaviorSubject(null);
    this.passengerFlightSegments = [];
    this.filterPanelShowHideSource = new BehaviorSubject(false);
    this.openCloseSelectCitySources = new BehaviorSubject(false);
    this.filterCondSources = new BehaviorSubject(null);
    this.worker = window["Worker"] ? new Worker("assets/worker.js") : null;
  }
  getCurrentViewtFlightSegment(): FlightSegmentEntity {
    return this.currentViewtFlightSegment;
  }
  setCurrentViewtFlightSegment(s: FlightSegmentEntity) {
    this.currentViewtFlightSegment = s;
  }
  getPassengerFlightSegments() {
    return this.passengerFlightSegments || [];
  }
  setPassengerFlightSegments(args: PassengerFlightSegments[]) {
    this.passengerFlightSegments = [...args];
  }
  addPassengerFlightSegments(arg: PassengerFlightSegments) {
    this.passengerFlightSegments = [...this.getPassengerFlightSegments(), arg];
  }
  removePassengerFlightSegments(arg: PassengerFlightSegments) {
    this.passengerFlightSegments = this.getPassengerFlightSegments().filter(
      item => item !== arg
    );
  }
  getSelectedCity() {
    return this.selectedCitySource.asObservable();
  }
  setSelectedCity(_selectedCity: TrafficlineModel) {
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
    const r = await this.apiService.getPromiseResponse<{
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
    const r = await this.apiService.getPromiseResponse<{
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
  async policyflights(
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
    }
    console.log("local", local);
    if (
      !environment.production &&
      local &&
      local.FlightPolicy &&
      local.FlightPolicy.length &&
      Date.now() - local.lastUpdateTime <= 3 * 60 * 1000 &&
      local.date == Flights &&
      Flights[0] &&
      Flights[0].Date
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
    const res = await this.apiService
      .getPromiseResponse<
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
        FlightPolicy: res
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
  async getFlightJourneyDetailList(
    data: SearchFlightModel
  ): Promise<FlightJourneyEntity[]> {
    let local;
    if (!environment.production) {
      local = await this.storage.get("TestTmcData.FlightData");
    }
    console.log("local", local);
    if (
      !environment.production &&
      local &&
      local.serverFlights &&
      local.serverFlights.length &&
      Date.now() - local.lastUpdateTime <= 3 * 60 * 1000 &&
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
    const serverFlights = await this.apiService
      .getPromiseResponse<FlightJourneyEntity[]>(req)
      .catch(_ => {
        AppHelper.alert(_);
        return [] as FlightJourneyEntity[];
      });
    if (serverFlights.length && !environment.production) {
      await this.storage.set("TestTmcData.FlightData", {
        serverFlights,
        lastUpdateTime: Date.now(),
        date: data.Date
      });
    }
    return serverFlights;
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
