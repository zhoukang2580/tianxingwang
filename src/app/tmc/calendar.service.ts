import { RequestEntity } from "src/app/services/api/Request.entity";
import { ApiService } from "src/app/services/api/api.service";
import { Subject, BehaviorSubject } from "rxjs";
import { Injectable } from "@angular/core";
import * as moment from "moment";
import { AvailableDate } from "./models/AvailableDate";
import { LanguageHelper } from "../languageHelper";
import { DayModel, ILunarInfo } from "./models/DayModel";
import { Storage } from "@ionic/storage";
const lunarCalendar = window["LunarCalendar"];
const _KEY_HOLIDAYS = "_key_holidays";
@Injectable({
  providedIn: "root"
})
export class CalendarService {
  private selectedDaysSource: Subject<DayModel[]>;
  private selectedDays: DayModel[];
  private holidays: ICalendarEntity[] = [];
  private dayOfWeekNames = {
    0: LanguageHelper.getSundayTip(),
    1: LanguageHelper.getMondayTip(),
    2: LanguageHelper.getTuesdayTip(),
    3: LanguageHelper.getWednesdayTip(),
    4: LanguageHelper.getThursdayTip(),
    5: LanguageHelper.getFridayTip(),
    6: LanguageHelper.getSaturdayTip()
  };
  constructor(private apiService: ApiService, private storage: Storage) {
    this.selectedDaysSource = new BehaviorSubject([]);
  }
  async getHolidays(forceFetch = false) {
    if (!this.holidays) {
      const local = await this.storage.get(_KEY_HOLIDAYS);
      this.holidays = (local && local.lenth) || [];
    }
    if (!forceFetch) {
      if (this.holidays.length) {
        return Promise.resolve(this.holidays);
      }
    }
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `ApiHomeUrl-Home-GetCalendar`;
    req.Timeout = 5 * 1000;
    req.Data = {
      beginDate: moment()
        .startOf("year")
        .add(-3, "months")
        .format("YYYY-MM-DD")
    };
    this.holidays = await this.apiService
      .getPromiseData<ICalendarEntity[]>(req)
      .catch(_ => []);
    if (this.holidays.length) {
      this.cacheHolidays(this.holidays);
    }
    return this.holidays;
  }
  private async cacheHolidays(holidays: ICalendarEntity[]) {
    if (holidays && holidays.length) {
      await this.storage.set(_KEY_HOLIDAYS, holidays);
    }
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
    return retD; // this.initDayDescInfo(retD);
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
  async generateYearNthMonthCalendar(
    year: number,
    month: number
  ): Promise<AvailableDate> {
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
    const holidays = await this.getHolidays();
    const clnder = this.initDaysDayOff(calender, holidays);
    // console.log("generateYearNthMonthCalendar", clnder);
    return Promise.resolve(clnder);
  }
  private initDaysDayOff(c: AvailableDate, holidays: ICalendarEntity[]) {
    if (holidays && holidays.length) {
      holidays.forEach(hd => {
        c.dayList.forEach(d => {
          if (hd.Date.substr(0, 10) == d.date) {
            d.dayoff = true;
            if (!c.dayList.find(it => it.bottomDesc == hd.Name)) {
              d.bottomDesc = hd.Name;
              if (d.date.includes("10-01")) {
                if (!d.bottomDesc.includes("国庆")) {
                  d.bottomDesc = `${d.bottomDesc.replace("节", "")},国庆`;
                }
              }
              if (d.bottomDesc) {
                d.descColor = "danger";
              }
            }
          }
        });
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
          d.bottomDesc =
            d.lunarInfo.lunarFestival ||
            d.lunarInfo.solarFestival ||
            d.lunarInfo.lunarDayName;
          d.descColor = "medium";
          // d.desc = this.getJQ(d);
          if (d.lunarInfo.lunarFestival || d.lunarInfo.solarFestival) {
            d.bottomDesc =
              d.lunarInfo.lunarFestival || d.lunarInfo.solarFestival;
            if (
              d.lunarInfo.lunarFestival &&
              d.lunarInfo.lunarMonthName &&
              d.lunarInfo.lunarMonthName.includes("闰")
            ) {
              d.bottomDesc = d.lunarInfo.lunarDayName;
            }
            d.descColor = "danger";
          }
          d.bottomDesc =
            d.bottomDesc && d.bottomDesc.length > 3
              ? `${d.bottomDesc.substr(0, 3)}...`
              : d.bottomDesc;
        }
      }
    }
    return d;
  }
}
export interface ICalendarEntity {
  /// <summary>
  /// 是否上班
  /// </summary>
  IsWork: boolean;

  /// <summary>
  /// 节日名称
  /// </summary>
  Name: string;

  /// <summary>
  /// 描述
  /// </summary>
  Description: string;

  /// <summary>
  /// 农历
  /// </summary>
  LunarDate: string;

  /// <summary>
  /// 具体日期
  /// </summary>
  Date: string;
}
