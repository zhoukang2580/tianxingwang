import { TmcService, FlightHotelTrainType } from 'src/app/tmc/tmc.service';
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
    private modalCtrl: ModalController,
    private tmcService: TmcService
  ) { }
  ngOnDestroy() {
    this.multiSub.unsubscribe();
  }
  ngOnInit() {
    this.selectedDays = [];
    this.initCurYearMonthCalendar();
    this.checkYms();
  }
  initCurYearMonthCalendar() {
    console.log("goArrivalTime", this.goArrivalTime);
    if (!this.goArrivalTime) {
      this.curSelectedYear = new Date().getFullYear() + "";
      this.curSelectedMonth = new Date().getMonth() + 1;
    } else {
      const m = moment(
        +this.goArrivalTime ? +this.goArrivalTime * 1000 : this.goArrivalTime
      );
      this.curSelectedYear = m.year() + "";
      this.curSelectedMonth = m.month() + 1;
    }
    this.generateYearNthMonthCalendar();
  }
  checkYms() {
    if (this.yms && this.yms.length) {
      if (
        this.tripType == TripType.returnTrip ||
        this.tripType == TripType.checkOut
      ) {
        if (this.goArrivalTime) {
          const goDate = moment(this.goArrivalTime);
          if (this.yms.length) {
            this.yms.forEach(day => {
              day.dayList.forEach(d => {
                d.enabled =
                  goDate.format("YYYY-MM-DD") == d.date ||
                  +moment(d.date) >= +goDate;
              });
            });
          }
        }
      } else {
        const today = this.calendarService.generateDayModel(moment());
        const endDay = this.calendarService.generateDayModel(moment().add(30, 'days'));
        const type = this.tmcService.getFlightHotelTrainType();
        this.yms.forEach(day => {
          day.dayList.forEach(d => {
            d.enabled = d.timeStamp > today.timeStamp || d.date == today.date;
            if (type == FlightHotelTrainType.Train) {
              d.enabled = d.timeStamp <= endDay.timeStamp ? d.enabled : false;
            }
          });
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
  private generateYearNthMonthCalendar() {
    let y = +this.curSelectedYear;
    let m = +this.curSelectedMonth;
    this.yms = [
      this.calendarService.generateYearNthMonthCalendar(
        y,
        m
      ),
      this.calendarService.generateYearNthMonthCalendar(
        m + 1 > 12 ? y + 1 : y,
        m + 1 > 12 ? 1 : m + 1
      )
    ];
    this.checkYms();
  }
  async cancel() {
    console.log("select date component cancel ", this.selectedDays);
    this.calendarService.setSelectedDays(this.selectedDays);
    const m = await this.modalCtrl.getTop();
    if (m) {
      m.dismiss(this.selectedDays).catch(_ => { });
    }
  }
  onDaySelected(d: DayModel) {
    // console.log(
    //   "select date component onDaySelected",
    //   d,
    //   this.selectedDays.length,
    //   this.tripType,
    //   "this.isMulti",
    //   this.isMulti
    // );
    if (!d || !d.date) {
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
    d.desc = LanguageHelper.getDepartureTip();
    d.descPos = "top";
    d.descColor = "light";
    d.firstSelected = true;
    d.lastSelected = true;
    if (this.isMulti) {
      if (this.selectedDays.length) {
        if (d.timeStamp < this.selectedDays[0].timeStamp) {
          d.desc =
            this.tripType == TripType.checkIn ||
              this.tripType == TripType.checkOut
              ? LanguageHelper.getCheckInTip()
              : LanguageHelper.getDepartureTip();
          d.hasToolTip = true;
          d.toolTipMsg = LanguageHelper.getSelectCheckOutDate();
          this.selectedDays = [d];
          // AppHelper.toast(LanguageHelper.getSelectFlyBackDate(), 1000, "top");
        } else {
          d.firstSelected = true;
          d.lastSelected = true;
          d.descPos = "top";
          d.desc =
            d.timeStamp == this.selectedDays[0].timeStamp
              ? LanguageHelper.getRoundTripTip()
              : TripType.checkIn || TripType.checkOut
                ? LanguageHelper.getCheckInOutTip()
                : LanguageHelper.getReturnTripTip();
          this.selectedDays.push(d);
        }
      } else {
        d.firstSelected = true;
        d.lastSelected = true;
        d.descPos = "top";
        if (this.tripType == TripType.returnTrip) {
          d.desc = LanguageHelper.getReturnTripTip();
          d.hasToolTip = false;
          d.toolTipMsg = null;
        }
        if (this.tripType == TripType.departureTrip) {
          d.desc = LanguageHelper.getDepartureTip();
          d.hasToolTip = true;
          d.toolTipMsg = LanguageHelper.getSelectFlyBackDate();
        }
        if (this.tripType == TripType.checkIn) {
          d.desc = LanguageHelper.getCheckInTip();
          d.hasToolTip = true;
          d.toolTipMsg = LanguageHelper.getSelectCheckOutDate();
        }
        if (this.tripType == TripType.checkOut) {
          d.desc = LanguageHelper.getCheckOutTip();
          d.hasToolTip = true;
          // d.toolTipMsg = LanguageHelper.getc();
        }
        this.selectedDays = [d];
      }
    } else {
      d.firstSelected = true;
      d.lastSelected = true;
      d.descPos = "top";
      d.desc = LanguageHelper.getDepartureTip();
      if (this.tripType == TripType.returnTrip) {
        d.desc = LanguageHelper.getReturnTripTip();
        d.hasToolTip = false;
        d.toolTipMsg = null;
      }
      if (this.tripType == TripType.checkOut) {
        d.desc = LanguageHelper.getCheckOutTip();
        d.hasToolTip = false;
        d.toolTipMsg = null;
      }
      this.selectedDays = [d];
    }
    this.yms.map(item => {
      item.dayList.forEach(dt => {
        dt.selected = this.isMulti
          ? this.selectedDays.some(it => it.date === dt.date)
          : dt.date === d.date;
        dt.lastSelected = false;
        dt.firstSelected = false;
        if (!dt.selected) {
          dt.desc = null;
          dt.descColor = null;
          dt.descPos = null;
          dt.hasToolTip = false;
          dt.toolTipMsg = null;
        }
      });
    });
    if (!this.isMulti) {
      if (
        this.tripType == TripType.checkIn ||
        this.tripType == TripType.checkOut
      ) {
        this.selectedDays[0].desc =
          this.tripType == TripType.checkIn
            ? LanguageHelper.getCheckInTip()
            : LanguageHelper.getCheckOutTip();
      }
      if (
        this.tripType == TripType.departureTrip ||
        this.tripType == TripType.returnTrip
      ) {
        this.selectedDays[0].desc =
          this.tripType == TripType.departureTrip
            ? LanguageHelper.getDepartureTip()
            : LanguageHelper.getReturnTripTip();
      }
      setTimeout(() => {
        this.cancel();
      }, this.delayBackTime);
    } else {
      if (this.selectedDays.length === 2) {
        if (
          this.tripType == TripType.checkIn ||
          this.tripType == TripType.checkOut
        ) {
          this.selectedDays[0].desc = LanguageHelper.getCheckInTip();
          this.selectedDays[1].desc = LanguageHelper.getCheckOutTip();
          this.selectedDays[1].hasToolTip = true;
          this.selectedDays[1].toolTipMsg = LanguageHelper.getCheckInOutTotalDaysTip(
            Math.abs(moment(this.selectedDays[1].date).diff(
              moment(this.selectedDays[0].date), 'days'))
          );
          if (
            this.selectedDays[0].timeStamp == this.selectedDays[1].timeStamp
          ) {
            console.log("选择了同一天");
            this.selectedDays[0].desc = LanguageHelper.getCheckInOutTip();
          }
        }
        if (
          this.tripType == TripType.departureTrip ||
          this.tripType == TripType.returnTrip
        ) {
          this.selectedDays[0].desc = LanguageHelper.getDepartureTip();
          this.selectedDays[1].desc = LanguageHelper.getReturnTripTip();
          if (
            this.selectedDays[0].timeStamp == this.selectedDays[1].timeStamp
          ) {
            this.selectedDays[0].desc = LanguageHelper.getRoundTripTip();
          }
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
                ym.dayList.forEach(it => {
                  it.isBetweenDays = it.timeStamp > first.timeStamp && it.timeStamp < last.timeStamp;
                  if (it.isBetweenDays) {
                    it.selected = true;
                  }
                })
              })
            }
          }
        }
        setTimeout(() => {
          this.cancel();
        }, this.delayBackTime);
      }
    }
  }
}
