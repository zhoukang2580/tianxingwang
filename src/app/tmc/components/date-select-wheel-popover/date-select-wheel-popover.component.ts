import { PopoverController } from "@ionic/angular";
import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  HostBinding
} from "@angular/core";
import * as moment from "moment";
import { ScrollWheelItem } from "../select-wheel/select-wheel.component";

@Component({
  selector: "app-date-select-wheel-popover",
  templateUrl: "./date-select-wheel-popover.component.html",
  styleUrls: ["./date-select-wheel-popover.component.scss"]
})
export class DateSelectWheelPopoverComponent implements OnInit, AfterViewInit {

  isShowDay = true;
  years: ScrollWheelItem[];
  months: ScrollWheelItem[];
  days: ScrollWheelItem[];
  curSelectedYear: number;
  isShowTodayButton = true;
  private _curSelectedMonth: number;
  private _curSelectedDay: number;
  get curSelectedMonth() {
    return this._curSelectedMonth < 10
      ? `0${this._curSelectedMonth}`
      : this._curSelectedMonth;
  }
  get curSelectedDay() {
    return this._curSelectedDay < 10
      ? `0${this._curSelectedDay}`
      : this._curSelectedDay;
  }
  private ymd: { [ym: string]: ScrollWheelItem[] } = {};
  constructor(private popoverCtrl: PopoverController) {}
  async done() {
    const p = await this.popoverCtrl.getTop();
    if (p) {
      p.dismiss({
        year: this.curSelectedYear,
        month: this.curSelectedMonth,
        day: this.curSelectedDay
      });
    }
  }
  async cancel() {
    const p = await this.popoverCtrl.getTop();
    if (p) {
      p.dismiss();
    }
  }
  ngOnInit() {
    this.initYears();
    this.initMonths();
    this.initDays();
    this.isShowTodayButton = true;
  }
  private initDays() {
    const curD = new Date().getDate();
    const curY = new Date().getFullYear();
    const curM = new Date().getMonth() + 1;
    this.days = [];
    const m = moment(
      `${this.curSelectedYear}-${
        this._curSelectedMonth < 10
          ? "0" + this._curSelectedMonth
          : this._curSelectedMonth
      }-01`,
      "YYYY-MM-DD"
    );
    const ym = m.format("YYYY-MM");
    if (!this.ymd[ym]) {
      const days = moment(m)
        .add(1, "months")
        .startOf("month")
        .add(-1, "days")
        .date();
      for (let i = 1; i <= days; i++) {
        this.days.push({
          key: i,
          value: i,
          selected:
            i == curD &&
            +this.curSelectedMonth == curM &&
            this.curSelectedYear == curY
        });
      }
      this.days.push({ key: 0, value: 0, selected: false });
      this.days.unshift({ key: 0, value: 0, selected: false });
      const selected = this.days.find(it => it.selected);
      if (!selected) {
        const it = this.days[1];
        it.selected = true;
      }
      this.ymd[ym] = this.days;
    } else {
      this.days = this.ymd[ym];
      this.days.forEach(it => {
        it.selected =
          it.value == curD &&
          this._curSelectedMonth == curM &&
          this.curSelectedYear == curY;
      });
    }
    const selectedItem =
      this.days.find(it => it.selected) ||
      (this.days[0].value ? this.days[0] : this.days[1]);
    selectedItem.selected = true;
    this._curSelectedDay = selectedItem.value;
  }
  private initMonths() {
    const curMonth = new Date().getMonth() + 1;
    this._curSelectedMonth = curMonth;
    this.months = new Array(12).fill(0).map((_, idx) => {
      const value = idx + 1;
      return {
        key: value,
        value,
        selected: curMonth == value
      };
    });
    this.months.unshift({ key: 0, value: 0, selected: false });
    this.months.push({ key: 0, value: 0, selected: false });
  }
  private initYears() {
    const curYear = new Date().getFullYear();
    this.curSelectedYear = curYear;
    this.years = [];
    for (let i = 1900 - curYear; i < curYear + 100 - 1900; i++) {
      this.years.push({
        key: i + curYear,
        value: i + curYear,
        selected: i + curYear == curYear
      });
    }
    this.years.unshift({ key: 0, value: 0, selected: false });
    this.years.push({ key: 0, value: 0, selected: false });
  }
  backToToday() {
    const curY = new Date().getFullYear();
    const curM = new Date().getMonth() + 1;
    const curD = new Date().getDate();
    this.years.forEach(it => {
      it.selected = it.value == curY;
    });
    this.months.forEach(it => {
      it.selected = it.value == curM;
    });
    this.initDays();
    this.days.forEach(it => {
      it.selected = curD == it.value;
    });
    this.curSelectedYear = curY;
    this._curSelectedMonth = curM;
  }
  onYearChange(item: ScrollWheelItem) {
    this.curSelectedYear = item.value;
    this.initDays();
    this.isShowTodayButton = this.curSelectedYear != new Date().getFullYear();
  }
  onMonthChange(item: ScrollWheelItem) {
    this._curSelectedMonth = item.value;
    this.initDays();
    this.isShowTodayButton =
      this._curSelectedMonth != new Date().getMonth() + 1;
  }
  onDayChange(item: ScrollWheelItem) {
    this._curSelectedDay = item.value;
    this.isShowTodayButton = this._curSelectedDay != new Date().getDate();
  }
  ngAfterViewInit() {}
}
