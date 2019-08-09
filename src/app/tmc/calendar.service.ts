import { Subject, BehaviorSubject } from "rxjs";
import { Injectable } from "@angular/core";
import * as moment from "moment";
import { LanguageHelper } from "src/app/languageHelper";
import { DayModel } from "./models/DayModel";
import { AvailableDate } from "./models/AvailableDate";
@Injectable({
  providedIn: "root"
})
export class CalendarService {
  private selectedSource: Subject<DayModel[]>;
  private multiFlyDaySource: Subject<boolean>;
  private showFlyDayPageSource: Subject<boolean>;
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
    this.selectedSource = new BehaviorSubject([]);
    this.multiFlyDaySource = new BehaviorSubject(false);
    this.showFlyDayPageSource = new BehaviorSubject(false);
  }
  getDayOfWeekNames() {
    return this.dayOfWeekNames;
  }
  showSelectFlyDatePage(show: boolean) {
    this.showFlyDayPageSource.next(show);
  }
  getShowFlyDayPageSource() {
    return this.showFlyDayPageSource.asObservable();
  }
  setFlyDayMulti(multi: boolean) {
    this.multiFlyDaySource.next(multi);
  }
  getFlyDayMulti() {
    return this.multiFlyDaySource.asObservable();
  }
  getSelectedFlyDays() {
    return this.selectedSource.asObservable();
  }
  setSelectedFlyDays(days: DayModel[]) {
    this.selectedSource.next(days);
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
    return this.generateDayModel(moment(date));
  }
  private format(date: Date, format = "YYYY-MM-DD") {
    const day =
      date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`;
    const curm = date.getMonth() + 1;
    const fullMonth = `${curm < 10 ? `0${curm}` : curm}`;
    return `${date.getFullYear()}${format.substr(
      4,
      1
    )}${fullMonth}${format.substr(7, 1)}${day}`;
  }
  generateDayModel(d: moment.Moment | number | Date) {
    const retD = new DayModel();
    if (typeof d === "number" || d instanceof Date) {
      const nowDate = new Date();
      const date = typeof d === "number" ? new Date(d) : d;
      retD.dayOfWeek = date.getDay();
      retD.day =
        date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`;
      retD.date = this.format(date);
      retD.displayName = retD.day;
      retD.timeStamp = Math.floor(+d / 1000);
      retD.enabled =
        Math.floor(+d / 1000) >= Math.floor(nowDate.getTime() / 1000);
      if (retD.date === this.format(nowDate)) {
        // console.log("今天 "+ retD.date);
        retD.color = "primary";
        retD.isToday = true;
        retD.enabled = true;
        retD.displayName = "今天";
      }
      retD.toolTipPos = "center";
      this.setWeekName(retD);
    } else {
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
    }
    return retD;
  }
  private setWeekName(d: DayModel) {
    d.dayOfWeek = d.dayOfWeek || new Date(d.timeStamp * 1000).getDay();
    const wn = this.dayOfWeekNames[d.dayOfWeek];
    d.dayOfWeekName = wn;
  }
  getWeekName(d: DayModel) {
    d.dayOfWeek = moment(d.date, "YYYY-MM-DD").weekday();
    const wn = this.dayOfWeekNames[d.dayOfWeek];
    d.dayOfWeekName = wn;
    return wn;
  }
  generateCanlender2(months: number) {
    console.time("generateCanlender");
    const calender: AvailableDate[] = [];
    for (let i = 0; i < months; i++) {
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
    }
    console.timeEnd("generateCanlender");
    return Promise.resolve(calender);
  }
  generateCanlender(months: number) {
    return Promise.resolve().then(_ => {
      console.time("generateCanlender2");
      const calendar: AvailableDate[] = [];
      for (let i = 0; i < months; i++) {
        const curDate = new Date();
        const iDate = new Date(
          curDate.getFullYear(),
          curDate.getMonth() + i,
          curDate.getDate()
        ); // 第i个月
        const curMYear = iDate.getFullYear();
        const curMMonth = iDate.getMonth() + 1;
        const fullMonth = curMMonth < 10 ? `0${curMMonth}` : curMMonth + 1;
        const st = Date.now();
        // console.log(this.format(iDate), iDate);
        const item = {
          dayList: [],
          disabled: false,
          yearMonth: `${curMYear}-${fullMonth}`
        };
        calendar.push(item);
        const nextIMonthStart = new Date(
          iDate.getFullYear(),
          iDate.getMonth() + 1,
          1
        );
        const dayCountOfiM =
          new Date(nextIMonthStart.setDate(-1)).getDate() + 1;
        const curMFistDate = new Date(iDate.setDate(1));
        // console.log(
        //   "curMFistDate",
        //   this.format(curMFistDate),
        //   "dayCountOfiM",
        //   dayCountOfiM
        // );
        const curWeek = curMFistDate.getDay();
        if (curWeek !== 0) {
          // 如果不是从星期天，第一个位置开始，那么前面几个应该是上一个月的日期
          // 上一个月的最后那几天
          const lastMDay = new Date(curMFistDate.setSeconds(-1));

          console.log("lastMDay", this.format(lastMDay));
          for (let d = lastMDay.getDate(), j = curWeek; j > 0; d--, j--) {
            const date = new Date(lastMDay.setDate(d));
            console.log(this.format(date));
            const lsmd = this.generateDayModel(date);
            lsmd.isLastMonthDay = true; // 是上个月的日期
            item.dayList.unshift(lsmd);
          }
          // console.log(dayList);
        }
        for (let j = 1; j <= dayCountOfiM; j++) {
          // 第 i 个月的第 j 天
          item.dayList.push(this.generateDayModel(iDate.setDate(j)));
        }
        console.log(`第${i}个月日期生成耗时：${Date.now() - st} ms`);
      }
      console.timeEnd("generateCanlender2");
      console.log(calendar);
      return calendar;
    });
  }
}
