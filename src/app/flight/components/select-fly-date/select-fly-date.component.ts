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
  wks: { week: string; color?: string }[] = [
    {
      week: LanguageHelper.getSundayTip(),
      color: "danger"
    },
    {
      week: LanguageHelper.getMondayTip()
    },
    {
      week: LanguageHelper.getTuesdayTip()
    },
    {
      week: LanguageHelper.getWednesdayTip()
    },
    {
      week: LanguageHelper.getThursdayTip()
    },
    {
      week: LanguageHelper.getFridayTip()
    },
    {
      week: LanguageHelper.getSaturdayTip(),
      color: "danger"
    }
  ];
  constructor(
    private calendarService: CalendarService,
    private flightService: FlightService
  ) {}
  yms: AvailableDate[];
  private _selectedDays: DayModel[] = [];
  timeoutId: any;
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
  dayInfo1: any;
  dayInfo2: any;
  isMulti: boolean; // 是否多选
  multiSub = Subscription.EMPTY;
  selectedSub = Subscription.EMPTY;
  delayBackTime = 200;
  ngOnDestroy() {
    this.multiSub.unsubscribe();
  }
  ngOnInit() {
    this.multiSub = this.calendarService.getFlyDayMulti().subscribe(multi => {
      this.selectedDays = [];
      this.isMulti = multi;
      if (multi) {
        this.dayInfo1 = {
          hasToolTip: true,
          toolTipMsg: LanguageHelper.getBackDateTip(),
          desc: LanguageHelper.getReturnTripTip(),
          descPos: "bottom",
          color: "light"
        };
        this.dayInfo2 = {
          hasToolTip: true,
          toolTipMsg: "",
          desc: LanguageHelper.getReturnTripTip(),
          descPos: "bottom",
          color: "light"
        };
      }
    });
    setTimeout(() => {
      this.yms = this.calendarService.generateCanlender(24);
    }, 5 * 1000);
    this.flightService.getSearchFlightModelSource().subscribe(s => {
      if (s) {
        if (s.tripType == TripType.returnTrip) {
          const goFlight = this.flightService
            .getPassengerBookInfos()
            .find(
              f =>
                f.flightSegmentInfo &&
                f.flightSegmentInfo.tripType == TripType.departureTrip
            );
          if (goFlight) {
            const goDate = moment(
              goFlight.flightSegmentInfo.flightSegment.ArrivalTime
            );
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
          if (this.yms && this.yms.length) {
            const today = this.calendarService.generateDayModel(moment());
            this.yms.forEach(day => {
              day.dayList.forEach(d => {
                d.enabled =
                  d.timeStamp > today.timeStamp || d.date == today.date;
              });
            });
          }
        }
      }
    });
  }
  displayYm(ym: string) {
    return moment(ym, "YYYY-MM-DD").format(
      `YYYY${LanguageHelper.getYearTip()}M${LanguageHelper.getMonthTip()}`
    );
  }
  cancel() {
    this.calendarService.setSelectedFlyDays(this.selectedDays);
    this.calendarService.showSelectFlyDatePage(false);
  }
  onDaySelected(d: DayModel) {
    console.log("onDaySelected", d,this.selectedDays.length);
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
        d.desc = LanguageHelper.getDepartureTip();
        d.hasToolTip = true;
        d.toolTipMsg = LanguageHelper.getSelectFlyBackDate();
        this.selectedDays = [d];
      }
    } else {
      d.firstSelected = true;
      d.lastSelected = true;
      d.descPos = "top";
      d.desc = LanguageHelper.getDepartureTip();
      this.selectedDays = [d];
    }
    this.yms.map(item => {
      item.dayList
        // .filter(itm => !this.selectedDays.some(it => it.date === itm.date))
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
      // if (this.selectedDays.length === 1) {
      //   AppHelper.toast(LanguageHelper.getSelectFlyBackDate(), 1400, "top");
      // }
      if (this.selectedDays.length === 2) {
        setTimeout(() => {
          this.cancel();
        }, this.delayBackTime);
      }
    }
  }
  getMonth(ym: string) {
    if (!ym) {
      return ym;
    }
    if (ym.includes("-")) {
      const [y, m] = ym.split("-");
      if (y && y.length == 4) {
        return +m;
      }
    }
    return ym || "";
  }
  initialSeletedDaysView() {
    if (!this.isMulti && this.selectedDays.length > 1) {
      this.selectedDays = [this.selectedDays[0]];
    }
    const validDays = this.selectedDays.filter(item => !!item.date);
    // console.log("validDays", validDays, this.selectedDays);
    if (validDays.length === 0) {
      this.selectedDays = [];
    } else {
      let first = this.selectedDays[0];
      this.dayInfo2 = {
        hasToolTip: first.hasToolTip,
        toolTipMsg: first.toolTipMsg || LanguageHelper.getSelectFlyBackDate(),
        desc: first.desc || LanguageHelper.getReturnTripTip(),
        descPos: first.descPos || "bottom",
        color: first.descColor || "light"
      };
      let last = this.selectedDays[this.selectedDays.length - 1];
      this.dayInfo1 = {
        hasToolTip: last.hasToolTip,
        toolTipMsg: "",
        desc: last.desc || LanguageHelper.getDepartureTip(),
        descPos: last.descPos || "bottom",
        color: last.descColor || "light"
      };
      if (this.selectedDays.length > 1) {
        // console.log(first, last);
        if (first.date !== last.date) {
          // 两天不同
          let temp1;
          let temp2;
          this.yms.forEach(d => {
            const f1 = d.dayList.find(item => item.date === first.date);
            const f2 = d.dayList.find(item => item.date === last.date);
            if (f1 && !temp1) {
              // 因为将每个月的上个月的日期也放进到日历里面，有重复的日期
              temp1 = f1;
            }
            if (f2 && !temp2) {
              temp2 = f2;
            }
            if (temp1 && temp2) {
              first = temp1;
              last = temp2;
            }
          });
          // console.log("页面上的：", temp1, temp2);
          first.timeStamp = Math.floor(
            +moment(first.date, "YYYY-MM-DD") / 1000
          );
          last.timeStamp = Math.floor(+moment(last.date, "YYYY-MM-DD") / 1000);
          this.selectedDays = [];
          this.yms.map(d =>
            d.dayList.map(day => {
              if (
                day.timeStamp > first.timeStamp &&
                day.timeStamp < last.timeStamp &&
                day.enabled
              ) {
                day.isBetweenDays = true;
                day.selected = true;
                this.selectedDays.push(day);
              } else {
                day.isBetweenDays = false;
                day.selected = false;
                day.firstSelected = false;
                day.lastSelected = false;
                day.desc = null;
                this.selectedDays = this.selectedDays.filter(
                  item => item.date !== day.date
                );
              }
            })
          );
          first.selected = true;
          first.firstSelected = true;
          first.lastSelected = false;
          first.isBetweenDays = false;
          first.desc = this.dayInfo1.desc;
          first.descColor = this.dayInfo1.color;
          first.descPos = this.dayInfo1.descPos;
          this.selectedDays.unshift(first);
          last.firstSelected = false;
          last.lastSelected = true;
          last.isBetweenDays = false;
          last.selected = true;
          last.desc = this.dayInfo2.desc;
          last.descColor = this.dayInfo2.color;
          last.descPos = this.dayInfo2.descPos;
          this.selectedDays.push(last);
        } else {
          // 两天相同
          this.selectedDays = [first];
          first.selected = true;
          first.firstSelected = true;
          first.lastSelected = true;
          first.isBetweenDays = false;
          first.desc = `${this.dayInfo1.desc}+${this.dayInfo2.desc}`;
          first.descColor = this.dayInfo1.color;
          first.descPos = this.dayInfo1.descPos;
        }
      } else {
        // 初始化时候，只有一个值
        this.selectedDays = [first];
        first.selected = true;
        first.firstSelected = true;
        first.lastSelected = true;
        first.isBetweenDays = false;
        first.desc = this.dayInfo1.desc;
        first.descColor = this.dayInfo1.color;
        first.descPos = this.dayInfo1.descPos;
      }
    }
  }
}
