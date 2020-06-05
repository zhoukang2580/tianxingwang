import { Component, OnInit, EventEmitter } from "@angular/core";
import { Input, Output } from "@angular/core";
import * as moment from "moment";
import { DayModel } from "../../models/DayModel";
@Component({
  selector: "app-day",
  templateUrl: "./day.component.html",
  styleUrls: ["./day.component.scss"],
})
export class DayComponent implements OnInit {
  bottomDesc: string;
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
    if (this.dayModel && this.dayModel.bottomDesc) {
      this.bottomDesc = this.dayModel.bottomDesc.includes("程")
        ? this.dayModel.lunarInfo && this.dayModel.lunarInfo.lunarDayName
        : this.dayModel.bottomDesc;
    }
    this.isToday();
  }
  private isToday() {
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
        : this.dayModel.enabled
        ? "warning"
        : "medium";
      // this.dayModel.dayoff = true;
    }
    if (week === 0) {
      this.dayModel.toolTipPos = "end";
    }
    if (week === 6) {
      this.dayModel.toolTipPos = "start";
    }
  }
  toggleSelected() {
    this.daySelected.emit(this.dayModel);
  }
}
