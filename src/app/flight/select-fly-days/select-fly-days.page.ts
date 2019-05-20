import { FlydayService } from "./flyday.service";
import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import * as moment from "moment";
import { AvailableDate } from '../models/AvailableDate';
import { DayModel } from '../models/DayModel';
@Component({
  selector: "app-select-fly-days",
  templateUrl: "./select-fly-days.page.html",
  styleUrls: ["./select-fly-days.page.scss"]
})
export class SelectFlyDaysPage implements OnInit,OnDestroy {
  wks: { week: string; color?: string }[] = [
    {
      week: "日",
      color: "primary"
    },
    {
      week: "一"
    },
    {
      week: "二"
    },
    {
      week: "三"
    },
    {
      week: "四"
    },
    {
      week: "五"
    },
    {
      week: "六",
      color: "primary"
    }
  ];
  constructor(private flydSer: FlydayService) {}
  yms: AvailableDate[];
  selectedDays: DayModel[];
  dayInfo1: any;
  dayInfo2: any;
  multi:boolean;// 是否多选
  multiSub=Subscription.EMPTY;
  selectedSub = Subscription.EMPTY;
  @Input()
  isRoundTrip: boolean;
  ngOnDestroy(){
    this.multiSub.unsubscribe();
  }
  ngOnInit() {
    this.multiSub=this.flydSer.getFlyDayMulti().subscribe(multi=>{
      this.multi=multi;
      if(multi){
        this.dayInfo1 = {
          hasToolTip: true,
          toolTipMsg: "请选择返程日期",
          desc: "返程",
          descPos: "bottom",
          color: "light"
        };
        this.dayInfo2 = {
          hasToolTip: true,
          toolTipMsg: "",
          desc: "返程",
          descPos: "bottom",
          color: "light"
        };
      }
    });
    this.selectedSub = this.flydSer.getSelectedFlyDays().subscribe(sDays => {
      this.selectedDays = sDays;
    });
    this.isRoundTrip=this.multi;
    this.yms = this.flydSer.generateCanlender(3);
    // setTimeout(() => {
    //   this.yms=this.yms.concat(this.flydSer.generateCanlender(3).slice(2));
    //   this.initialSeletedDaysView();
    // }, 1000);
  }
  displayYm(ym: string) {
    return moment(ym, "YYYY-MM-DD").format("YYYY年M月");
  }
  cancel() {
    this.flydSer.setSelectedFlyDays(this.selectedDays);
    this.flydSer.setShowFlyDaySelectPage(false);
  }
  onDaySelected(d: DayModel) {
    if(!d.enabled){
      return ;
    }
    d.selected=true;
    d.desc="去程";
    d.descPos='top';
    d.descColor='light';
    d.firstSelected=true;
    d.lastSelected=true;
    this.yms.map(item=>{
      item.dayList.forEach(dt=>{
        if(dt.date!==d.date){
          dt.selected=false;
          dt.lastSelected=false;
          dt.firstSelected=false;
          dt.desc=null;
          dt.descColor=null;
          dt.descPos=null;
        }
      })
    });
    this.selectedDays=[d];
    setTimeout(() => {
      this.cancel();
    }, 100);
  }
  initialSeletedDaysView() {
    if (!this.isRoundTrip && this.selectedDays.length > 1) {
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
        toolTipMsg: first.toolTipMsg || "请选择返程日期",
        desc: first.desc || "返程",
        descPos: first.descPos || "bottom",
        color: first.descColor || "light"
      };
      let last = this.selectedDays[this.selectedDays.length - 1];
      this.dayInfo2 = {
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
