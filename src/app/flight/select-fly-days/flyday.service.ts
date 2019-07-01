import { Subject, BehaviorSubject } from "rxjs";
import { Injectable } from "@angular/core";
import * as moment from "moment";
import { environment } from "../../../environments/environment";
import { DayModel } from "../models/DayModel";
import { AvailableDate } from "../models/AvailableDate";
import { LanguageHelper } from "src/app/languageHelper";
@Injectable({
  providedIn: "root"
})
export class FlydayService {
  private _showFlyDaySelectPageSource: Subject<boolean>;
  private _selectedSource: Subject<DayModel[]>;
  private _multiFlyDaySource: Subject<boolean>;
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
    this._selectedSource = new BehaviorSubject([]);
    this._multiFlyDaySource = new BehaviorSubject(false);
  }
  setFlyDayMulti(multi: boolean) {
    this._multiFlyDaySource.next(multi);
  }
  getFlyDayMulti() {
    return this._multiFlyDaySource.asObservable();
  }
  getSelectedFlyDays() {
    return this._selectedSource.asObservable();
  }
  setSelectedFlyDays(days: DayModel[]) {
    this._selectedSource.next(days);
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
  generateDayModel(d: moment.Moment) {
    const retD = new DayModel();
    retD.date = d.format("YYYY-MM-DD");
    retD.day = d.date() + "";
    retD.displayName = retD.day;
    retD.timeStamp = Math.floor(+d / 1000);
    retD.enabled = Math.floor(+d / 1000) >= Math.floor(+moment() / 1000);
    if (retD.date === moment().format("YYYY-MM-DD")) {
      // console.log("今天 "+ retD.date);
      retD.color = "primary";
      retD.isToday = true;
      retD.enabled = true;
      retD.displayName = LanguageHelper.getTodayTip();
    }
    retD.toolTipPos = "center";
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
  generateCanlender(months: number) {
    const calender: AvailableDate[] = [];
    let i = 0;
    const loop = (isFirst = false) => {
      const st = Date.now();
      const iM = moment().add(i, "months"); // 第i个月
      const item: AvailableDate = {
        dayList: [],
        disabled: false,
        yearMonth: iM.format("YYYY-MM")
      };
      calender.push(item);
      const dayCountOfiM = iM
        .startOf("month")
        .date(1) // 每月的一号
        .add(1, "months") // 下个月的一号
        .subtract(1, "days") // 这个月的最后一天
        .date(); // 最后一天是几，代表这个月有几天
      const curMFistDate = moment(iM)
        .startOf("month")
        .date(1);
      // console.log("curMoment", curMoment.format("YYYY-MM-DD"));
      const curWeek = curMFistDate.weekday();
      // console.log(curMFistDate.format("YYYY-MM-DD"), curWeek);
      if (curWeek !== 0) {
        // 如果不是从星期天，第一个位置开始，那么前面几个应该是上一个月的日期
        // 上一个月的最后那几天
        const lastMDay = curMFistDate
          .subtract(1, "days") // 上个月的最后一天
          .date();
        // console.log(lastMDay);
        for (let d = lastMDay, j = curWeek; j > 0; d--, j--) {
          const date = curMFistDate
            .subtract(1, "days") // 应该是上个月的日期
            .date(d);
          const lsmd = this.generateDayModel(date);
          lsmd.isLastMonthDay = true; // 是上个月的日期
          item.dayList.unshift(lsmd);
        }
        // console.log(dayList);
      }
      for (let j = 1; j <= dayCountOfiM; j++) {
        // 第 i 个月的第 j 天
        const dayOfiM = iM.startOf("month").date(j); // 每月的j号
        item.dayList.push(this.generateDayModel(dayOfiM));
      }
      console.log(`第${i}个月日期生成耗时：${Date.now() - st} ms`);
      i++;
      if (!isFirst && i <= months - 1) {
        window.requestAnimationFrame(() => loop(false));
      }
    };
    // loop(true);
    setTimeout(() => {
      loop();
    }, 1000);
    return calender;
  }
}
