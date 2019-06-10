import { TrafficlineModel } from './models/flight/TrafficlineModel';
import { DbService } from "../services/db/db.service";
import { AdvSearchCondModel } from "./models/flight/advanced-search-cond/AdvSearchCondModel";
import { Injectable } from "@angular/core";
import { map, tap } from "rxjs/operators";
import { BaseApiResultModel } from "./models/BaseApiResultModel";
import { SearchFlightModel } from "./models/flight/SearchFlightModel";
import { environment } from "../../environments/environment";
import { of, merge, Subject, BehaviorSubject } from "rxjs";
import { FlightJouneyModel } from "./models/flight/FlightJouneyModel";
import * as moment from "moment";
import { ApiService } from '../services/api/api.service';
import { IResponse } from '../services/api/IResponse';
@Injectable({
  providedIn: "root"
})
export class FlightService {
  private advSearchShowSources: Subject<boolean>;
  private advSearchCondSources: Subject<AdvSearchCondModel>;
  private resetAdvSCondSources: Subject<boolean>;
  constructor(
    private apiService: ApiService,
    private dbService: DbService
  ) {
    this.advSearchShowSources = new BehaviorSubject(false);
    this.resetAdvSCondSources = new BehaviorSubject(true);
    this.advSearchCondSources = new BehaviorSubject(new AdvSearchCondModel());
  }
  getResetAdvSCondSources() {
    return this.resetAdvSCondSources;
  }
  setResetAdvCond(reset: boolean) {
    this.resetAdvSCondSources.next(reset);
  }
  getFlyCityByCode(cityCode: string) {
    return this.dbService.executeSql(`select * from t_trafficline where Code='${cityCode}'`).pipe(
      map((res: any) => {
        if (res.rows.length > 0) {
          const m = new TrafficlineModel();
          const row = res.rows.item(0);
          m.AirportCityCode = row['AirportCityCode'];
          m.CityCode = row['CityCode'];
          m.CityName = row['CityName'];
          m.Code = row['Code'];
          m.CountryCode = row['CountryCode'];
          m.Description = row['Description'];
          m.EnglishName = row['EnglishName'];
          m.Id = row['Id'];
          m.Initial = row['Initial'];
          m.IsHot = row['IsHot'];
          m.Name = row['Name'];
          m.Nickname = row['Nickname'];
          m.Pinyin = row['Pinyin'];
          m.Sequence = row['Sequence'];
          m.Tag = row["Tag"];
          return m;
        }
        return null;
      })
    );
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
    const local = window.localStorage.getItem("this.apiService.flightsApi");
    // console.log("local",local);
    if (local && !environment.production) {
      return merge(
        of(JSON.parse(local) as FlightJouneyModel[]),
        // this.unifyServic
        //   .getResponse({
        //     Method: this.apis.flightsApi,
        //     Data: JSON.stringify(data)
        //   })
        //   .pipe(
        //     map((r: BaseApiResultModel<FlightJouneyModel[]>) => {
        //       return r.Data;
        //     }),
        //     tap(r => {
        //       window.localStorage.setItem(
        //         this.apis.flightsApi,
        //         JSON.stringify(r)
        //       );
        //     })
        //   )
      ).pipe(map(r => this.sortedFlys(r, data)));
    }
    return this.apiService
      .getResponse({
        Method: "this.apis.flightsApi",
        Data: JSON.stringify(data)
      })
      .pipe(
        tap(r => console.log(r)),
        map((r: IResponse<FlightJouneyModel[]>) => r.Data || []),
        tap(r => {
          window.localStorage.setItem("this.apis.flightsApi", JSON.stringify(r));
        }),
        map(r => this.sortedFlys(r, data))
      );
  }
  private sortedFlys(flyrs: FlightJouneyModel[], data: SearchFlightModel) {
    if (data.PriceFromL2H !== void 0) {
      console.log("按照价格从低到高 " + data.PriceFromL2H);
      // 按照价格排序
      return this.sortByPrice(flyrs, data.PriceFromL2H);
    }
    if (data.TimeFromM2N !== void 0) {
      // 按照时间排序
      console.log("按照时间从早到晚排序 " + data.TimeFromM2N);
      return this.sortByTime(flyrs, data.TimeFromM2N);
    }
    return flyrs;
  }
  private sortByPrice(arr: FlightJouneyModel[], l2h: boolean) {
    return arr.map(item => {
      item.FlightRoutes = item.FlightRoutes.sort((r1, r2) => {
        const s1 = r1.FlightSegments[0];
        const s2 = r2.FlightSegments[0];
        if (s1 && s2) {
          let sub = +s1.LowestFare - +s2.LowestFare;
          sub = sub === 0 ? 0 : sub > 0 ? 1 : -1;
          return l2h ? sub : -sub;
        }
        return 0;
      });
      return item;
    });
  }
  private sortByTime(arr: FlightJouneyModel[], l2h: boolean) {
    return arr.map(item => {
      item.FlightRoutes = item.FlightRoutes.sort((r1, r2) => {
        const s1 = r1.FlightSegments[0];
        const s2 = r2.FlightSegments[0];
        if (s1 && s2) {
          let sub = +moment(s1.TakeoffTime, "YYYY-MM-DDTHH:mm:ss") - +moment(s2.TakeoffTime, "YYYY-MM-DDTHH:mm:ss");
          sub = sub === 0 ? 0 : sub > 0 ? 1 : -1;
          return l2h ? sub : -sub;
        }
        return 0;
      });
      return item;
    });
  }
}
