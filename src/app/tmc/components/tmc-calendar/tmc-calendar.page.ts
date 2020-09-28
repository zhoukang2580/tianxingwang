import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  QueryList,
  ElementRef,
  ViewChildren,
  AfterViewInit,
} from "@angular/core";
import { FlightHotelTrainType } from "../../tmc.service";
import { Subscription } from "rxjs";
import { IonInfiniteScroll, IonContent, Platform } from "@ionic/angular";
import { AvailableDate } from "../../models/AvailableDate";
import { CalendarService } from "../../calendar.service";
import { DayModel } from "../../models/DayModel";
import { TripType } from "../../models/TripType";
import { AppHelper } from "src/app/appHelper";
import { LanguageHelper } from "src/app/languageHelper";
import { RefresherComponent } from "src/app/components/refresher";

@Component({
  selector: "app-tmc-calendar",
  templateUrl: "./tmc-calendar.page.html",
  styleUrls: ["./tmc-calendar.page.scss"],
})
export class TmcCalendarComponent implements OnInit, OnDestroy, AfterViewInit {
  private subscriptions: Subscription[] = [];
  private delayBackTime = 100;
  private forType: FlightHotelTrainType;
  private goArrivalTime: string;
  private isCurrentSelectedOk = false;
  private isCanSelectYesterday = false;
  private days: DayModel[] = [];
  private timeoutId: any;
  private isSrollToCurYm = false;
  private calendarService: CalendarService;
  private beginDate: string;
  private endDate: string;
  private st = 0;
  @ViewChild(RefresherComponent, { static: true })
  refresher: RefresherComponent;
  @ViewChild(IonContent, { static: true }) content: IonContent;
  @ViewChildren("calendar") private calendareles: QueryList<
    ElementRef<HTMLElement>
  >;
  isMulti: boolean; // 是否多选
  private tripType: TripType;
  set selectedDays(days: DayModel[]) {
    this.days = days;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (
      ((this.forType == FlightHotelTrainType.Hotel ||
        this.forType == FlightHotelTrainType.HotelInternational) &&
        days &&
        days.length > 1) ||
      !this.isMulti
    ) {
      this.timeoutId = setTimeout(() => {
        this.days.forEach((dt) => {
          dt.hasToolTip = false;
          dt.toolTipMsg = "";
          dt.selected = false;
        });
      }, this.delayBackTime + 50);
    }
  }
  get selectedDays() {
    return this.days;
  }
  FlightHotelTrainType = FlightHotelTrainType;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  title = "请选择日期";
  calendars: AvailableDate[];
  weeks: string[];
  constructor(private plt: Platform) {}

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  loadPreMonths() {
    const first = this.calendars && this.calendars[0];
    if (first) {
      const mm = this.calendarService.getMoment(
        0,
        first.dayList.filter((it) => !it.isLastMonthDay)[0].date
      );
      const current = this.calendarService.getMoment(0);
      const m = this.calendarService.getMoment(0, current.format("YYYY-MM-DD"));
      for (let i = 1; ; i++) {
        const temp = mm.clone().add(-i, "months");
        const c = this.calendarService.generateYearNthMonthCalendar(
          temp.year(),
          temp.month() + 1
        );
        c.dayList = c.dayList.map((it) => {
          it.selected = false;
          it.hasToolTip = false;
          it.topDesc = "";
          return it;
        });
        this.calendars.unshift(c);
        if (+temp < +m) {
          if (this.refresher) {
            this.refresher.disabled = true;
            this.refresher.complete();
          }
          break;
        }
      }
      this.checkYms();
    }
  }
  ngOnInit() {
    this.st = Date.now();
    this.weeks =new Array(7).fill(0).map((k) => this.calendarService.getDayOfWeekNames(k));
    this.initCalendars();
  }
  private initCalendars() {
    this.generateCalendars();
    this.heightLightSelectedDays();
    this.checkYms();
  }
  private heightLightSelectedDays() {
    console.log(
      `heightLightSelectedDays begin=${this.beginDate},end=${this.endDate}`
    );
    let begin = this.calendarService.generateDayModelByDate(this.beginDate);
    if (!this.beginDate) {
      begin = null;
    }
    let end = this.calendarService.generateDayModelByDate(this.endDate);
    if (!this.endDate) {
      end = null;
    }
    if (this.calendars) {
      this.calendars.forEach((c) => {
        if (c.dayList) {
          c.dayList = c.dayList.map((d) => {
            d.selected = false;
            d.topDesc = "";
            d.hasToolTip = false;
            if (this.beginDate && this.endDate) {
              if (d.date == this.beginDate) {
                if (
                  this.forType == FlightHotelTrainType.Hotel ||
                  this.forType == FlightHotelTrainType.HotelInternational
                ) {
                  d.topDesc = "入住";
                }
                if (
                  this.forType == FlightHotelTrainType.Flight ||
                  this.forType == FlightHotelTrainType.InternationalFlight ||
                  this.forType == FlightHotelTrainType.Train
                ) {
                  d.topDesc = "去程";
                }
                d.firstSelected = true;
              }
              if (d.date == this.endDate) {
                d.lastSelected = true;
                if (
                  this.forType == FlightHotelTrainType.Hotel ||
                  this.forType == FlightHotelTrainType.HotelInternational
                ) {
                  d.topDesc = "离店";
                }
                if (
                  this.forType == FlightHotelTrainType.Flight ||
                  this.forType == FlightHotelTrainType.InternationalFlight
                ) {
                  d.topDesc = "返程";
                }
              }
              if (begin && end) {
                d.isBetweenDays =
                  d.timeStamp > begin.timeStamp && d.timeStamp < end.timeStamp;
                if (d.isBetweenDays) {
                  d.selected = true;
                }
              }
            }
            d.selected =
              d.selected || d.date == this.beginDate || d.date == this.endDate;
            return d;
          });
        }
      });
    }
  }
  ngAfterViewInit() {
    // this.subscriptions.push(
    //   this.calendareles.changes.subscribe(() => {
    //     this.moveToCurMonth();
    //   })
    // );
    // setTimeout(() => {
    //   this.moveToCurMonth();
    //   if (!this.isSrollToCurYm) {
    //     setTimeout(() => {
    //       this.moveToCurMonth();
    //     }, 16 * this.calendars.length);
    //   }
    // }, 100);
    console.log("耗时：", Date.now() - this.st);
  }
  private moveToCurMonth() {
    if (this.isSrollToCurYm) {
      return;
    }
    if (!this.calendareles || !this.calendareles.toArray().length) {
      return;
    }
    const scrollToMonth: string = this.calendarService
      .getMoment(0, this.beginDate || this.goArrivalTime)
      .format("YYYY-MM");
    console.log("scrollToMonth", scrollToMonth, this.calendars);
    const el = this.calendareles
      .toArray()
      .find((it) => it.nativeElement.getAttribute("ym") == scrollToMonth);
    if (el && el.nativeElement) {
      const rect = el.nativeElement.getBoundingClientRect();
      if (rect && rect.top) {
        this.isSrollToCurYm = true;
        const delta = rect.top - this.plt.height() / 3;
        console.log("delta ", delta, rect);
        this.content.scrollByPoint(0, delta, 100);
      }
    }
  }

  private generateCalendars() {
    this.calendars = [];
    const m = this.calendarService.getMoment(
      0,
      this.beginDate || this.endDate || ""
    );
    if (this.forType != FlightHotelTrainType.Train) {
      for (let i = 0; i < 2; i++) {
        const temp = m.clone().add(i, "months");
        console.log(
          "temp ",
          temp.year(),
          temp.month() + 1,
          this.beginDate,
          this.endDate
        );
        this.calendars.push(
          this.calendarService.generateYearNthMonthCalendar(
            temp.year(),
            temp.month() + 1
          )
        );
      }
    } else {
      for (let i = 0; i < 2; i++) {
        const im = m.clone().add(i, "months");
        this.calendars.push(
          this.calendarService.generateYearNthMonthCalendar(
            im.year(),
            im.month() + 1
          )
        );
      }
    }
  }
  private checkYms() {
    const st = Date.now();
    const m = this.calendarService.getMoment(0, this.goArrivalTime || "");
    const goDate = m.format("YYYY-MM-DD");
    // if (!this.selectedDays || !this.selectedDays.length) {
    //   goDate = "";
    // }
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
                    AppHelper.getDate(d.date.substr(0, 10)).getTime() >=
                    AppHelper.getDate(goDate).getTime();
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
        const yesterdayM = this.calendarService.generateDayModel(
          this.calendarService.getMoment(-1)
        );
        this.calendars.forEach((day) => {
          if (day.dayList) {
            day.dayList.forEach((d) => {
              d.enabled =
                d.timeStamp > today.timeStamp ||
                d.date == today.date ||
                (this.isCanSelectYesterday &&
                  type == FlightHotelTrainType.Hotel &&
                  d.date == yesterdayM.date);
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
    if (
      this.forType == FlightHotelTrainType.Hotel ||
      this.forType == FlightHotelTrainType.HotelInternational
    ) {
      if (
        this.selectedDays &&
        this.selectedDays.find((it) => it.date == d.date)
      ) {
        return;
      }
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
          // this.checkHotelSelectedDate(d);
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
        // this.checkHotelSelectedDate(d);
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
        });
      }
    });
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
    for (let i = 1; i <= 3; i++) {
      nextM = ++nextM;
      if (nextM > 12) {
        y += 1;
        nextM = 1;
      }
      result.push(this.calendarService.generateYearNthMonthCalendar(y, nextM));
    }
    if (this.scroller) {
      // const curY = new Date().getFullYear();
      // this.scroller.disabled = curY + 1 == y && nextM == 1;
      this.scroller.complete();
    }
    this.calendars = this.calendars.concat(result);
    this.checkYms();
  }
  back() {
    setTimeout(() => {
      AppHelper.modalController.getTop().then((m) => {
        if (m) {
          m.dismiss(this.selectedDays);
        }
      });
    }, this.delayBackTime);
  }
}
