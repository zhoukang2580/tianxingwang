import { TmcService, FlightHotelTrainType } from "src/app/tmc/tmc.service";
import { ModalController } from "@ionic/angular";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import * as moment from "moment";
import { LanguageHelper } from "src/app/languageHelper";
import { DayModel } from "../../models/DayModel";
import { AvailableDate } from "../../models/AvailableDate";
import { CalendarService } from "../../calendar.service";
import { AppHelper } from "src/app/appHelper";
import { TripType } from "src/app/tmc/models/TripType";
@Component({
  selector: "app-select-date-comp",
  templateUrl: "./select-date.component.html",
  styleUrls: ["./select-date.component.scss"]
})
export class SelectDateComponent implements OnInit, OnDestroy {
  private _selectedDays: DayModel[] = [];
  private timeoutId: any;
  private tripType: TripType;
  private curSelectedYear: string;
  private curSelectedMonth: number;
  private goArrivalTime: string;
  private isCurrentSelectedOk = false;
  forType: FlightHotelTrainType;
  yms: AvailableDate[];
  title: string;
  delayBackTime = 200;
  set selectedDays(days: DayModel[]) {
    this._selectedDays = days;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      this._selectedDays.forEach(dt => {
        dt.hasToolTip = false;
        dt.toolTipMsg = null;
      });
    }, 1000);
  }
  get selectedDays() {
    return this._selectedDays;
  }
  isMulti: boolean; // 是否多选
  multiSub = Subscription.EMPTY;
  selectedSub = Subscription.EMPTY;
  constructor(
    private calendarService: CalendarService,
    private modalCtrl: ModalController
  ) {}
  ngOnDestroy() {
    this.multiSub.unsubscribe();
  }
  ngOnInit() {
    this.selectedDays = [];
    this.initCurYearMonthCalendar();
    this.checkYms();
  }
  initCurYearMonthCalendar() {
    console.log(
      "goArrivalTime",
      this.goArrivalTime,
      this.calendarService.getMoment(0, this.goArrivalTime).format("YYYY-MM-DD")
    );
    if (!this.goArrivalTime) {
      this.curSelectedYear = new Date().getFullYear() + "";
      this.curSelectedMonth = new Date().getMonth() + 1;
    } else {
      const m = moment(
        +this.goArrivalTime ? +this.goArrivalTime : this.goArrivalTime
      );
      this.curSelectedYear = m.year() + "";
      this.curSelectedMonth = m.month() + 1;
    }
    this.generateYearNthMonthCalendar();
  }
  private checkYms() {
    if (this.yms && this.yms.length) {
      const type = this.forType;
      if (
        this.tripType == TripType.returnTrip ||
        this.tripType == TripType.checkOut ||
        this.forType == FlightHotelTrainType.InternationalFlight
      ) {
        if (this.goArrivalTime) {
          const goDate = moment(this.goArrivalTime);
          if (this.yms.length) {
            const endDay = this.calendarService.generateDayModel(
              moment().add(30, "days")
            );
            this.yms.forEach(day => {
              if (day.dayList) {
                day.dayList.forEach(d => {
                  d.enabled =
                    goDate.format("YYYY-MM-DD") == d.date ||
                    +moment(d.date) >= +goDate ||
                    d.date == moment().format("YYYY-MM-DD");
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
        const today = this.calendarService.generateDayModel(moment());
        const endDay = this.calendarService.generateDayModel(
          moment().add(30, "days")
        );
        this.yms.forEach(day => {
          if (day.dayList) {
            day.dayList.forEach(d => {
              d.enabled = d.timeStamp > today.timeStamp || d.date == today.date;
              if (type == FlightHotelTrainType.Train) {
                d.enabled = d.timeStamp <= endDay.timeStamp ? d.enabled : false;
              }
            });
          }
        });
      }
    }
  }
  onYearChange(year: string) {
    this.curSelectedYear = year;
    this.generateYearNthMonthCalendar();
  }
  onMonthChange(month: number) {
    this.curSelectedMonth = month;
    this.generateYearNthMonthCalendar();
  }
  private async generateYearNthMonthCalendar() {
    let y = +this.curSelectedYear;
    let m = +this.curSelectedMonth;
    this.yms = [
      await this.calendarService.generateYearNthMonthCalendar(y, m),
      await this.calendarService.generateYearNthMonthCalendar(
        m + 1 > 12 ? y + 1 : y,
        m + 1 > 12 ? 1 : m + 1
      )
    ];
    // if (this.forType != FlightHotelTrainType.Train) {
    //   this.yms.push(this.calendarService.generateYearNthMonthCalendar(
    //     m + 2 > 12 ? y + 1 : y,
    //     m + 2 > 12 ? m + 2 - 12 : m + 2
    //   ))
    // }
    this.checkYms();
  }
  async cancel() {
    console.log("select date component cancel ", this.selectedDays);
    if (this.selectedDays && this.selectedDays.length) {
      this.calendarService.setSelectedDaysSource(this.selectedDays);
    }
    const m = await this.modalCtrl.getTop();
    if (m) {
      await m.dismiss(this.selectedDays).catch(_ => {});
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
      return;
    }
    d.selected = true;
    d.topDesc = LanguageHelper.getDepartureTip();
    d.descColor = "light";
    d.firstSelected = true;
    d.lastSelected = true;
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
                      moment(this.selectedDays[0].date).diff(d.date, "days")
                    )
                  )
                : LanguageHelper.getRoundTripTotalDaysTip(
                    Math.abs(
                      moment(this.selectedDays[0].date).diff(d.date, "days")
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
    this.yms.map(item => {
      if (item.dayList) {
        item.dayList.forEach(dt => {
          dt.selected = this.isMulti
            ? this.selectedDays.some(it => it.date === dt.date)
            : dt.date === d.date;
          dt.lastSelected = false;
          dt.firstSelected = false;
          if (!dt.selected) {
            // dt.desc = null;
            dt.descColor =
              dt.lunarInfo &&
              (dt.lunarInfo.lunarFestival || dt.lunarInfo.solarFestival)
                ? "danger"
                : "medium";
            dt.topDesc = null;
            dt.hasToolTip = false;
            dt.toolTipMsg = null;
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
    if (this.selectedDays && this.selectedDays.length) {
      const first = this.selectedDays[0];
      const last = this.selectedDays[this.selectedDays.length - 1];
      first.firstSelected = true;
      if (last) {
        last.lastSelected = true;
        if (first.date != last.date) {
          last.firstSelected = false;
          first.lastSelected = false;
          this.yms.forEach(ym => {
            if (ym.dayList) {
              ym.dayList.forEach(it => {
                it.isBetweenDays =
                  it.timeStamp > first.timeStamp &&
                  it.timeStamp < last.timeStamp;
                if (it.isBetweenDays) {
                  it.selected = true;
                }
              });
            }
          });
        }
      }
    }
    if (this.isMulti) {
      if (this.selectedDays.length > 1) {
        setTimeout(() => {
          this.cancel();
        }, this.delayBackTime);
      }
    } else if (this.selectedDays.length) {
      setTimeout(() => {
        this.cancel();
      }, this.delayBackTime);
    }
  }
  private checkHotelSelectedDate(selectedBeginDay: DayModel) {
    if (this.forType == FlightHotelTrainType.Hotel) {
      this.yms = this.yms.map(it => {
        if (it.dayList) {
          it.dayList = it.dayList.map(itm => {
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
