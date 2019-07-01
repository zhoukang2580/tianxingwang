import { AppHelper } from "./../../appHelper";
import { NavController } from "@ionic/angular";
import { FlydayService } from "./flyday.service";
import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import * as moment from "moment";
import { AvailableDate } from "../models/AvailableDate";
import { DayModel } from "../models/DayModel";
import { LanguageHelper } from "src/app/languageHelper";
@Component({
  selector: "app-select-fly-days",
  templateUrl: "./select-fly-days.page.html",
  styleUrls: ["./select-fly-days.page.scss"]
})
export class SelectFlyDaysPage implements OnInit, OnDestroy {
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
    private flydService: FlydayService,
    private navCtrl: NavController
  ) {}
  yms: AvailableDate[];
  fakeItems: {
    dayList: any[];
  }[];
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
    this.fakeItems = [
      {
        dayList: new Array(35).fill(0)
      },
      {
        dayList: new Array(35).fill(0)
      },
      {
        dayList: new Array(35).fill(0)
      }
    ];
    this.multiSub = this.flydService.getFlyDayMulti().subscribe(multi => {
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
    this.yms = this.flydService.generateCanlender(3);
  }
  displayYm(ym: string) {
    return moment(ym, "YYYY-MM-DD").format(
      `YYYY${LanguageHelper.getYearTip()}M${LanguageHelper.getMonthTip()}`
    );
  }
  cancel() {
    this.flydService.setSelectedFlyDays(this.selectedDays);
    this.navCtrl.back();
  }
  onDaySelected(d: DayModel) {
    console.log("onDaySelected", d);
    if (!d.enabled) {
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
        .filter(itm => !this.selectedDays.some(it => it.date === itm.date))
        .forEach(dt => {
          dt.selected = false;
          dt.lastSelected = false;
          dt.firstSelected = false;
          dt.desc = null;
          dt.descColor = null;
          dt.descPos = null;
        });
    });
    if (!this.isMulti) {
      setTimeout(() => {
        this.cancel();
      }, 300);
    } else {
      if (this.selectedDays.length == 1) {
        AppHelper.toast(LanguageHelper.getSelectFlyBackDate(), 1400, "top");
      }
      if (this.selectedDays.length == 2) {
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
        toolTipMsg: first.toolTipMsg || "请选择返程日期",
        desc: first.desc || "返程",
        descPos: first.descPos || "bottom",
        color: first.descColor || "light"
      };
      let last = this.selectedDays[this.selectedDays.length - 1];
      this.dayInfo1 = {
        hasToolTip: last.hasToolTip,
        toolTipMsg: "",
        desc: last.desc || "去程",
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
