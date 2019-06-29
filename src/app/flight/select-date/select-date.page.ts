import { ActivatedRoute } from "@angular/router";
import { LanguageHelper } from "src/app/languageHelper";
import { Observable, of, Subscription, BehaviorSubject } from "rxjs";
import {
  Component,
  OnInit,
  AfterContentInit,
  OnDestroy,
  AfterViewInit,
  NgZone
} from "@angular/core";
import * as moment from "moment";
import { SelectDateService } from "./select-date.service";
import { ModalController, NavController } from "@ionic/angular";
import { DayModel } from "../models/DayModel";
import { environment } from "../../../environments/environment";
@Component({
  selector: "app-select-date",
  templateUrl: "./select-date.page.html",
  styleUrls: ["./select-date.page.scss"]
})
export class SelectDatetimePage
  implements OnInit, AfterContentInit, OnDestroy, AfterViewInit {
  private titleSub = Subscription.EMPTY;
  private selectDaysSub = Subscription.EMPTY;
  calendars: {
    disabled: boolean; // 是否禁用
    yearMonth: string; // 2018-09
    dayList: DayModel[];
  }[];
  title: string;
  type: "酒店" | "机票";
  dayInfo1: {
    // 用来记录刚刚进来时候，要显示的一些信息
    desc: string;
    descPos: "top" | "bottom";
    color: any;
    toolTipMsg: string;
    hasToolTip: boolean;
  };
  dayInfo2: {
    toolTipMsg: string;
    hasToolTip: boolean;
    desc: string;
    descPos: "top" | "bottom";
    color: any;
  };
  weeks = [
    { text: LanguageHelper.getSaturdayTip(), color: "warning" },
    { text: LanguageHelper.getMondayTip(), color: "dark" },
    { text: LanguageHelper.getTuesdayTip(), color: "dark" },
    { text: LanguageHelper.getWednesdayTip(), color: "dark" },
    { text: LanguageHelper.getThursdayTip(), color: "dark" },
    { text: LanguageHelper.getFridayTip(), color: "dark" },
    { text: LanguageHelper.getSaturdayTip(), color: "warning" }
  ];
  dayOfWeekNames = {
    0: LanguageHelper.getSaturdayTip(),
    1: LanguageHelper.getMondayTip(),
    2: LanguageHelper.getTuesdayTip(),
    3: LanguageHelper.getWednesdayTip(),
    4: LanguageHelper.getThursdayTip(),
    5: LanguageHelper.getFridayTip(),
    6: LanguageHelper.getSaturdayTip()
  };
  mutiSelect = true; // 是否多选
  selectedDays: DayModel[] = [];
  canSelectSameDay: boolean; // 是否可以选择两天同一天
  unit = "晚"; // 显示的 xxx 晚
  availableDate: {
    disabled: boolean; // 是否禁用
    yearMonth: string; // 2018-09
    dayList: DayModel[];
  }[] = [];
  userSelected: boolean; // 是否是初始化还是用户做出了选择
  constructor(
    private modalCtrl: ModalController,
    private dayService: SelectDateService, // private ngZone: NgZone
    route: ActivatedRoute,
    private navCtrl: NavController
  ) {
    this.calendars = [];
    route.queryParamMap.subscribe(p => {
      if (p.get("dayInfo1")) {
        this.dayInfo1 = JSON.parse(p.get("dayInfo1"));
      }
      if (p.get("dayInfo2")) {
        this.dayInfo2 = JSON.parse(p.get("dayInfo2"));
      }
      if (p.get("title")) {
        this.title = p.get("title");
      }
    });
  }
  ngOnInit() {
    if (!this.title) {
      this.title = "选择入住日期";
    }
    this.dayInfo1 = {
      hasToolTip: true,
      toolTipMsg: "请选择离店日期",
      desc: "入住",
      descPos: "bottom",
      color: "light"
    };
    this.dayInfo2 = {
      hasToolTip: true,
      toolTipMsg: "",
      desc: "离店",
      descPos: "bottom",
      color: "light"
    };
    // this.dayService.getSelectedDays().subscribe(days => {
    //   console.log("初始化的days", days);
    //   if (days.length > 0) {
    //     this.selectedDays = days;
    //   }
    // });
    // this.dayService.getTitle().subscribe(title => {
    //   this.title = title;
    // });
    console.log("window.performance.now", window.performance.now());
    let startTime = Date.now();
    this.generateCalendar();
    if (!environment.production) {
      console.log("生成日历耗时：" + (Date.now() - startTime) + " ms");
    }
    startTime = Date.now();
    this.initialSeletedDaysView();
    if (!environment.production) {
      console.log(
        "初始化后，",
        this.selectedDays,
        "耗时" + (Date.now() - startTime) + " ms"
      );
    }
    this.calendars = this.availableDate;
  }
  ngAfterContentInit() {
    console.log("ngAfterContentInit");
  }
  initialSeletedDaysView() {
    if (!this.mutiSelect && this.selectedDays.length > 1) {
      this.selectedDays = [this.selectedDays[0]];
    }
    const validDays = this.selectedDays.filter(item => !!item.date);
    // console.log("validDays", validDays, this.selectedDays);
    if (validDays.length === 0) {
      this.selectedDays = [];
    } else {
      let first = this.selectedDays[0];
      this.dayInfo1 = {
        hasToolTip: first.hasToolTip,
        toolTipMsg: first.toolTipMsg || "请选择离店日期",
        desc: first.desc || "入住",
        descPos: first.descPos || "bottom",
        color: first.descColor || "light"
      };
      let last = this.selectedDays[this.selectedDays.length - 1];
      this.dayInfo2 = {
        hasToolTip: last.hasToolTip,
        toolTipMsg: "",
        desc: last.desc || "离店",
        descPos: last.descPos || "bottom",
        color: last.descColor || "light"
      };
      if (this.selectedDays.length > 1) {
        // console.log(first, last);
        if (first.date !== last.date) {
          // 两天不同
          let temp1;
          let temp2;
          this.availableDate.forEach(d => {
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
          this.availableDate.map(d =>
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
  generateCalendar() {
    this.availableDate = [];
    const curM = moment().month();
    let curWeek = moment().weekday(); // 0星期天 1~6 分别为星期一到星期六
    let m = 0;
    const loop = () => {
      // 将来六个月内的日历
      const nextMonth = curM + m; // 下一个月
      const curMoment = moment().add(m, "months"); // 递增每一个月份
      const daysOfM = moment(curMoment)
        .startOf("month")
        .date(1) // 每月的一号
        .add(1, "months") // 下个月的一号
        .subtract(1, "days") // 这个月的最后一天
        .date(); // 最后一天是几，代表这个月有几天
      // console.log("curMoment", curMoment.format("YYYY-MM-DD"));
      const dayList: DayModel[] = [];
      // 计算每个月的第一天是星期几，然后移动位置
      const curMFistDate = moment(curMoment)
        .startOf("month")
        .date(1);
      // console.log("curMoment", curMoment.format("YYYY-MM-DD"));
      curWeek = curMFistDate.weekday();
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
          dayList.unshift({
            date: date.format("YYYY-MM-DD"), // 2018-09-16
            day: date.date() + "",
            enabled: Math.floor(+date / 1000) >= Math.floor(+moment() / 1000),
            color: "medium",
            isLastMonthDay: true,
            timeStamp: Math.floor(+date / 1000),
            toolTipPos: "center",
            dayOfWeekName: this.dayOfWeekNames[date.weekday()]
          });
        }
        // console.log(dayList);
      }
      // console.log("curMoment", curMoment.format("YYYY-MM-DD"));
      const tempCurM = moment(curMoment);
      for (let d = 1; d <= daysOfM; d++) {
        // 每个月的每一天
        const date = tempCurM.date(d); // 每个月的每一天日期
        dayList.push({
          day: date.date() + "",
          date: date.format("YYYY-MM-DD"),
          enabled: Math.floor(+date / 1000) >= Math.floor(+moment() / 1000),
          timeStamp: Math.floor(+date / 1000),
          toolTipPos: "center",
          dayOfWeekName: this.dayOfWeekNames[date.weekday()]
        });
        // console.log(nextMonth, date);
      }
      this.availableDate.push({
        disabled: false,
        yearMonth:
          curMoment.year() +
          "-" +
          (nextMonth < 12 ? nextMonth + 1 : nextMonth - 11), // 2018-9
        dayList
      });
      if (++m < 6) {
        window.requestAnimationFrame(loop);
      }
    };
    loop();
  }
  onDaySelected(selectedDay: DayModel) {
    // 注意，该方法不要在程序中调用，需要由用户点击选择触发
    selectedDay.selected = true; // 直接将这一天选中
    // selectedDay.color = "light";
    if (!this.mutiSelect) {
      // 如果是用户做出了选择，且单选
      // 单选，直接返回
      selectedDay.firstSelected = true;
      selectedDay.lastSelected = true;
      selectedDay.isBetweenDays = false;
      selectedDay.desc = this.dayInfo1.desc;
      selectedDay.descPos = this.dayInfo1.descPos;
      this.selectedDays = [selectedDay];
      this.goback(1000);
      return;
    }
    // 多选
    if (this.selectedDays.length === 0) {
      // 尚未选择任何日期
      selectedDay.selected = true;
      selectedDay.hasToolTip = this.dayInfo1.hasToolTip;
      selectedDay.toolTipMsg = this.dayInfo1.toolTipMsg || "请选择离店日期";
      selectedDay.firstSelected = true;
      selectedDay.desc = this.dayInfo1.desc || "入住";
      selectedDay.descPos = this.dayInfo1.descPos || "bottom";
      selectedDay.descColor = this.dayInfo1.color || "light";
      this.selectedDays = [selectedDay];
      setTimeout(() => {
        selectedDay.hasToolTip = false;
      }, 3500);
      this.userSelected = true; // 注意到，改方法是由用户触发的
    } else {
      const exist = this.selectedDays[0];
      if (
        this.canSelectSameDay &&
        exist.date === selectedDay.date &&
        this.userSelected
      ) {
        // 可以选择同一天且是用户做出的选择(而非初始化)
        exist.firstSelected = true;
        exist.lastSelected = true;
        exist.isBetweenDays = false;
        exist.desc = `${this.dayInfo1.desc}+${this.dayInfo2.desc}`;
        exist.descPos = "top";
        this.goback(1000);
        // if(!environment.production){console.log("用户选择了同一天")};
        this.userSelected = true;
        return;
      }
      if (!this.userSelected) {
        // 用户第一次点击某一天
        this.selectedDays = [];
        this.availableDate.map(d => {
          d.dayList.map(day => {
            day.selected = false;
            day.isBetweenDays = false;
            day.desc = null;
            day.firstSelected = false;
            day.lastSelected = false;
          });
        });
        selectedDay.selected = true;
        selectedDay.hasToolTip = this.dayInfo1.hasToolTip;
        selectedDay.toolTipMsg = this.dayInfo1.toolTipMsg || "请选择离店日期";
        selectedDay.firstSelected = true;
        selectedDay.desc = this.dayInfo1.desc || "入住";
        selectedDay.descPos = this.dayInfo1.descPos || "bottom";
        selectedDay.descColor = this.dayInfo1.color || "light";
        this.selectedDays = [selectedDay];
        setTimeout(() => {
          selectedDay.hasToolTip = false;
        }, 3500);
        this.userSelected = true;
        return;
      }
      this.selectedDays = this.selectedDays.sort(
        (d1, d2) => d1.timeStamp - d2.timeStamp
      );
      // console.log(this.selectedDays.map(ld => ld.date));
      const sd = this.selectedDays[0]; // 已经选择的第一天
      if (sd.date === selectedDay.date) {
        if (!this.canSelectSameDay) {
          // 如果不能选择同一天
          //  if(!environment.production) {console.log("用户选择了同一天，但是，此时不能选择同一天")};
          // 如果一直选择同一天
          selectedDay.hasToolTip = this.dayInfo1.hasToolTip;
          selectedDay.toolTipMsg = this.dayInfo1.toolTipMsg;
          setTimeout(() => {
            selectedDay.hasToolTip = false;
          }, 2000);
          return;
        }
        // 可以选择同一天且是用户做出的选择(而非初始化)
        exist.firstSelected = true;
        exist.lastSelected = true;
        exist.isBetweenDays = false;
        exist.desc = `${this.dayInfo1.desc}+${this.dayInfo2.desc}`;
        exist.descPos = "top";
        this.goback(1000);
        // if(!environment.production){console.log("用户选择了同一天");}
        this.userSelected = true;
      } else {
        // 选择了不同的两天
        // console.log("选择了不同两天", this.userSelected);
        if (selectedDay.timeStamp < sd.timeStamp) {
          // 如果选的第二天比第一天早，第二天做第一天
          selectedDay.selected = true;
          selectedDay.hasToolTip = this.dayInfo1.hasToolTip;
          selectedDay.toolTipMsg = this.dayInfo1.toolTipMsg || "请选择离店日期";
          selectedDay.firstSelected = true;
          selectedDay.desc = this.dayInfo1.desc || "入住";
          selectedDay.descPos = this.dayInfo1.descPos || "bottom";
          selectedDay.descColor = this.dayInfo1.color || "light";
          this.selectedDays = [selectedDay];
          setTimeout(() => {
            selectedDay.hasToolTip = false;
          }, 3500);
          sd.selected = false;
          sd.firstSelected = false;
          sd.lastSelected = false;
          sd.hasToolTip = false;
          sd.desc = null;
          this.userSelected = true;
          return;
        }
        // console.log("前:", this.selectedDays);
        this.availableDate.map(d =>
          d.dayList.map(day => {
            if (
              day.timeStamp > sd.timeStamp &&
              day.timeStamp < selectedDay.timeStamp &&
              day.enabled
            ) {
              day.isBetweenDays = true;
              day.selected = true;
              this.selectedDays.push(day);
            } else {
              day.firstSelected = false;
              day.lastSelected = false;
              day.isBetweenDays = false;
              day.selected = false;
              this.selectedDays = this.selectedDays.filter(
                item => item.date !== day.date
              );
            }
          })
        );
        sd.firstSelected = true;
        sd.selected = true;
        sd.lastSelected = false;
        selectedDay.firstSelected = false;
        selectedDay.selected = true;
        selectedDay.lastSelected = true;
        selectedDay.hasToolTip = this.dayInfo2.hasToolTip;
        selectedDay.desc = this.dayInfo2.desc || "离店";
        selectedDay.descColor = this.dayInfo2.color || "light";
        selectedDay.descPos = this.dayInfo2.descPos || "bottom";
        this.selectedDays.unshift(sd); // 因为上面的filter操作将sd过滤掉了
        this.selectedDays.push(selectedDay);
        selectedDay.toolTipMsg = `共 ${this.selectedDays.length - 1} ${
          this.unit
        }`; // 离店那天不算
        this.goback();
      }
    }

    // console.log(this.selectedDays);
  }
  goback(duration = 500) {
    this.selectedDays = this.selectedDays.sort(
      (d1, d2) => d1.timeStamp - d2.timeStamp
    );
    this.dayService.setSelectedDays(this.selectedDays);
    setTimeout(() => {
      this.navCtrl.back();
    }, duration);
  }
  ngOnDestroy() {
    // console.log("destroyed");
    this.selectDaysSub.unsubscribe();
    this.titleSub.unsubscribe();
  }
  ngAfterViewInit() {
    // console.log("ngAfterViewInit");
  }
}
