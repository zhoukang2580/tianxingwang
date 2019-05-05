import { BehaviorSubject, Subject } from "rxjs";
import { Injectable } from "@angular/core";
import * as moment from "moment";
import { DayModel } from "../models/DayModel";
@Injectable({
  providedIn: "root"
})
export class SelectDateService {
  private selectedDays$: Subject<DayModel[]>;
  private title$: Subject<string>;
  private dayOfWeekNames = {
    0: "周日",
    1: "周一",
    2: "周二",
    3: "周三",
    4: "周四",
    5: "周五",
    6: "周六"
  };
  constructor() {
    this.selectedDays$ = new BehaviorSubject([]);
    this.title$ = new BehaviorSubject(null);
  }
  setSelectedDays(days: DayModel[]) {
    this.selectedDays$.next(days);
  }
  getSelectedDays() {
    return this.selectedDays$.asObservable();
  }
  setTitle(title: string) {
    this.title$.next(title);
  }
  getTitle() {
    return this.title$.asObservable();
  }
  getMonth(d: DayModel) {
    return d.date.substring("2018-".length + 1, "2018-11".length);
  }
  getDescOfDay(d: DayModel) {
    const curDay = moment(); // 今天
    // console.log(d.date);
    switch (d.date) {
      case this.generateDayModel(curDay).date: {
        return "今天";
      }

      case this.generateDayModel(curDay.add(1, "days")).date: {
        return "明天";
      }
      case this.generateDayModel(curDay.add(1, "days")).date: {
        return "后天";
      }

      default:
        return d.dayOfWeekName;
    }
  }
  generateDayModel(d: moment.Moment) {
    const retD = new DayModel();
    retD.date = d.format("YYYY-MM-DD");
    retD.day = d.date() + "";
    retD.timeStamp = Math.floor(+d / 1000);
    this.setWeekName(retD);
    return retD;
  }
  private setWeekName(d: DayModel) {
    d.dayOfWeek = moment(d.date, "YYYY-MM-DD").weekday();
    const wn = this.dayOfWeekNames[d.dayOfWeek];
    d.dayOfWeekName = wn;
  }
  getWeekName(d: DayModel) {
    d.dayOfWeek = moment(d.date, "YYYY-MM-DD").weekday();
    const wn = this.dayOfWeekNames[d.dayOfWeek];
    d.dayOfWeekName = wn;
    return wn;
  }
}
