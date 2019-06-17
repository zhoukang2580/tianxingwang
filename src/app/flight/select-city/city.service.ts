import { BehaviorSubject, of, merge, throwError } from "rxjs";
import { Subject } from "rxjs";
import { Injectable } from "@angular/core";
import { map, switchMap, tap, catchError } from "rxjs/operators";
import * as moment from "moment";
import * as jsPy from "js-pinyin";
import { ApiService } from '../../services/api/api.service';
import { DbService } from 'src/app/services/db/db.service';
import { IResponse } from 'src/app/services/api/IResponse';
@Injectable({
  providedIn: "root"
})
export class CityService {
  private selectedCity$: Subject<any>;
  private showPageSj: Subject<boolean>;
  constructor(
    private dbService: DbService,
    private apiService:ApiService,
  ) {
    this.selectedCity$ = new BehaviorSubject(null);
    this.showPageSj = new BehaviorSubject(false);
  }
  setShowPage(show: boolean) {
    this.showPageSj.next(show);
  }
  getShowPage() {
    return this.showPageSj.asObservable();
  }
  setSelectedCity(city: any) {
    this.selectedCity$.next(city);
  }
  getSelectedCity() {
    return this.selectedCity$.asObservable();
  }
  pyfl(name: string) {
    return (jsPy.getFullChars(name) as string).charAt(0).toUpperCase();
  }
  getListCity() {
    return this.getDomesticAirports().pipe(
      map(trafficLines => {
        const obj: { [key: string]: any[] } = {};
        trafficLines.forEach(t => {
          const k = this.pyfl(t.CityName);
          if (obj[k]) {
            obj[k].push({ ...t, selected: false });
          } else {
            obj[this.pyfl(t.CityName)] = [{ ...t, selected: false }];
          }
        });
        return Object.keys(obj)
          .sort((k1, k2) => k1.charCodeAt(0) - k2.charCodeAt(0))
          .map(k => {
            const lcm = {}  as any;
            lcm.link = k;
            lcm.items = obj[k].sort(
              (sub1, sub2) => sub1.Sequence - sub2.Sequence
            );
            lcm.displayName = k;
            return lcm;
          });
      })
    );
  }
  private getDomesticAirports() {
    // 国内机场
    // 获取国内机场数据
    const lstTimeStamp =
      +window.localStorage.getItem("LastUpdateTrafficDataTime") || 0;
    return this.getTrafficLineLastUpdateTime().pipe(
      tap(lst => {
        console.log(
          "getTrafficLineLastUpdateTime",
          lst,
          Math.floor(Date.now() / 1000) - lstTimeStamp
        );
      }),
      switchMap(lst => {
        if (Math.floor(Date.now() / 1000) - lstTimeStamp < 2 * 60) {
          // 两分钟内用本地数据，否则获取服务器数据
          return this.getLocalTrafficLines();
        }
        // 先返回本地数据展示，然后等待接口返回数据后，刷新页面
        return merge(
          this.getLocalTrafficLines(),
          this.apiService
            .getResponse({
              Method: "this.apis.airportApi",
              Data: JSON.stringify({
                LastUpdateTime: lst
              })
            })
            .pipe(
              map(
                (r: IResponse<{ Trafficlines: any[] }>) =>
                  r
              ),
              tap(r => {
                window.localStorage.setItem(
                  "LastUpdateTrafficDataTime",
                  r.Timestamp + ""
                );
              }),
              switchMap(data =>
                this.updateLocalTrafficLines(
                  data.Data ? data.Data.Trafficlines : [],
                  +data.Timestamp
                )
              )
            )
        );
      })
    );
  }
  private updateLocalTrafficLines(
    data: any[],
    LastUpdateTime: number
  ) {
    const sqls = data.map(t => {
      const sqlParams = [];
      sqlParams.push(t.Id);
      sqlParams.push(t.Tag);
      sqlParams.push(t.Code);
      sqlParams.push(t.Name);
      sqlParams.push(t.Nickname);
      sqlParams.push(t.Pinyin);
      sqlParams.push(t.Initial);
      sqlParams.push(t.AirportCityCode);
      sqlParams.push(t.Code);
      sqlParams.push(t.CityName);
      sqlParams.push(t.Description);
      sqlParams.push(t.IsHot ? 1 : 0);
      sqlParams.push(t.CountryCode);
      sqlParams.push(t.Sequence);
      sqlParams.push(t.EnglishName);
      sqlParams.push(LastUpdateTime);
      return [
        `insert into t_trafficline(
        Id,
        Tag,
        Code,
        Name,
        Nickname,
        Pinyin,
        Initial,
        AirportCityCode,
        CityCode,
        CityName,
        Description,
        IsHot,
        CountryCode,
        Sequence,
        EnglishName,
        LastUpdateTime
        )values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        sqlParams
      ];
    });
    // const sql  =`delete from t_trafficline where CityCode in (
    //   ${data .map(t => `'${t.Code}'`).join(",")}) or Id in ( ${data .map(t => `'${t.Id}'`).join(",")})`;
    //   console.log("删除SQL ",sql);
    return this.dbService
      .executeSql(
        `delete from t_trafficline where CityCode in (
          ${data .map(t => `'${t.Code}'`).join(",")}) or Id in ( ${data .map(t => `'${t.Id}'`).join(",")})`
      )
      .pipe(
        () => this.dbService.executeSqlBatch(sqls),
        switchMap(() => (data.length ? of(data) : this.getLocalTrafficLines()))
      );
  }
  private getLocalTrafficLines() {
    return this.dbService.executeSql(`select * from t_trafficline`).pipe(
      map(res => {
        const result: any[] = [];
        if (res.rows.length > 0) {
          for (let i = 0; i < res.rows.length; i++) {
            const row = res.rows.item(i);
            const t : any={};
            t.AirportCityCode = row["AirportCityCode"];
            t.Code = row["CityCode"];
            t.CityName = row["CityName"];
            t.Code = row["Code"];
            t.CountryCode = row["CountryCode"];
            t.Description = row["Description"];
            t.EnglishName = row["EnglishName"];
            t.Id = row["Id"];
            t.Initial = row["Initial"];
            t.IsHot = row["IsHot"] === 1;
            t.Name = row["Name"];
            t.Nickname = row["Nickname"];
            t.Pinyin = row["Pinyin"];
            t.Sequence = row["Sequence"];
            t.Tag = row["Tag"];
            result.push(t);
          }
        }
        return result;
      })
    );
  }
  private getTrafficLineLastUpdateTime() {
    return this.dbService
      .executeSql(`select * from t_trafficline order by LastUpdateTime desc`)
      .pipe(
        map(res => {
          // console.log(res);
          let lastUpdateTime = Math.floor(
            +moment("2000-01-01", "YYYY-MM-DD") / 1000
          );
          if (res.rows.length > 0) {
            lastUpdateTime = res.rows.item(0)["LastUpdateTime"];
          }
          return +lastUpdateTime;
        }),
        catchError(e => {
          console.log("获取上一次更新时间失败", e);
          throw e;
        })
      );
  }
}
