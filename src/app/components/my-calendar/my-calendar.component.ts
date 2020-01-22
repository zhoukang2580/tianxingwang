import { Platform, IonContent, ModalController } from "@ionic/angular";
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ViewChildren,
  QueryList,
  Output,
  EventEmitter
} from "@angular/core";
import * as moment from "moment";
import { fromEvent, Subscription } from "rxjs";
@Component({
  selector: "app-my-calendar",
  templateUrl: "./my-calendar.component.html",
  styleUrls: ["./my-calendar.component.scss"]
})
export class MyCalendarComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() dateSelect: EventEmitter<IDay>;
  @Input() openAsModal: boolean;
  @Input() date: string;
  @ViewChild("years", { static: false }) yearsContainer: ElementRef<
    HTMLElement
  >;
  @ViewChildren("yearItems") yearItems: QueryList<ElementRef<HTMLElement>>;
  private subscriptions: Subscription[] = [];
  private totalYears = 260;
  private isDateSelected = false;
  @ViewChild(IonContent, { static: false }) content: IonContent;
  vmYears: IYear[];
  monthDates: IMonthDate[];
  weeks: IWeek[];
  constructor(private plt: Platform, private modalCtrl: ModalController) {
    this.dateSelect = new EventEmitter();
  }
  ngAfterViewInit() {
    const subscription = fromEvent(
      this.yearsContainer.nativeElement,
      "scroll"
    ).subscribe(evt => {
      // console.log(
      //   this.yearsContainer.nativeElement.scrollLeft,
      //   this.yearsContainer.nativeElement.scrollWidth
      // );
      // if (this.plt.width() / 2 > this.yearsContainer.nativeElement.scrollLeft) {
      //   this.onUnshifYears();
      // }
    });
    const subscription2 = this.yearItems.changes.subscribe(_ => {
      this.moveToCenter(false);
    });
    this.subscriptions.push(subscription);
    this.subscriptions.push(subscription2);
  }
  async back() {
    let date: IDay;
    console.time("back");
    this.monthDates.forEach(it =>
      it.days.forEach(d => {
        if (d.isActive) {
          date = d;
        }
      })
    );
    console.timeEnd("back");
    if (this.openAsModal) {
      const t = await this.modalCtrl.getTop();
      if (t) {
        this.isDateSelected = false;
        t.dismiss(date);
      }
    }
    this.dateSelect.emit(date);
  }
  ngOnInit() {
    this.monthDates = [];
    this.initWeeks();
    this.date = this.date || moment().format("YYYY-MM-DD");
    this.initVmYears();
  }
  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
  private initWeeks() {
    this.weeks = [];
    this.weeks.push({ label: "日", color: "danger" });
    this.weeks.push({ label: "一" });
    this.weeks.push({ label: "二" });
    this.weeks.push({ label: "三" });
    this.weeks.push({ label: "四" });
    this.weeks.push({ label: "五" });
    this.weeks.push({ label: "六", color: "danger" });
  }
  private initVmYears() {
    this.vmYears = [];
    if (this.date) {
      const [y, m] = this.date.split("-").map(it => +it);
      this.vmYears.push({ isActive: true, year: y });
      for (let i = 0; i < this.totalYears; i++) {
        const first = this.vmYears[0];
        const last = this.vmYears[this.vmYears.length - 1];
        if (i < this.totalYears / 2) {
          this.vmYears.unshift({ year: first.year - 1 });
        } else {
          this.vmYears.push({
            year: last.year + 1
          });
        }
      }
      this.onYearSelected(y, false);
    }
  }
  loadMoreYears() {
    let years: IYear[] = [];
    if (this.vmYears && this.vmYears.length) {
      const y = this.vmYears[this.vmYears.length - 1];
      if (y) {
        for (let i = 1; i <= this.totalYears; i++) {
          const o = {
            year: y.year + i
          };
          years.push(o);
        }
        this.vmYears = this.vmYears.concat(years);
      }
    }
    return years;
  }
  onUnshifYears() {
    const years: IYear[] = [];
    const y = this.vmYears && this.vmYears[0];
    if (y) {
      if (y.year < 1900) {
        return;
      }
      for (let i = 1; i <= this.totalYears; i++) {
        const o = {
          year: y.year - i
        };
        years.push(o);
        this.vmYears.unshift(o);
      }
    }
    return years;
  }
  private scrollToTop() {
    if (this.content) {
      this.content.scrollToTop(100);
    }
  }
  onYearSelected(year: number = moment().year(), byUser = false) {
    // this.scrollToTop();
    this.isDateSelected = false;
    year = year || moment().year();
    this.monthDates = [];
    const mds = this.monthDates;
    for (let i = 1; i <= 12; i++) {
      mds.push(this.generateNthMonthDays(year, i));
    }
    this.monthDates = mds;
    this.vmYears = this.vmYears.map(it => {
      it.isActive = it.year == year;
      return it;
    });
    // console.log(this.monthDates);
    this.moveToCenter(byUser);
  }
  private moveToCenter(isSmooth: boolean) {
    requestAnimationFrame(_ => {
      const y = this.vmYears.find(it => it.isActive);
      if (y) {
        if (this.yearsContainer && this.yearsContainer.nativeElement) {
          const el = this.yearsContainer.nativeElement.querySelector(
            `[dataid='${y.year}']`
          );
          const rect = el && el.getBoundingClientRect();
          if (rect) {
            const opt: ScrollToOptions = {
              left: rect.left + rect.width / 2 - this.plt.width() / 2
            };
            if (isSmooth) {
              opt.behavior = "smooth";
              this.yearsContainer.nativeElement.scrollBy(opt);
            } else {
              this.yearsContainer.nativeElement.scrollBy(opt.left, 0);
            }
          }
        }
      }
    });
  }
  onDateSelect(day: IDay) {
    if (this.isDateSelected) {
      return;
    }
    this.isDateSelected = true;
    if (this.monthDates && this.monthDates.length) {
      this.monthDates = this.monthDates.map(it => {
        if (it.days) {
          it.days = it.days.map(d => {
            d.isActive = d.date == day.date;
            return d;
          });
        }
        return it;
      });
    }
    setTimeout(() => {
      this.back();
    }, 200);
  }
  clazz(d: IDay) {
    return {
      "is-last-month-date": d.isLastMonthDate,
      active: d.isActive
    };
  }
  private generateNthMonthDays(year: number, m: number) {
    const cur = moment()
      .set("year", year)
      .set("month", m - 1);
    const count = cur
      .startOf("month")
      .add(1, "months")
      .subtract(1, "days")
      .date();
    const monthDate: IMonthDate = {
      month: `${m}`,
      days: [],
      year
    };
    const curMonth = m < 10 ? `0${m}` : m;
    const firstDateWd = moment(`${year}-${m}-01`, "YYYY-MM-DD").weekday();
    monthDate.days.push({
      date: `${year}-${m}-01`,
      day: 1,
      weekday: firstDateWd
    });
    for (let i = 1; i <= firstDateWd; i++) {
      const im = moment(monthDate.days[0].date, "YYYY-MM-DD").add(-1, "days");
      monthDate.days.unshift({
        date: im.format("YYYY-MM-DD"),
        day: im.date(),
        weekday: im.weekday(),
        isLastMonthDate: true
      });
    }
    for (let i = 2; i <= count; i++) {
      const date = `${year}-${curMonth}-` + (i < 10 ? `0${i}` : i);
      const im = moment(date, "YYYY-MM-DD");
      const wd = im.weekday();
      monthDate.days.push({
        date,
        day: im.date(),
        weekday: wd
      });
    }
    return monthDate;
  }
}
export interface IMonthDate {
  year: number;
  month: string;
  days: IDay[];
}
export interface IDay {
  disabled?: boolean;
  isActive?: boolean;
  date: string;
  isLastMonthDate?: boolean;
  weekday: number;
  day: number;
}
export interface IYear {
  isActive?: boolean;
  year: number;
}
export interface IWeek {
  color?: "primary" | "secondary" | "medium" | "danger";
  label: "日" | "一" | "二" | "三" | "四" | "五" | "六";
}
