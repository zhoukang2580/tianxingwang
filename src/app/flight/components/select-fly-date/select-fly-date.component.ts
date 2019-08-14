import { ModalController } from "@ionic/angular";
import { FlightService } from "src/app/flight/flight.service";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import * as moment from "moment";
import { LanguageHelper } from "src/app/languageHelper";
import { DayModel } from "../../../tmc/models/DayModel";
import { AvailableDate } from "../../../tmc/models/AvailableDate";
import { CalendarService } from "../../../tmc/calendar.service";
import { AppHelper } from "src/app/appHelper";
import {
  trigger,
  state,
  style,
  animate,
  transition
} from "@angular/animations";
import { TripType } from "src/app/tmc/models/TripType";
@Component({
  selector: "app-select-fly-date-comp",
  templateUrl: "./select-fly-date.component.html",
  styleUrls: ["./select-fly-date.component.scss"],
  animations: [
    trigger("openclose", [
      state("true", style({ transform: "scale(1)" })),
      state("false", style({ transform: "scale(0)" })),
      transition("true<=>false", animate("300ms ease-in-out"))
    ])
  ]
})
export class SelectFlyDateComponent implements OnInit, OnDestroy {
  constructor(
    private calendarService: CalendarService,
    private modalCtrl: ModalController
  ) {}
  yms: AvailableDate[];
  private _selectedDays: DayModel[] = [];
  private timeoutId: any;
  private tripType: TripType;
  private curSelectedYear: string;
  private curSelectedMonth: number;
  private goFlightArrivalTime: string;
  set selectedDays(days: DayModel[]) {
    this._selectedDays = days;
    setTimeout(() => {
      this._selectedDays.forEach(dt => {
        dt.firstSelected = true;
        dt.lastSelected = true;
      });
    }, 0);
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this._selectedDays.forEach(dt => {
        dt.firstSelected = true;
        dt.lastSelected = true;
        dt.hasToolTip = false;
        dt.toolTipMsg = null;
      });
    }, 1300);
  }
  get selectedDays() {
    return this._selectedDays;
  }
  isMulti: boolean; // 是否多选
  multiSub = Subscription.EMPTY;
  selectedSub = Subscription.EMPTY;
  delayBackTime = 200;
  ngOnDestroy() {
    this.multiSub.unsubscribe();
  }
  ngOnInit() {
    this.selectedDays = [];
    this.initCurYearMonthCalendar();
    this.checkYms();
  }
  initCurYearMonthCalendar() {
    this.curSelectedYear = new Date().getFullYear() + "";
    this.curSelectedMonth = new Date().getMonth() + 1;
    this.generateYearNthMonthCalendar();
  }
  checkYms() {
    if (this.yms && this.yms.length) {
      if (this.tripType == TripType.returnTrip) {
        if (this.goFlightArrivalTime) {
          const goDate = moment(this.goFlightArrivalTime);
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
        this.yms.forEach(day => {
          day.dayList.forEach(d => {
            d.enabled = d.timeStamp > today.timeStamp || d.date == today.date;
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
    this.yms = [
      this.calendarService.generateYearNthMonthCalendar(
        this.curSelectedYear,
        this.curSelectedMonth
      )
    ];
    this.checkYms();
  }
  async cancel() {
    this.calendarService.setSelectedDays(this.selectedDays);
    const m = await this.modalCtrl.getTop();
    if (m) {
      m.dismiss().catch(_ => {});
    }
  }
  onDaySelected(d: DayModel) {
    console.log(
      "onDaySelected",
      d,
      this.selectedDays.length,
      this.tripType,
      "this.isMulti",
      this.isMulti
    );
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
          d.desc = LanguageHelper.getDepartureTip();
          d.desc = LanguageHelper.getDepartureTip();
          d.hasToolTip = true;
          d.toolTipMsg = LanguageHelper.getSelectFlyBackDate();
          this.selectedDays = [d];
          // AppHelper.toast(LanguageHelper.getSelectFlyBackDate(), 1000, "top");
        } else {
          d.firstSelected = true;
          d.lastSelected = true;
          d.descPos = "top";
          d.desc =
            d.timeStamp == this.selectedDays[0].timeStamp
              ? LanguageHelper.getRoundTripTip()
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
        } else {
          d.desc = LanguageHelper.getDepartureTip();
          d.hasToolTip = true;
          d.toolTipMsg = LanguageHelper.getSelectFlyBackDate();
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
      this.selectedDays = [d];
    }
    this.yms.map(item => {
      item.dayList
        .forEach(dt => {
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
      setTimeout(() => {
        this.cancel();
      }, this.delayBackTime);
    } else {
      if (this.selectedDays.length === 2) {
        setTimeout(() => {
          this.cancel();
        }, this.delayBackTime);
      }
    }
  }
}
