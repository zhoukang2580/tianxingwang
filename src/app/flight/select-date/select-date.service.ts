import { LanguageHelper } from "src/app/languageHelper";
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
    0: LanguageHelper.getSundayTip(),
    1: LanguageHelper.getMondayTip(),
    2: LanguageHelper.getTuesdayTip(),
    3: LanguageHelper.getWednesdayTip(),
    4: LanguageHelper.getThursdayTip(),
    5: LanguageHelper.getFridayTip(),
    6: LanguageHelper.getSaturdayTip()
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
        return LanguageHelper.getTodayTip();
      }

      case this.generateDayModel(curDay.add(1, "days")).date: {
        return LanguageHelper.getTomorrowTip();
      }
      case this.generateDayModel(curDay.add(1, "days")).date: {
        return LanguageHelper.getTheDayAfterTomorrowTip();
      }

      default:
        return d.dayOfWeekName;
    }
  }
  generateDayModelByDate(date: string) {
    const m = moment(date);
    return this.generateDayModel(m);
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
