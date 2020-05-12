import { TmcService, FlightHotelTrainType } from "src/app/tmc/tmc.service";
import { ModalController } from "@ionic/angular";
import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  forwardRef,
  Injector,
} from "@angular/core";
import { Subscription } from "rxjs";
import { LanguageHelper } from "src/app/languageHelper";
import { DayModel } from "../../models/DayModel";
import { AvailableDate } from "../../models/AvailableDate";
import { AppHelper } from "src/app/appHelper";
import { TripType } from "src/app/tmc/models/TripType";
import { CalendarService } from '../../calendar.service';
@Component({
  selector: "app-select-date-comp",
  templateUrl: "./select-date.component.html",
  styleUrls: ["./select-date.component.scss"],
})
export class SelectDateComponent implements OnInit, OnDestroy, AfterViewInit {
  private days: DayModel[] = [];
  private timeoutId: any;
  private tripType: TripType;
  private curSelectedYear: string;
  private curSelectedMonth: number;
  private goArrivalTime: string;
  private isCurrentSelectedOk = false;
  private calendarService: CalendarService;
  get curYm() {
    return `${this.curSelectedYear}-${
      this.curSelectedMonth < 10
        ? "0" + this.curSelectedMonth
        : this.curSelectedMonth
    }`;
  }
  forType: FlightHotelTrainType;
  FlightHotelTrainType = FlightHotelTrainType;
  yms: AvailableDate[];
  title: string;
  delayBackTime = 200;
  set selectedDays(days: DayModel[]) {
    this.days = days;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      this.days.forEach((dt) => {
        dt.hasToolTip = false;
        dt.toolTipMsg = "";
        dt.update();
      });
    }, 1000);
  }
  get selectedDays() {
    return this.days;
  }
  isMulti: boolean; // 是否多选
  multiSub = Subscription.EMPTY;
  selectedSub = Subscription.EMPTY;
  constructor(private injector: Injector, private modalCtrl: ModalController) {
    this.calendarService = this.injector.get(CalendarService);
  }
  ngOnDestroy() {
    this.multiSub.unsubscribe();
  }
  clazz(day: DayModel) {
    return day.clazz();
  }

  ngAfterViewInit() {}
  onCalendarElesChange() {}
  ngOnInit() {
    this.selectedDays = [];
    this.initCurYearMonthCalendar();
    this.checkYms();
  }
  initCurYearMonthCalendar() {
    const m = this.calendarService.getMoment(0, this.goArrivalTime || "");
    console.log("goArrivalTime", this.goArrivalTime, m.format("YYYY-MM-DD"));

    this.curSelectedYear = m.year() + "";
    this.curSelectedMonth = m.month() + 1;
    let st = Date.now();
    this.generateYearCalendar();
    console.log("生成日历耗时：" + (Date.now() - st) + " ms");
  }
  private checkYms() {
    const st = Date.now();
    const m = this.calendarService.getMoment(0, this.goArrivalTime || "");
    const goDate = this.calendarService.getMoment(0, m.format("YYYY-MM-DD"));
    if (this.yms && this.yms.length) {
      const type = this.forType;
      if (
        this.tripType == TripType.returnTrip ||
        this.tripType == TripType.checkOut ||
        this.forType == FlightHotelTrainType.InternationalFlight
      ) {
        if (this.goArrivalTime) {
          if (this.yms.length) {
            const endDay = this.calendarService.generateDayModel(
              this.calendarService.getMoment(30)
            );
            this.yms.forEach((day) => {
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
        this.yms.forEach((day) => {
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

  private generateYearCalendar() {
    const m = this.calendarService.getMoment(0);
    this.yms = [];
    const len = this.forType == FlightHotelTrainType.Train ? 2 : 12;
    for (let i = 0; i < len; i++) {
      const im = m.clone().add(i, "months");
      this.yms.push(
        this.calendarService.generateYearNthMonthCalendar(
          im.year(),
          im.month() + 1
        )
      );
    }
    this.checkYms();
  }
  async cancel() {
    if (this.selectedDays && this.selectedDays.length) {
      this.calendarService.setSelectedDaysSource(this.selectedDays);
    }
    console.log("select date component cancel ", this.selectedDays);
    const m = await this.modalCtrl.getTop();
    if (m) {
      await m.dismiss(this.selectedDays).catch((_) => {});
    }
    this.isCurrentSelectedOk = false;
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
    this.yms.forEach((item) => {
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
          // dt.update();
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
        this.cancel();
      }
    } else if (this.selectedDays.length) {
      this.cancel();
    }
  }
  private checkHotelSelectedDate(selectedBeginDay: DayModel) {
    if (this.forType == FlightHotelTrainType.Hotel) {
      this.yms.forEach((it) => {
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
}
