import { AppHelper } from "src/app/appHelper";
import { Injectable } from "@angular/core";
import { map, tap, switchMap } from "rxjs/operators";

import { environment } from "../../environments/environment";
import { of, merge, Subject, BehaviorSubject, throwError, from } from "rxjs";

import * as moment from "moment";
import { ApiService } from "../services/api/api.service";
import { IResponse } from "../services/api/IResponse";
import { AdvSearchCondModel } from "./models/flight/advanced-search-cond/AdvSearchCondModel";
import { SearchFlightModel } from "./models/flight/SearchFlightModel";
import { TestTmcData } from "./testTmcData";
import { FlightJourneyEntity } from "./models/flight/FlightJourneyEntity";
import { FlightSegmentEntity } from "./models/flight/FlightSegmentEntity";
import { RequestEntity } from "../services/api/Request.entity";
import { Storage } from "@ionic/storage";
import { TrafficlineModel } from "./components/select-city/models/TrafficlineModel";
export const KEY_HOME_AIRPORTS = `ApiHomeUrl-Resource-Airport`;
export const KEY_INTERNATIONAL_AIRPORTS = `ApiHomeUrl-Resource-InternationalAirport`;
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
  private advSearchShowSources: Subject<boolean>;
  private openCloseSelectCitySources: Subject<boolean>;
  private advSearchCondSources: Subject<AdvSearchCondModel>;
  private resetAdvSCondSources: Subject<boolean>;
  private localInternationAirports: LocalStorageAirport;
  private localDomesticAirports: LocalStorageAirport;
  private _selectedCitySource: Subject<TrafficlineModel>;
  constructor(private apiService: ApiService, private storage: Storage) {
    this._selectedCitySource = new BehaviorSubject(null);
    this.advSearchShowSources = new BehaviorSubject(false);
    this.resetAdvSCondSources = new BehaviorSubject(true);
    this.openCloseSelectCitySources = new BehaviorSubject(false);
    this.advSearchCondSources = new BehaviorSubject(new AdvSearchCondModel());
  }
  getSelectedCity() {
    return this._selectedCitySource.asObservable();
  }
  setSelectedCity(_selectedCity: TrafficlineModel) {
    this._selectedCitySource.next({ ..._selectedCity });
  }
  getResetAdvSCondSources() {
    return this.resetAdvSCondSources;
  }
  getOpenCloseSelectCityPageSources() {
    return this.openCloseSelectCitySources.asObservable();
  }
  setOpenCloseSelectCityPageSources(open: boolean) {
    this.openCloseSelectCitySources.next(open);
  }
  setResetAdvCond(reset: boolean) {
    this.resetAdvSCondSources.next(reset);
  }

  setAdvSConditions(advSCond: AdvSearchCondModel) {
    this.advSearchCondSources.next(advSCond);
  }
  getAdvSConditions() {
    return this.advSearchCondSources.asObservable();
  }
  setShowAdvSearchConditions(show: boolean) {
    this.advSearchShowSources.next(show);
  }
  getShowAdvSearchConditions() {
    return this.advSearchShowSources.asObservable();
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
      ...this.localDomesticAirports.Trafficlines,
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
      ...this.localInternationAirports.Trafficlines,
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

  searchFlightList(data: SearchFlightModel) {
    const local = window.localStorage.getItem("this.apiService.flightsApi");
    // console.log("local",local);
    if (local && !environment.production) {
      // console.log(new Array(10).fill(0).map(_=>TestTmcData.FlightData));
      return merge(
        of({
          Data: new Array(100).fill(0).map(_ => TestTmcData.getFlightData()[0])
        } as IResponse<FlightJourneyEntity[]>)
        // this.apiService
        //   .getResponse<FlightJourneyEntity[]>({
        //     Method: "TmcApiFlightUrl-Home-Index",
        //     Data: data
        //   })
      ).pipe(map(r => r.Data || []));
    }
    return this.apiService
      .getResponse<FlightJourneyEntity[]>({
        Method: "TmcApiFlightUrl-Home-Index",
        Data: {
          Date: data.Date, //  Yes 航班日期（yyyy-MM-dd）
          FromCode: data.FromCode, //  Yes 三字代码
          ToCode: data.ToCode, //  Yes 三字代码
          FromAsAirport: data.FromAsAirport, //  No 始发以机场查询
          ToAsAirport: data.ToAsAirport //  No 到达以机场查询
        },
        Version: "1.0",
        IsShowLoading: true
      })
      .pipe(
        tap(r => console.log(r)),
        map((r: IResponse<FlightJourneyEntity[]>) => r.Data || []),
        tap(r => {
          // window.localStorage.setItem(
          //   "this.apis.flightsApi",
          //   JSON.stringify(r)
          // );
        })
      );
  }
  getTotalFlySegments(flyJourneys: FlightJourneyEntity[]) {
    return flyJourneys.reduce(
      (arr, journey) => {
        arr = [
          ...arr,
          ...journey.FlightRoutes.reduce(
            (segs, route) => {
              segs = [...segs, ...route.FlightSegments];
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
  public sortedFlightSegments(
    flysegs: FlightSegmentEntity[],
    data: SearchFlightModel
  ) {
    if (data.PriceFromL2H !== void 0) {
      console.log("按照价格从低到高 " + data.PriceFromL2H);
      // 按照价格排序
      return this.sortByPrice(flysegs, data.PriceFromL2H);
    }
    if (data.TimeFromM2N !== void 0) {
      // 按照时间排序
      console.log("按照时间从早到晚排序 " + data.TimeFromM2N);
      return this.sortByTime(flysegs, data.TimeFromM2N);
    }
    return flysegs;
  }
  private sortByPrice(arr: FlightSegmentEntity[], l2h: boolean) {
    return arr.sort((s1, s2) => {
      let sub = +s1.LowestFare - +s2.LowestFare;
      sub = sub === 0 ? 0 : sub > 0 ? 1 : -1;
      return l2h ? sub : -sub;
    });
  }
  private sortByTime(arr: FlightSegmentEntity[], l2h: boolean) {
    return arr.sort((s1, s2) => {
      let sub =
        +moment(s1.TakeoffTime, "YYYY-MM-DDTHH:mm:ss") -
        +moment(s2.TakeoffTime, "YYYY-MM-DDTHH:mm:ss");
      sub = sub === 0 ? 0 : sub > 0 ? 1 : -1;
      // console.log("时间排序，l2h",sub);
      return l2h ? sub : -sub;
    });
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
    const h = await this.getLocalHomeAirports();
    const i = await this.getInternationalAirports();
    return [...h, ...i];
  }
}
