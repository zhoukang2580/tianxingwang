import { Subscription } from 'rxjs';
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
import { PopoverController, IonSelect, IonInfiniteScroll } from "@ionic/angular";
import { DateSelectWheelPopoverComponent } from "../date-select-wheel-popover/date-select-wheel-popover.component";
@Component({
  selector: "app-calendar",
  templateUrl: "./calendar.component.html",
  styleUrls: ["./calendar.component.scss"]
})
export class CalendarComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  private subscription = Subscription.EMPTY;
  private page: { m: number; y: number };
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  weeks: string[];
  @ViewChild('yearSelectEle') yearSelectEle: IonSelect;
  @ViewChild('monthSelectEle') monthSelectEle: IonSelect;
  @Input() title: string;
  @Input() calendars: AvailableDate[];
  @Output() yearChange: EventEmitter<any>;
  @Output() monthChange: EventEmitter<any>;
  @Output() back: EventEmitter<any>;
  @Output() daySelected: EventEmitter<any>;
  year: number;
  month: number;
  months: { month: number; selected: boolean; }[];
  years: { year: number; selected: boolean; }[] = [];
  constructor(
    private calendarService: CalendarService,
    private popoverCtrl: PopoverController
  ) {
    this.back = new EventEmitter();
    this.daySelected = new EventEmitter();
    this.yearChange = new EventEmitter();
    this.monthChange = new EventEmitter();
  }
  ngOnDestroy() {
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
        }
      }
    }
  }
  loadMore() {
    let [y, m] = this.calendars[this.calendars.length - 1].yearMonth.split("-").map(it => +it);
    let result: AvailableDate[] = [];
    let nextM = m;
    this.page.m = m;
    this.page.y = y;
    for (let i = 1; i <= 3; i++) {
      nextM = ++nextM;
      if (nextM > 12) {
        y += 1;
        nextM = 1;
      }
      result.push(this.calendarService.generateYearNthMonthCalendar(
        y,
        nextM
      ))
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
  async ngOnInit() {
    this.calendarService.getSelectedDaysSource().subscribe(days => {
      if (days && days.length) {
        const cur = days[0];
        if (cur) {
          const y = +cur.date.substr(0, 4);
          const m = +cur.date.substr('yyyy-'.length, 2);
          this.initCurYM(y, m);
        } else {
          this.initCurYM();
        }
      } else {
        this.initCurYM();
      }
    })
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
  private initCurYM(y: number = new Date().getFullYear(), m: number = new Date().getMonth() + 1) {
    const curY = y;
    this.year = curY;
    const curM = m;
    this.month = curM;
    this.page = { y, m };
    this.months = new Array(12).fill(0).map((it, idx) => {
      const m = idx + 1;
      return {
        selected: m == curM,
        month: m
      }
    });
    this.years = new Array(10).fill(0).map((it, idx) => {
      return {
        selected: curY == curY + idx,
        year: curY + idx
      }
    });
    // console.log("years", this.years, 'months', this.months);
  }
  onNextMonth(n: number) {
    this.month += n;
    let yearChanged = false;
    if (this.month > 12) {
      this.month = 1;
      this.year = this.year + 1;
      yearChanged = true;
    }
    if (this.month < 1) {
      this.month = 12;
      this.year = this.year - 1;
      yearChanged = true;
    }
    if (this.year <= 1900) {
      this.year = 1900;
      this.month = 1;
      yearChanged = true;
    }
    this.onMonthChanged();
    if (yearChanged) {
      this.onYearChanged();
      this.onMonthChanged();
    }
  }
  onChangeYear() {
    if (this.yearSelectEle) {
      this.yearSelectEle.open();
    }
  }
  onChangeMonth() {
    if (this.monthSelectEle) {
      this.monthSelectEle.open();
    }
  }
  onYearChanged() {
    if (this.year) {
      this.yearChange.emit(this.year);
    }
  }
  onMonthChanged() {
    if (this.month) {
      this.monthChange.emit(this.month);
    }
  }
  ngAfterViewInit() { }
  private async showDateSelectWheel() {
    const p = await this.popoverCtrl.create({
      component: DateSelectWheelPopoverComponent,
      cssClass: "date-select-wheel",
      showBackdrop: true,
      translucent: false,
      backdropDismiss: false,
      animated: false,
      componentProps: {
        isShowDay: false
      }
    });
    p.present();
    const result = await p.onDidDismiss();
    if (result && result.data) {
      const data = result.data as { year: number; month: number; day: number };
      this.yearChange.emit(data.year);
      this.monthChange.emit(data.month);
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
  onDaySelected(day: DayModel) {
    this.calendars.forEach(c => {
      c.dayList.forEach(d => {
        d.selected = d.date == day.date;
      });
    });
    this.daySelected.emit(day);
  }
}
