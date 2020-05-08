import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { TmcService, FlightHotelTrainType } from "../tmc.service";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { IonInfiniteScroll } from "@ionic/angular";
import { AvailableDate } from "../models/AvailableDate";
import { CalendarService } from "../calendar.service";
import { DayModel } from "../models/DayModel";
import { TripType } from "../models/TripType";
import { AppHelper } from "src/app/appHelper";
import { LanguageHelper } from "src/app/languageHelper";
import { BackButtonComponent } from "src/app/components/back-button/back-button.component";

@Component({
  selector: "app-tmc-calendar",
  templateUrl: "./tmc-calendar.page.html",
  styleUrls: ["./tmc-calendar.page.scss"],
})
export class TmcCalendarPage implements OnInit, OnDestroy {
  @ViewChild(BackButtonComponent) backbtn: BackButtonComponent;
  private subscriptions: Subscription[] = [];
  private page: { m: number; y: number };
  private delayBackTime = 200;
  private forType: FlightHotelTrainType;
  private goArrivalTime: string;
  private isCurrentSelectedOk = false;
  private days: DayModel[] = [];
  private timeoutId: any;
  isMulti: boolean; // 是否多选
  private tripType: TripType;
  set selectedDays(days: DayModel[]) {
    this.days = days;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      this.days.forEach((dt) => {
        dt.hasToolTip = false;
        dt.toolTipMsg = "";
      });
    }, 1000);
  }
  get selectedDays() {
    return this.days;
  }
  FlightHotelTrainType = FlightHotelTrainType;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  title = "请选择日期";
  calendars: AvailableDate[];
  weeks: string[];
  constructor(
    private tmcService: TmcService,
    private calendarService: CalendarService,
    private route: ActivatedRoute
  ) {}

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  ngOnInit() {
    this.page = {} as any;
    const w = this.calendarService.getDayOfWeekNames();
    this.weeks = Object.keys(w).map((k) => w[k]);
    this.subscriptions.push(
      this.calendarService.getSelectedDaysSource().subscribe((days) => {
        this.selectedDays = days;
      })
    );
    this.subscriptions.push(
      this.route.queryParamMap.subscribe((q) => {
        this.title = q.get("title");
        this.forType = q.get("forType") as any;
        this.tripType = q.get("tripType") as any;
        this.goArrivalTime = q.get("goArrivalTime");
        if (!this.calendars || !this.calendars.length) {
          this.initCurYearMonthCalendar();
        } else {
          this.updateCalendars();
        }
      })
    );
  }
  private updateCalendars() {
    const m = this.calendarService.getMoment(0);
    const calendars = [];
    const len =
      this.forType == FlightHotelTrainType.Train
        ? 2
        : this.calendars[this.calendars.length - 1].yearMonth.substr(5, 2);
    for (let i = 0; i < len; i++) {
      const im = m.clone().add(i, "months");
      calendars.push(
        this.calendarService.generateYearNthMonthCalendar(
          im.year(),
          im.month() + 1
        )
      );
    }
  }
  private initCurYearMonthCalendar() {
    const m = this.calendarService.getMoment(0, this.goArrivalTime || "");
    console.log("goArrivalTime", this.goArrivalTime, m.format("YYYY-MM-DD"));
    let st = Date.now();
    this.generateYearCalendar();
    console.log("生成日历耗时：" + (Date.now() - st) + " ms");
  }
  private generateYearCalendar() {
    const m = this.calendarService.getMoment(0);
    this.calendars = [];
    const len = this.forType == FlightHotelTrainType.Train ? 2 : 12;
    for (let i = 0; i < len; i++) {
      const im = m.clone().add(i, "months");
      this.calendars.push(
        this.calendarService.generateYearNthMonthCalendar(
          im.year(),
          im.month() + 1
        )
      );
    }
    this.checkYms();
  }
  private checkYms() {
    const st = Date.now();
    const m = this.calendarService.getMoment(0, this.goArrivalTime || "");
    const goDate = this.calendarService.getMoment(0, m.format("YYYY-MM-DD"));
    if (this.calendars && this.calendars.length) {
      const type = this.forType;
      if (
        this.tripType == TripType.returnTrip ||
        this.tripType == TripType.checkOut ||
        this.forType == FlightHotelTrainType.InternationalFlight
      ) {
        if (this.goArrivalTime) {
          if (this.calendars.length) {
            const endDay = this.calendarService.generateDayModel(
              this.calendarService.getMoment(30)
            );
            this.calendars.forEach((day) => {
              if (day.dayList) {
                day.dayList.forEach((d) => {
                  d.enabled =
                    +this.calendarService.getMoment(0, d.date.substr(0, 10)) >=
                    +goDate;
                  if (type == FlightHotelTrainType.Train) {
                    d.enabled =
                      d.timeStamp <= endDay.timeStamp ? d.enabled : false;
                  }
                });
              }
            });
          }
        }
      } else {
        const today = this.calendarService.generateDayModel(
          this.calendarService.getMoment(0)
        );
        const endDay = this.calendarService.generateDayModel(
          this.calendarService.getMoment(30)
        );
        this.calendars.forEach((day) => {
          if (day.dayList) {
            day.dayList.forEach((d) => {
              d.enabled = d.timeStamp > today.timeStamp || d.date == today.date;
              if (type == FlightHotelTrainType.Train) {
                d.enabled = d.timeStamp <= endDay.timeStamp ? d.enabled : false;
              }
            });
          }
        });
      }
    }
    console.log(`checkYms ${Date.now() - st} ms`);
  }
  onDaySelected(d: DayModel) {
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
                      this.calendarService
                        .getMoment(0, this.selectedDays[0].date)
                        .diff(d.date, "days")
                    )
                  )
                : LanguageHelper.getRoundTripTotalDaysTip(
                    Math.abs(
                      this.calendarService
                        .getMoment(0, this.selectedDays[0].date)
                        .diff(d.date, "days")
                    )
                  );
          }
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
      if (item.dayList) {
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
        this.back();
      }
    } else if (this.selectedDays.length) {
      this.back();
    }
  }
  private checkHotelSelectedDate(selectedBeginDay: DayModel) {
    if (this.forType == FlightHotelTrainType.Hotel) {
      this.calendars.forEach((it) => {
        if (it.dayList) {
          it.dayList = it.dayList.map((itm) => {
            itm.enabled =
              itm.enabled && itm.timeStamp > selectedBeginDay.timeStamp;
            return itm;
          });
        }
        return it;
      });
    }
  }
  async loadMore() {
    if (!this.calendars.length) {
      return;
    }
    let [y, m] = this.calendars[this.calendars.length - 1].yearMonth
      .split("-")
      .map((it) => +it);
    const result: AvailableDate[] = [];
    let nextM = m;
    this.page.m = m;
    this.page.y = y;
    for (let i = 1; i <= 3; i++) {
      nextM = ++nextM;
      if (nextM > 12) {
        y += 1;
        nextM = 1;
      }
      result.push(this.calendarService.generateYearNthMonthCalendar(y, nextM));
    }
    if (this.scroller) {
      const curY = new Date().getFullYear();
      this.scroller.disabled = curY + 1 == y && nextM == 1;
      this.scroller.complete();
    }
  }
  back() {
    this.calendarService.setSelectedDaysSource(this.selectedDays);
    setTimeout(() => {
      this.backbtn.backToPrePage();
    }, this.delayBackTime);
  }
}
