import { AppHelper } from "src/app/appHelper";
import { Component, OnInit, EventEmitter } from "@angular/core";
import { Input, Output } from "@angular/core";
import { DayModel } from "../../models/DayModel";
import * as moment from "moment";
import { LanguageHelper } from "src/app/languageHelper";
@Component({
  selector: "app-day",
  templateUrl: "./day.component.html",
  styleUrls: ["./day.component.scss"]
})
export class DayComponent implements OnInit {
  @Input()
  dayModel: DayModel;
  @Output()
  daySelected: EventEmitter<DayModel>;
  constructor() {
    this.daySelected = new EventEmitter();
  }
  ngOnInit() {
    if (!this.dayModel.enabled) {
      this.dayModel.color = this.dayModel.color || "medium";
    }
    this.isToday();
  }
  isToday() {
    const curDate = moment().format("YYYY-MM-DD");
    // console.log(curDate,this.dayModel.date);
    if (curDate === this.dayModel.date) {
      // this.dayModel.day = "今天";
      this.dayModel.color = this.dayModel.color || "light";
      // this.dayModel.selected = true;
      this.dayModel.isToday = true;
      // this.daySelected.emit(this.dayModel); // 选中今天
    }
    const week = moment(this.dayModel.date, "YYYY-MM-DD").weekday();
    this.dayModel.dayOfWeek = week;
    if (week === 6 || week === 0) {
      this.dayModel.color = this.dayModel.isToday
        ? this.dayModel.color || "light"
        : "warning";
      this.dayModel.dayoff = true;
    }
    if (week === 0) {
      this.dayModel.toolTipPos = "end";
    }
    if (week === 6) {
      this.dayModel.toolTipPos = "start";
    }
  }
  toggleSelected() {
    // console.log(this.dayModel);
    if (!this.dayModel.enabled) {
      AppHelper.toast(LanguageHelper.getSelectOtherFlyDayTip(), 1200, "middle");
      return;
    }
    this.dayModel.selected = !this.dayModel.selected;
    this.daySelected.emit(this.dayModel);
  }
}
