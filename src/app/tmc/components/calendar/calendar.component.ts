import { FlightHotelTrainType } from "./../../tmc.service";
import { Subscription } from "rxjs";
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  AfterViewInit,
  ViewChild,
  OnDestroy,
  OnChanges,
  SimpleChanges
} from "@angular/core";
import { AvailableDate } from "../../models/AvailableDate";
import { CalendarService } from "../../calendar.service";
import { DayModel } from "../../models/DayModel";
import {
  PopoverController,
  IonSelect,
  IonInfiniteScroll,
  IonRefresher
} from "@ionic/angular";
import { DateSelectWheelPopoverComponent } from "../date-select-wheel-popover/date-select-wheel-popover.component";
@Component({
  selector: "app-calendar",
  templateUrl: "./calendar.component.html",
  styleUrls: ["./calendar.component.scss"]
})
export class CalendarComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  private subscription = Subscription.EMPTY;
  private page: { m: number; y: number };
  private destroyed = false;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  @ViewChild(IonRefresher) refresher: IonRefresher;
  weeks: string[];
  @Input() title: string;
  @Input() forType: FlightHotelTrainType;
  @Input() calendars: AvailableDate[];
  @Output() yearChange: EventEmitter<any>;
  @Output() monthChange: EventEmitter<any>;
  @Output() back: EventEmitter<any>;
  @Output() daySelected: EventEmitter<any>;
  year: number;
  month: number;
  months: { month: number; selected: boolean }[];
  years: { year: number; selected: boolean }[] = [];
  constructor(private calendarService: CalendarService) {
    this.back = new EventEmitter();
    this.daySelected = new EventEmitter();
    this.yearChange = new EventEmitter();
    this.monthChange = new EventEmitter();
  }
  clazz(day: DayModel) {
    if (!day) {
      return {};
    }
    return {
      active: day.selected,
      today: day.isToday,
      [`between-selected-days`]: day.isBetweenDays,
      [`first-selected-day`]: day.firstSelected,
      [`last-selected-day`]: day.lastSelected,
      [`last-month-day`]: day.isLastMonthDay,
      [`not-enabled`]: !day.enabled
    };
  }
  ngOnDestroy() {
    this.destroyed = true;
    this.subscription.unsubscribe();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.calendars && changes.calendars.currentValue) {
      const first = this.calendars[0];
      if (first) {
        const [y, m] = first.yearMonth.split("-");
        this.page = {
          y: +y,
          m: +m
        };
      }
    }
  }
  loadMore() {
    let [y, m] = this.calendars[this.calendars.length - 1].yearMonth
      .split("-")
      .map(it => +it);
    const result: AvailableDate[] = [];
    let nextM = m;
    this.page.m = m;
    this.page.y = y;
    for (let i = 1; i <= 1; i++) {
      nextM = ++nextM;
      if (nextM > 12) {
        y += 1;
        nextM = 1;
      }
      result.push(this.calendarService.generateYearNthMonthCalendar(y, nextM));
    }
    this.calendars = this.calendars.concat(result);
    if (this.scroller) {
      this.scroller.complete();
    }
  }
  cancel() {
    this.subscription.unsubscribe();
    this.back.emit();
  }
  onPreviousMonth() {
    if (this.calendars && this.calendars.length) {
      const [year, month] = this.calendars[0].yearMonth
        .split("-")
        .map(it => +it);
      const curM = new Date().getMonth() + 1;
      const curY = new Date().getFullYear();
      const months = Math.min(
        6,
        curY == year && curM > month ? curM - month : 1
      );
      if (months > 1) {
        for (let i = 1; i <= months; i++) {
          this.calendars.unshift(
            this.calendarService.generateYearNthMonthCalendar(year, month - i)
          );
        }
      } else {
        if (this.refresher) {
          this.refresher.disabled = true;
          let calendar = this.calendarService.generateYearNthMonthCalendar(
            year,
            month - 1
          );
          if (month - 1 <= 0) {
            calendar = this.calendarService.generateYearNthMonthCalendar(
              year - 1,
              12
            );
          }
          this.calendars.unshift(calendar);
        }
      }
      if (this.refresher) {
        this.refresher.disabled = true;
      }
    }
    if (this.refresher) {
      this.refresher.complete();
    }
  }
  async ngOnInit() {
    this.calendarService.getSelectedDaysSource().subscribe(days => {
      if (this.destroyed) {
        return;
      }
      if (days && days.length) {
        const cur = days[0];
        if (cur) {
          const y = +cur.date.substr(0, 4);
          const m = +cur.date.substr("yyyy-".length, 2);
          this.initCurYM(y, m);
        } else {
          this.initCurYM();
        }
      } else {
        this.initCurYM();
      }
    });
    if (this.calendars && this.calendars.length) {
      const c = this.calendars[0];
      const y = +c.yearMonth.substr(0, 4);
      const m = +c.yearMonth.substr(5, 2);
      if (y && m) {
        this.initCurYM(y, m);
      }
    } else {
      this.initCurYM();
    }
    const w = this.calendarService.getDayOfWeekNames();
    this.weeks = Object.keys(w).map(k => w[k]);
    // this.calendars = await this.calendarService.generateCanlender(12);
  }
  private initCurYM(
    y: number = new Date().getFullYear(),
    m: number = new Date().getMonth() + 1
  ) {
    const curY = y;
    this.year = curY;
    const curM = m;
    this.month = curM;
    this.page = { y, m };
    this.months = new Array(12).fill(0).map((it, idx) => {
      const m1 = idx + 1;
      return {
        selected: m1 == curM,
        month: m1
      };
    });
    this.years = new Array(10).fill(0).map((it, idx) => {
      return {
        selected: curY == curY + idx,
        year: curY + idx
      };
    });
  }
  ngAfterViewInit() {
    if (this.forType == FlightHotelTrainType.Train) {
      if (this.scroller) {
        this.scroller.disabled = true;
      }
    }
  }
  onDaySelected(day: DayModel) {
    this.calendars.forEach(c => {
      if (c.dayList) {
        c.dayList.forEach(d => {
          d.selected = d.date == day.date;
        });
      }
    });
    this.daySelected.emit(day);
  }
}
