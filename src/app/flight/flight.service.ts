import { Injectable } from "@angular/core";
import { map, tap } from "rxjs/operators";

import { environment } from "../../environments/environment";
import { of, merge, Subject, BehaviorSubject } from "rxjs";

import * as moment from "moment";
import { ApiService } from "../services/api/api.service";
import { IResponse } from "../services/api/IResponse";
import { AdvSearchCondModel } from "./models/flight/advanced-search-cond/AdvSearchCondModel";
import { SearchFlightModel } from "./models/flight/SearchFlightModel";
import { TestTmcData } from "./testTmcData";
import { FlightJourneyEntity } from "./models/flight/FlightJourneyEntity";
import { FlightSegmentEntity } from "./models/flight/FlightSegmentEntity";

@Injectable({
  providedIn: "root"
})
export class FlightService {
  private advSearchShowSources: Subject<boolean>;
  private openCloseSelectCitySources: Subject<boolean>;
  private advSearchCondSources: Subject<AdvSearchCondModel>;
  private resetAdvSCondSources: Subject<boolean>;
  constructor(private apiService: ApiService) {
    this.advSearchShowSources = new BehaviorSubject(false);
    this.resetAdvSCondSources = new BehaviorSubject(true);
    this.openCloseSelectCitySources = new BehaviorSubject(false);
    this.advSearchCondSources = new BehaviorSubject(new AdvSearchCondModel());
  }
  getResetAdvSCondSources() {
    return this.resetAdvSCondSources;
  }
  getOpenCloseSelectCityPageSources(){
   return this.openCloseSelectCitySources.asObservable();
  }
  showSelectCityPage(open:boolean){
    this.openCloseSelectCitySources.next(open);
  }
  setResetAdvCond(reset: boolean) {
    this.resetAdvSCondSources.next(reset);
  }
  getFlyCityByCode(cityCode: string) {
    return of([] as any);
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
  searchFlightList(data: SearchFlightModel) {
    const local =
      window.localStorage.getItem("this.apiService.flightsApi");
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
          window.localStorage.setItem(
            "this.apis.flightsApi",
            JSON.stringify(r)
          );
        })
      );
  }
  getTotalFlySegments(flyJourneys: FlightJourneyEntity[]) {
    return flyJourneys.reduce(
      (arr, journey) => {
        arr = [
          ...arr,
          ...journey.FlightRoutes.reduce((segs, route) => {
            segs = [...segs, ...route.FlightSegments];
            return segs;
          }, [] as FlightSegmentEntity[])
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
}
