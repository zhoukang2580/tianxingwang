import { Subject, BehaviorSubject } from "rxjs";
import { Injectable } from "@angular/core";
import * as moment from "moment";
import { AvailableDate } from "./models/AvailableDate";
import { LanguageHelper } from "../languageHelper";
import { DayModel, ILunarInfo } from "./models/DayModel";
const lunarCalendar = window["LunarCalendar"];
@Injectable({
  providedIn: "root"
})
export class CalendarService {
  private selectedDaysSource: Subject<DayModel[]>;
  private selectedDays: DayModel[];
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
    this.selectedDaysSource = new BehaviorSubject([]);
  }
  getHHmm(datetime: string) {
    if (datetime) {
      if (datetime.includes("T")) {
        const remain = datetime.split("T")[1];
        if (remain) {
          const hhmmss = remain.split(":");
          hhmmss.pop();
          return hhmmss.join(":");
        }
      }
      if (datetime.length == "YYYY-MM-DD HH:mm:ss".length) {
        const hms = datetime.split(" ")[1];
        const hmsArr = hms.split(":");
        hmsArr.pop();
        return hmsArr.join(":");
      }
      if (datetime.length == "YYYY-MM-DD HH:mm".length) {
        const hms = datetime.split(" ")[1];
        return hms;
      }
    }
    return datetime;
  }
  getDiffDays(t1: string, t2: string) {
    const mt1 = t1 ? moment(t1) : moment();
    const mt2 = t2 ? moment(t2) : moment();
    return mt1.diff(mt2, "days");
  }
  getDayOfWeekNames() {
    return this.dayOfWeekNames;
  }
  getSelectedDays() {
    return this.selectedDays || [];
  }
  getSelectedDaysSource() {
    return this.selectedDaysSource.asObservable();
  }
  setSelectedDaysSource(days: DayModel[]) {
    this.selectedDays = days;
    this.selectedDaysSource.next(days);
  }
  getMonth(d: DayModel) {
    return d.date.substring("2018-".length + 1, "2018-11".length);
  }
  getDescOfDate(date: string) {
    const curDay = moment(); // 今天
    const d = this.generateDayModelByDate(date);

    // console.log(d.date);
    switch (date) {
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
    return this.initDayDescInfo(retD);
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
  generateYearNthMonthCalendar(year: number, month: number): AvailableDate {
    const iM = moment(`${year}-${month}-01`, "YYYY-MM-DD"); // 第i个月
    // console.log("generateYearNthMonthCalendar", iM.format('YYYY-MM-DD'), year, month);
    const calender: AvailableDate = {
      dayList: [],
      disabled: false,
      yearMonth: iM.format("YYYY-MM")
    };
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
        calender.dayList.unshift(lsmd);
      }
      // console.log(dayList);
    }
    for (let j = 1; j <= dayCountOfiM; j++) {
      // 第 i 个月的第 j 天
      const dayOfiM = iM.startOf("month").date(j); // 每月的j号
      calender.dayList.push(this.generateDayModel(dayOfiM));
    }
    const clnder = this.initDaysDayOff(calender);
    console.log("generateYearNthMonthCalendar", clnder);
    return clnder;
  }
  private initDaysDayOff(c: AvailableDate) {
    if (c.dayList && c.dayList.some(it => !!it.lunarInfo)) {
      const cx = c.dayList.find(
        it => it.desc && (it.desc.includes("除夕") || it.date.includes("10-01"))
      );
      let endtime = 0;
      if (cx) {
        endtime = cx.timeStamp + 7 * 24 * 3600;
      }
      c.dayList = c.dayList.map(it => {
        if (cx) {
          it.dayoff = it.timeStamp < endtime && it.timeStamp >= cx.timeStamp;
        }
        return it;
      });
    }
    return c;
  }
  private initDayDescInfo(d: DayModel) {
    if (lunarCalendar && lunarCalendar.calendar) {
      const [y, m, date] = d.date.split("-");
      const arr: { monthData: ILunarInfo[] } = lunarCalendar.calendar(y, m);
      if (arr && arr.monthData) {
        d.lunarInfo = arr.monthData.find(
          it => it.year == +y && it.month == +m && it.day == +date
        );
        if (d.lunarInfo) {
          d.holiday = d.lunarInfo.lunarFestival || d.lunarInfo.solarFestival;
          d.desc =
            d.lunarInfo.lunarFestival ||
            d.lunarInfo.solarFestival ||
            d.lunarInfo.lunarDayName;
          d.descPos = "bottom";
          d.descColor = "medium";
          // d.desc = this.getJQ(d);
          if (d.lunarInfo.lunarFestival || d.lunarInfo.solarFestival) {
            d.desc = d.lunarInfo.lunarFestival || d.lunarInfo.solarFestival;
            if (
              d.desc &&
              d.lunarInfo.lunarMonthName &&
              d.lunarInfo.lunarMonthName.includes("润")
            ) {
              d.desc = d.lunarInfo.lunarDayName;
            }
            d.descColor = "danger";
          }
          d.desc =
            d.desc && d.desc.length > 3 ? `${d.desc.substr(0, 3)}...` : d.desc;
        }
      }
    }
    return d;
  }
  private getJQ(d: DayModel) {
    if (d.desc && d.desc.length <= 4) {
      return d.desc;
    }
    return d.lunarInfo && d.lunarInfo.lunarDayName;
  }
  private generateCanlender2(months: number) {
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
    return Promise.resolve(calender);
  }
  private generateNthCanlender(nthMonth: number) {
    return Promise.resolve().then(_ => {
      const calendar: AvailableDate[] = [];
      for (let i = 0; i < nthMonth; i++) {
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

          // console.log("lastMDay", this.format(lastMDay));
          for (let d = lastMDay.getDate(), j = curWeek; j > 0; d--, j--) {
            const date = new Date(lastMDay.setDate(d));
            // console.log(this.format(date));
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
        // console.log(`第${i}个月日期生成耗时：${Date.now() - st} ms`);
      }
      // console.log(calendar);
      return calendar;
    });
  }
}
