import { RequestEntity } from "src/app/services/api/Request.entity";
import { ApiService } from "src/app/services/api/api.service";
import { Subject, BehaviorSubject, Subscription } from "rxjs";
import { Injectable, EventEmitter } from "@angular/core";
import * as moment from "moment";
import { AvailableDate } from "./models/AvailableDate";
import { LanguageHelper } from "../languageHelper";
import { DayModel, ILunarInfo } from "./models/DayModel";
import { Platform } from "@ionic/angular";
import { Router } from "@angular/router";
import { FlightHotelTrainType } from "./tmc.service";
import { filter, tap, distinct } from "rxjs/operators";
import { TripType } from "./models/TripType";
import { connect } from "http2";
import { AppHelper } from "../appHelper";
import { TmcCalendarComponent } from "./components/tmc-calendar/tmc-calendar.page";
import { LangService } from "../services/lang.service";
import { StorageService } from "../services/storage-service.service";
const lunarCalendar = window["LunarCalendar"];
const _KEY_HOLIDAYS = "_key_holidays";
@Injectable({
  providedIn: "root",
})
export class CalendarService {
  private subscription = Subscription.EMPTY;
  private selectedDaysSource: EventEmitter<DayModel[]>;
  private isCurrentSelectedOk = false;
  private isMulti = false;
  private tripType: TripType;
  private forType: FlightHotelTrainType;
  private goArrivalTime = "";
  private title = "";
  private calendars: AvailableDate[];
  private selectedDays: DayModel[];
  private holidays: ICalendarEntity[] = [];
  private fetchingHolidaysPromise: Promise<ICalendarEntity[]>;

  constructor(
    private apiService: ApiService,
    private storage: StorageService,
    private plt: Platform,
    private router: Router,
    private langService: LangService
  ) {
    this.selectedDaysSource = new EventEmitter();
    this.calendars = [];
    // this.initCalendars();
  }
  private initCalendars() {
    this.calendars = [];
    const m = this.getMoment(0);
    const len = 12;
    for (let i = 0; i < len; i++) {
      const im = m.clone().add(i, "months");
      let month = `${im.month() + 1}`;
      if (+month < 10) {
        month = `0${month}`;
      }
      const ym = `${im.year()}-${month}`;
      const calendars = this.generateYearNthMonthCalendar(
        im.year(),
        im.month() + 1
      );
      this.calendars.push(calendars);
    }
  }
  diff(d2: string, d1: string, unit: any): number {
    return moment(d2).diff(moment(d1), unit);
  }
  async openCalendar(data: {
    goArrivalTime: string;
    beginDate: string;
    disabledSelectDateReason?: string;
    isCanSelectYesterday?: boolean;
    endDate: string;
    title?: string;
    isMulti: boolean;
    forType: FlightHotelTrainType;
    tripType?: TripType;
    isEnableSelectAllDate?: boolean;
  }) {
    const m = await AppHelper.modalController.create({
      component: TmcCalendarComponent,
      // animated: false,
      componentProps: {
        calendarService: this,
        ...data,
      },
    });
    m.present();
    const d = await m.onDidDismiss();
    return d && (d.data as DayModel[]);
    // return this.openCalendarByNormal();
  }
  getFormatedDate(date: string) {
    const m = this.getMoment(0, date);
    let format = date.length > 10 ? "YYYY/MM/DD HH:mm:ss" : "YYYY/MM/DD";
    if (this.plt.is("ios")) {
      return m.format(format);
    }
    format = format.replace(/\//g, "-");
    return m.format(format);
  }
  private generateOneCalendar(calendar: AvailableDate) {
    const ul = document.createElement("ul");
    ul.setAttribute("ym", calendar.yearMonth);
    ul.classList.add("calendar");
    const ym = document.createElement("li");
    const ymc = document.createElement("strong");
    ym.appendChild(ymc);
    ymc.textContent = `${calendar.yearMonth.substr(
      0,
      4
    )}年${calendar.yearMonth.substr(5, 2)}月`;
    ym.style.display = "block";
    ym.style.width = "100%";
    ym.style.height = "1em";
    ul.appendChild(ym);
    const shadow = document.createElement("div");
    const m = calendar.yearMonth.substr(5, 2);
    shadow.textContent = +m < 10 ? `${m.substr(1)}` : m;
    shadow.classList.add("shadow-month");
    ul.appendChild(shadow);
    for (const d of calendar.dayList) {
      const li = document.createElement("li");
      const cs = d.clazz();
      Object.keys(cs)
        .filter((it) => cs[it])
        .forEach((clazz) => {
          li.classList.add(clazz);
        });
      const day = this.generateDayHtml(d);
      li.setAttribute("date", d.date);
      li.appendChild(day);
      ul.appendChild(li);
    }
    return ul;
  }
  private generateDayHtml(day: DayModel) {
    const d = document.createElement("div");
    d.classList.add("day");
    if (day.hasToolTip) {
      d.classList.add("hasToolTip");
    }
    if (day.isToday) {
      d.classList.add("active", "today");
    }
    d.setAttribute("toolTipMsg", day.toolTipMsg || "");
    d.setAttribute("toolTipPos", day.toolTipPos || "");
    if (day.isLastMonthDay) {
      d.classList.add("is-last-month-day");
    }
    d.onclick = () => {
      this.toggleSelected(day, d);
    };
    const divtop = document.createElement("div");
    const dayoff = document.createElement("div");
    dayoff.classList.add("dayoff", "danger");
    dayoff.textContent = "休";
    const topDesc = document.createElement("div");
    topDesc.textContent = `${day.topDesc}`;
    topDesc.classList.add("desc", "ion-text-nowrap");
    if (day.topDesc) {
      divtop.appendChild(topDesc);
    }
    if (day.dayoff) {
      divtop.appendChild(dayoff);
    }
    divtop.classList.add("top");
    d.appendChild(divtop);
    const content = document.createElement("div");
    content.classList.add(
      "content",
      `color-${day.dayoff ? "danger" : day.color}`
    );
    const cdiv = document.createElement("div");
    cdiv.textContent = !day.isToday ? day.day : day.displayName;
    content.appendChild(cdiv);
    d.appendChild(content);
    const bottom = document.createElement("div");
    bottom.classList.add("bottom", `color-${day.descColor}`);
    const bdiv = document.createElement("div");
    bdiv.classList.add("ion-text-nowrap");
    if (day.bottomDesc) {
      bdiv.textContent = day.bottomDesc.includes("程")
        ? (day.lunarInfo && day.lunarInfo.lunarDayName) || ""
        : day.bottomDesc;
      bottom.appendChild(bdiv);
    }
    d.appendChild(bottom);
    day.el = d;
    return d;
  }
  private toggleSelected(day: DayModel, d: HTMLElement) {
    day.selected = !day.selected;
    d.classList.toggle("selected", day.selected);
    this.onDaySelected(day);
  }
  private generateCalendars(calendars: AvailableDate[]) {
    const df = document.createDocumentFragment();
    for (const c of calendars) {
      df.appendChild(this.generateOneCalendar(c));
    }
    return df;
  }
  getDayOfWeekNames(n: number,isAbbreviation=true) {
    switch (n) {
      case 0:
        return LanguageHelper.getSundayTip(isAbbreviation);
      case 1:
        return LanguageHelper.getMondayTip(isAbbreviation);
      case 2:
        return LanguageHelper.getTuesdayTip(isAbbreviation);
      case 3:
        return LanguageHelper.getWednesdayTip(isAbbreviation);
      case 4:
        return LanguageHelper.getThursdayTip(isAbbreviation);
      case 5:
        return LanguageHelper.getFridayTip(isAbbreviation);
      case 6:
        return LanguageHelper.getSaturdayTip(isAbbreviation);
    }
  }
  private getCalendars(beginDate: string, endDate: string) {
    const calendars = [];
    const m = this.getMoment(0, beginDate || endDate || "");
    if (this.forType != FlightHotelTrainType.Train) {
      for (let i = 0; i < 2; i++) {
        const temp = m.clone().add(i, "months");
        console.log("temp ", temp.year(), temp.month() + 1, beginDate, endDate);
        calendars.push(
          this.generateYearNthMonthCalendar(temp.year(), temp.month() + 1)
        );
      }
    } else {
      for (let i = 0; i < 2; i++) {
        const im = m.clone().add(i, "months");
        calendars.push(
          this.generateYearNthMonthCalendar(im.year(), im.month() + 1)
        );
      }
    }
    return calendars;
  }
  private onDaySelected(d: DayModel) {
    if (!this.selectedDays) {
      this.selectedDays = [];
    }
    if (!d || !d.date || this.isCurrentSelectedOk) {
      return;
    }
    if (!d.enabled) {
      AppHelper.toast(LanguageHelper.getSelectOtherFlyDayTip(), 1000, "middle");
      return;
    }
    if (this.selectedDays.length >= 2) {
      // this.selectedDays = [];
      return;
    }
    d.selected = true;
    if (this.isMulti) {
      if (this.selectedDays.length) {
        if (d.timeStamp < this.selectedDays[0].timeStamp) {
          d.topDesc =
            this.tripType == TripType.checkIn ||
            this.tripType == TripType.checkOut
              ? LanguageHelper.getCheckInTip()
              : LanguageHelper.getDepartureTip();
          d.hasToolTip = true;
          d.toolTipMsg =
            this.tripType == TripType.checkIn ||
            this.tripType == TripType.checkOut
              ? LanguageHelper.getSelectCheckOutDate()
              : LanguageHelper.getBackDateTip();
          this.selectedDays = [d];
          this.checkHotelSelectedDate(d);
          // AppHelper.toast(LanguageHelper.getSelectFlyBackDate(), 1000, "top");
        } else {
          d.firstSelected = true;
          d.lastSelected = true;
          d.hasToolTip = true;
          d.topDesc =
            this.tripType == TripType.checkIn ||
            this.tripType == TripType.checkOut
              ? LanguageHelper.getCheckOutTip()
              : LanguageHelper.getReturnTripTip();
          if (this.selectedDays[0].timeStamp == d.timeStamp) {
            this.selectedDays[0].topDesc =
              this.tripType == TripType.checkIn ||
              this.tripType == TripType.checkOut
                ? LanguageHelper.getCheckInOutTip()
                : LanguageHelper.getRoundTripTip();
          } else {
            d.toolTipMsg =
              this.tripType == TripType.checkIn ||
              this.tripType == TripType.checkOut
                ? LanguageHelper.getCheckInOutTotalDaysTip(
                    Math.abs(
                      this.getMoment(0, this.selectedDays[0].date).diff(
                        d.date,
                        "days"
                      )
                    )
                  )
                : LanguageHelper.getRoundTripTotalDaysTip(
                    Math.abs(
                      this.getMoment(0, this.selectedDays[0].date).diff(
                        d.date,
                        "days"
                      )
                    )
                  );
          }
          const first = this.selectedDays[0];
          first.hasToolTip = false;
          first.update();
          d.update();
          this.selectedDays.push(d);
        }
      } else {
        d.firstSelected = true;
        d.lastSelected = true;
        d.hasToolTip = true;
        console.log("tripType", this.tripType);
        if (
          this.tripType == TripType.returnTrip ||
          this.tripType == TripType.departureTrip
        ) {
          d.topDesc = LanguageHelper.getDepartureTip();
          d.toolTipMsg = LanguageHelper.getSelectFlyBackDate();
        }
        if (
          this.tripType == TripType.checkIn ||
          this.tripType == TripType.checkOut
        ) {
          d.topDesc = LanguageHelper.getCheckInTip();
          d.toolTipMsg = LanguageHelper.getSelectCheckOutDate();
        } else {
        }
        this.selectedDays = [d];
        this.checkHotelSelectedDate(d);
      }
    } else {
      d.firstSelected = true;
      d.lastSelected = true;
      d.topDesc = LanguageHelper.getDepartureTip();
      if (this.tripType == TripType.returnTrip) {
        d.topDesc = LanguageHelper.getReturnTripTip();
        d.hasToolTip = false;
        d.toolTipMsg = null;
      }
      if (this.tripType == TripType.departureTrip) {
        d.topDesc = LanguageHelper.getDepartureTip();
        d.hasToolTip = false;
        d.toolTipMsg = null;
      }
      if (this.tripType == TripType.checkOut) {
        d.topDesc = LanguageHelper.getCheckOutTip();
        d.hasToolTip = false;
      }
      if (this.tripType == TripType.checkIn) {
        d.topDesc = LanguageHelper.getCheckInTip();
        d.hasToolTip = false;
      }
      this.selectedDays = [d];
    }
    const first = this.selectedDays[0];
    const last = this.selectedDays[this.selectedDays.length - 1];
    console.time("update");
    this.calendars.forEach((item) => {
      if (item && item.dayList) {
        item.dayList.forEach((dt) => {
          dt.selected = this.isMulti
            ? this.selectedDays.some((it) => it.date === dt.date)
            : dt.date === d.date;
          dt.lastSelected = false;
          dt.firstSelected = false;
          if (!dt.selected) {
            dt.topDesc = "";
            dt.hasToolTip = false;
            dt.toolTipMsg = "";
          }
          if (first && last) {
            first.firstSelected = true;
            last.lastSelected = true;
            first.selected = true;
            last.selected = true;
            if (first.date != last.date) {
              last.firstSelected = false;
              first.lastSelected = false;
            }
            dt.isBetweenDays =
              dt.timeStamp > first.timeStamp && dt.timeStamp < last.timeStamp;
            if (dt.isBetweenDays) {
              dt.selected = true;
            }
          }
          dt.update();
        });
      }
    });
    console.timeEnd("update");
    if (this.isMulti) {
      this.isCurrentSelectedOk =
        this.selectedDays && this.selectedDays.length > 1;
    } else {
      this.isCurrentSelectedOk = !!(
        this.selectedDays && this.selectedDays.length
      );
    }
    if (this.isMulti) {
      if (this.selectedDays.length > 1) {
        this.setSelectedDaysSource(this.selectedDays);
        this.closeCalendar();
      }
    } else if (this.selectedDays.length) {
      this.setSelectedDaysSource(this.selectedDays);
      this.closeCalendar();
    }
  }
  private checkHotelSelectedDate(selectedBeginDay: DayModel) {
    if (this.forType == FlightHotelTrainType.Hotel) {
      this.calendars.forEach((ym) => {
        if (ym.dayList) {
          ym.dayList = ym.dayList.map((itm) => {
            itm.enabled =
              itm.enabled && itm.timeStamp > selectedBeginDay.timeStamp;
            return itm;
          });
        }
      });
    }
  }
  private closeCalendar(isNow = false) {
    const calendarEle = document.body.querySelector("#calendar");
    this.isCurrentSelectedOk = false;
    setTimeout(
      () => {
        if (this.calendars) {
          this.calendars.forEach((item) => {
            if (item.dayList) {
              item.dayList.forEach((d) => {
                d.hasToolTip = false;
                d.selected = false;
                d.isBetweenDays = false;
                d.firstSelected = false;
                d.lastSelected = false;
                d.update();
              });
            }
          });
          if (calendarEle) {
            calendarEle.classList.toggle("show", false);
          }
        }
        this.selectedDays = [];
      },
      isNow ? 0 : 200
    );
  }
  private renderCalendar(calendars: AvailableDate[]) {
    let calendarEle = document.body.querySelector("#calendar");
    if (!calendarEle) {
      const c = this.generateCalendars(calendars);
      calendarEle = document.createElement("div");
      const weeks = document.createElement("ul");
      const header = document.createElement("div");
      header.classList.add("header");
      calendarEle.appendChild(header);
      const backbtn = document.createElement("button");
      backbtn.textContent = "取消";
      const title = document.createElement("div");
      title.classList.add("title");
      title.textContent = "请选择日期";
      backbtn.onclick = () => {
        this.closeCalendar(true);
      };
      header.appendChild(backbtn);
      header.appendChild(title);
      weeks.classList.add("weeks");
      for (let i = 0; i < 7; i++) {
        const wn = this.getDayOfWeekNames(i);
        const li = document.createElement("li");
        li.style.color =
          i == 0 || i == 6
            ? "var(--ion-color-danger)"
            : "var(--ion-color-secondary)";
        li.textContent = `${wn}`;
        weeks.appendChild(li);
      }
      calendarEle.appendChild(weeks);
      calendarEle.id = "calendar";
      calendarEle.classList.add("calendar-container");
      calendarEle.appendChild(c);
      document.body.querySelector("ion-app").appendChild(calendarEle);
      calendarEle.classList.toggle("show", true);
    } else {
      calendarEle.querySelector(".title").textContent =
        this.title || "选择日期";
      calendarEle.classList.toggle("show", true);
    }
    this.checkYms();
  }
  private checkYms() {
    const st = Date.now();
    const m = this.getMoment(0, this.goArrivalTime || "");
    const goDate = this.getMoment(0, m.format("YYYY-MM-DD"));
    if (this.calendars && this.calendars.length) {
      const type = this.forType;
      if (
        this.tripType == TripType.returnTrip ||
        this.tripType == TripType.checkOut ||
        this.forType == FlightHotelTrainType.InternationalFlight
      ) {
        if (this.goArrivalTime) {
          if (this.calendars.length) {
            const endDay = this.generateDayModel(this.getMoment(30));
            this.calendars.forEach((day) => {
              if (day.dayList) {
                day.dayList.forEach((d) => {
                  d.enabled =
                    +this.getMoment(0, d.date.substr(0, 10)) >= +goDate;
                  if (type == FlightHotelTrainType.Train) {
                    d.enabled =
                      d.timeStamp <= endDay.timeStamp ? d.enabled : false;
                  }
                  d.update();
                });
              }
            });
          }
        }
      } else {
        const today = this.generateDayModel(this.getMoment(0));
        const endDay = this.generateDayModel(this.getMoment(30));
        this.calendars.forEach((day) => {
          if (day.dayList) {
            day.dayList.forEach((d) => {
              d.enabled = d.timeStamp > today.timeStamp || d.date == today.date;
              if (type == FlightHotelTrainType.Train) {
                d.enabled = d.timeStamp <= endDay.timeStamp ? d.enabled : false;
              }
              d.update();
            });
          }
        });
      }
    }
    console.log(`checkYms ${Date.now() - st} ms`);
  }
  getMoment(addDays: number = 0, date: string | number = "") {
    let m = moment();
    if (date) {
      if (typeof date == "string") {
        const format = "YYYY-MM-DD HH:mm:ss";
        if (date.includes("T")) {
          date = date.replace("T", " ");
        }
        if (date.includes("/")) {
          date = date.replace(/\//g, "-");
        }
        if (!date.includes(":")) {
          m = moment(`${date} 00:00:00`, format);
        } else {
          m = moment(date, format);
        }
      } else {
        m = moment(date);
      }
    }
    if (addDays) {
      return m.add(addDays, "days");
    }
    return m;
  }
  private async getHolidays(forceFetch = false) {
    if (!this.holidays) {
      const local = await this.storage.get(_KEY_HOLIDAYS);
      this.holidays =
        (local && Array.isArray(local) && local.length && local) || [];
    }
    if (!forceFetch) {
      if (Array.isArray(this.holidays) && this.holidays.length) {
        return Promise.resolve(this.holidays);
      }
    }
    if (this.fetchingHolidaysPromise) {
      return this.fetchingHolidaysPromise;
    }
    const req = new RequestEntity();
    // req.IsShowLoading = true;
    req.Method = `ApiHomeUrl-Home-GetCalendar`;
    req.Timeout = 5 * 1000;
    req.Data = {
      beginDate: moment()
        .startOf("year")
        // .add(-6, "months")
        .format("YYYY-MM-DD"),
    };
    this.fetchingHolidaysPromise = this.apiService
      .getPromiseData<ICalendarEntity[]>(req)
      .then((data) => {
        this.holidays = data;
        this.holidays = Array.isArray(this.holidays) ? this.holidays : [];
        if (this.holidays.length) {
          this.cacheHolidays(this.holidays);
        }
        return data;
      })
      .finally(() => {
        this.fetchingHolidaysPromise = null;
      });
    return this.fetchingHolidaysPromise;
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
  getNowDate() {
    const n = this.getMoment(0);
    return n.format("YYYY-MM-DD");
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

      // case this.generateDayModel(curDay.add(1, "days")).date: {
      //   return LanguageHelper.getTomorrowTip();
      // }
      // case this.generateDayModel(curDay.add(1, "days")).date: {
      //   return LanguageHelper.getTheDayAfterTomorrowTip();
      // }

      default:
    }
    return d.dayOfWeekName;
  }
  getDescOfDay(d: DayModel) {
    const curDay = moment(); // 今天
    // console.log(d.date);
    switch (d.date) {
      case this.generateDayModel(curDay).date: {
        return LanguageHelper.getTodayTip();
      }

      // case this.generateDayModel(curDay.add(1, "days")).date: {
      //   return LanguageHelper.getTomorrowTip();
      // }
      // case this.generateDayModel(curDay.add(1, "days")).date: {
      //   return LanguageHelper.getTheDayAfterTomorrowTip();
      // }

      default:
    }
    return d.dayOfWeekName;
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
        retD.displayName = LanguageHelper.getTodayTip();
      }
      retD.toolTipPos = "center";
      this.setWeekName(retD);
    } else {
      retD.date = d.format("YYYY-MM-DD");
      retD.day = d.date() + "";
      retD.displayName = retD.day;
      retD.timeStamp = Math.floor(+d / 1000);
      retD.enabled = Math.floor(+d / 1000) >= AppHelper.getTimestamp();
      const y = new Date().getFullYear();
      let month = `${new Date().getMonth() + 1}`;
      let date = `${new Date().getDate()}`;
      if (+month < 10) {
        month = `0${month}`;
      }
      if (+date < 10) {
        date = `0${date}`;
      }
      if (retD.date === `${y}-${month}-${date}`) {
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
    const wn = this.getDayOfWeekNames(d.dayOfWeek);
    d.dayOfWeekName = wn;
  }
  getWeekName(d: DayModel) {
    d.dayOfWeek = moment(d.date, "YYYY-MM-DD").weekday();
    const wn = this.getDayOfWeekNames(d.dayOfWeek);
    d.dayOfWeekName = wn;
    return wn;
  }
  generateYearNthMonthCalendar(year: number, month: number) {
    const ym = `${year}-${month < 10 ? "0" + month : month}`;
    const one = this.calendars.find((it) => it.yearMonth == ym);
    if (one) {
      return {
        ...one,
        dayList: one.dayList.map((d) => {
          return { ...d };
        }),
      };
    }
    const st = Date.now();
    const iM = moment(`${year}-${month}-01`, "YYYY-MM-DD"); // 第i个月
    const calender: AvailableDate = {
      dayList: [],
      disabled: false,
      yearMonth: iM.format("YYYY-MM"),
    };
    const dayCountOfiM = iM
      .startOf("month")
      .date(1) // 每月的一号
      .add(1, "months") // 下个月的一号
      .subtract(1, "days") // 这个月的最后一天
      .date(); // 最后一天是几，代表这个月有几天
    const curMFistDate = moment(iM).startOf("month").date(1);
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
    this.getHolidays()
      .then((holidays) => {
        this.initDaysDayOff(calender, holidays);
      })
      .catch(() => 0);
    // console.log("generateYearNthMonthCalendar", clnder);
    console.log(`生成${year}-${month} 耗时:${Date.now() - st} ms`);
    this.calendars.push(calender);
    return calender;
  }
  private initDaysDayOff(c: AvailableDate, holidays: ICalendarEntity[]) {
    if (holidays && holidays.length) {
      holidays.forEach((hd) => {
        c.dayList.forEach((d) => {
          if (hd.Date.substr(0, 10) == d.date) {
            d.dayoff = true;
            if (hd.Name && !c.dayList.find((it) => it.bottomDesc == hd.Name)) {
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
          (it) => it.year == +y && it.month == +m && it.day == +date
        );
        if (d.lunarInfo) {
          d.bottomDesc = d.lunarInfo.lunarDayName;
          d.descColor = "medium";
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
