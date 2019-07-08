import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import * as moment from "moment";
import { LanguageHelper } from "src/app/languageHelper";
import { DayModel } from "../../models/DayModel";
import { AvailableDate } from "../../models/AvailableDate";
import { FlydayService } from "../../flyday.service";
import { AppHelper } from "src/app/appHelper";
import {
  trigger,
  state,
  style,
  animate,
  transition
} from "@angular/animations";
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
  constructor(private flyDayService: FlydayService) {}
  yms: AvailableDate[];
  selectedDays: DayModel[] = [];
  dayInfo1: any;
  dayInfo2: any;
  isMulti: boolean; // 是否多选
  multiSub = Subscription.EMPTY;
  selectedSub = Subscription.EMPTY;
  ngOnDestroy() {
    this.multiSub.unsubscribe();
  }
  getMonth(ym: string) {
    if (!ym) {
      return "";
    }
    return +ym.substring("2019-".length);
  }
  ngOnInit() {
    this.multiSub = this.flyDayService.getFlyDayMulti().subscribe(multi => {
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
      this.yms = this.flyDayService.generateCanlender(3);
    }, 8 * 1000);
  }
  displayYm(ym: string) {
    return moment(ym, "YYYY-MM-DD").format(
      `YYYY${LanguageHelper.getYearTip()}M${LanguageHelper.getMonthTip()}`
    );
  }
  cancel() {
    this.flyDayService.setSelectedFlyDays(this.selectedDays);
    this.flyDayService.showFlyDayPage(false);
  }
  onDaySelected(d: DayModel) {
    console.log("onDaySelected", d);
    if (!d.enabled) {
      AppHelper.toast(LanguageHelper.getSelectOtherFlyDayTip(), 1000, "middle");
      return;
    }
    d.selected = true;
    d.desc = LanguageHelper.getDepartureTip();
    d.descPos = "top";
    d.descColor = "light";
    d.firstSelected = true;
    d.lastSelected = true;
    if (this.isMulti && this.selectedDays.length) {
      if (d.timeStamp < this.selectedDays[0].timeStamp) {
        d.desc = LanguageHelper.getDepartureTip();
        this.selectedDays = [d];
        AppHelper.toast(LanguageHelper.getSelectFlyBackDate(), 1000, "top");
      } else {
        d.desc = LanguageHelper.getReturnTripTip();
        this.selectedDays.push(d);
      }
    } else {
      this.selectedDays.push(d);
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
          }
          dt.descColor = null;
          dt.descPos = null;
        });
    });
    if (!this.isMulti) {
      setTimeout(() => {
        this.cancel();
      }, 300);
    } else {
      if (this.selectedDays.length === 1) {
        AppHelper.toast(LanguageHelper.getSelectFlyBackDate(), 1400, "top");
      }
      if (this.selectedDays.length === 2) {
        setTimeout(() => {
          this.cancel();
        }, 300);
      }
    }
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
