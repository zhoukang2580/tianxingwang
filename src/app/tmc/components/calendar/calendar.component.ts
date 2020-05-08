import { DayComponent } from "./../day/day.component";
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
  SimpleChanges,
  ViewChildren,
  QueryList,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ComponentFactoryResolver,
  Injector,
  TemplateRef,
  ViewContainerRef,
} from "@angular/core";
import { AvailableDate } from "../../models/AvailableDate";
import { CalendarService } from "../../calendar.service";
import { DayModel } from "../../models/DayModel";
import {
  IonInfiniteScroll,
  IonRefresher,
  IonContent,
  Platform,
} from "@ionic/angular";
@Component({
  selector: "app-calendar",
  templateUrl: "./calendar.component.html",
  styleUrls: ["./calendar.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent2
  implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  private subscription = Subscription.EMPTY;
  private page: { m: number; y: number };
  private isSrollToCurYm = false;
  private st = Date.now();
  fakeays = new Array(30).fill(0);
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChild(IonContent, { static: true }) content: IonContent;
  weeks: string[];
  @Input() title: string;
  @Input() disableScroller = false;
  @Input() calendars: AvailableDate[];
  @Output() back: EventEmitter<any>;
  @Output() daySelected: EventEmitter<any>;
  @Input() scrollToMonth: string;
  constructor(
    private calendarService: CalendarService,
    private el: ElementRef<HTMLElement>,
    private plt: Platform,
    private cdref: ChangeDetectorRef
  ) {
    this.back = new EventEmitter();
    this.daySelected = new EventEmitter();
  }
  clazz(day: DayModel) {
    return day.clazz();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.calendars && changes.calendars.currentValue) {
      const calendars = changes.calendars.currentValue;
      this.st = Date.now();
      const first = this.calendars[0];
      if (first) {
        const [y, m] = first.yearMonth.split("-");
        this.page = {
          y: +y,
          m: +m,
        };
      }
      // this.calendars = [];
      // this.renderCalendar(calendars);
    }
  }
  private generateOneCalendar(calendar: AvailableDate) {
    const ul = document.createElement("ul");
    ul.setAttribute("ym", calendar.yearMonth);
    ul.classList.add("calendar");
    const ym = document.createElement("li");
    const ymc = document.createElement("strong");
    ym.append(ymc);
    ymc.textContent = `${calendar.yearMonth.substr(
      0,
      4
    )}年${calendar.yearMonth.substr(5, 2)}月`;
    ym.style.display = "block";
    ym.style.width = "100%";
    ym.style.height = "1em";
    ul.append(ym);
    const shadow = document.createElement("div");
    const m = calendar.yearMonth.substr(5, 2);
    shadow.textContent = +m < 10 ? `${m.substr(1)}` : m;
    shadow.classList.add("shadow-month");
    ul.append(shadow);
    for (const d of calendar.dayList) {
      const li = document.createElement("li");
      const cs = this.clazz(d);
      Object.keys(cs)
        .filter((it) => cs[it])
        .forEach((clazz) => {
          li.classList.add(clazz);
        });
      const day = this.generateDayHtml(d);
      li.setAttribute("date", d.date);
      li.append(day);
      ul.append(li);
    }
    return ul;
  }
  private generateDayHtml(day: DayModel) {
    const d = document.createElement("div");
    d.classList.add("day");
    if (day.hasToolTip) {
      d.classList.add("hasToolTip");
    }
    if (day.isToday) {
      d.classList.add("active", "today");
    }
    d.setAttribute("toolTipMsg", day.toolTipMsg || "");
    d.setAttribute("toolTipPos", day.toolTipPos || "");
    if (day.isLastMonthDay) {
      d.classList.add("is-last-month-day");
    }
    d.onclick = () => {
      this.toggleSelected(day, d);
    };
    const divtop = document.createElement("div");
    const dayoff = document.createElement("div");
    dayoff.classList.add("dayoff", "danger");
    dayoff.textContent = "休";
    const topDesc = document.createElement("div");
    topDesc.textContent = `${day.topDesc}`;
    topDesc.classList.add("desc", "ion-text-nowrap");
    if (day.topDesc) {
      divtop.append(topDesc);
    }
    if (day.dayoff) {
      divtop.append(dayoff);
    }
    divtop.classList.add("top");
    d.append(divtop);
    const content = document.createElement("div");
    content.classList.add(
      "content",
      `color-${day.dayoff ? "danger" : day.color}`
    );
    const cdiv = document.createElement("div");
    cdiv.textContent = !day.isToday ? day.day : day.displayName;
    content.append(cdiv);
    d.append(content);
    const bottom = document.createElement("div");
    bottom.classList.add("bottom", `color-${day.descColor}`);
    const bdiv = document.createElement("div");
    bdiv.classList.add("ion-text-nowrap");
    if (day.bottomDesc) {
      bdiv.textContent = day.bottomDesc.includes("程")
        ? (day.lunarInfo && day.lunarInfo.lunarDayName) || ""
        : day.bottomDesc;
      bottom.append(bdiv);
    }
    d.append(bottom);
    day.el = d;
    return d;
  }
  private toggleSelected(day: DayModel, d: HTMLElement) {
    day.selected = !day.selected;
    d.classList.toggle("selected", day.selected);
    this.onDaySelected(day);
  }
  private generateCalendars(calendars: AvailableDate[]) {
    const df = document.createDocumentFragment();
    for (const c of calendars) {
      df.append(this.generateOneCalendar(c));
    }
    return df;
  }
  private renderCalendar(calendars: AvailableDate[]) {
    const c = this.generateCalendars(calendars);
    // if (this.containerEl && this.containerEl.nativeElement) {
    //   this.containerEl.nativeElement.innerHTML = "";
    //   this.containerEl.nativeElement.append(c);
    //   setTimeout(() => {
    //     if (this.scrollToMonth) {
    //       if (this.isSrollToCurYm) {
    //         return;
    //       }
    //       this.isSrollToCurYm = true;
    //       setTimeout(() => {
    //         this.moveToCurMonth(this.scrollToMonth);
    //       }, 200);
    //     }
    //   }, 100);
    // }
  }
  async loadMore() {
    if (!this.calendars.length) {
      return;
    }
    let [y, m] = this.calendars[this.calendars.length - 1].yearMonth
      .split("-")
      .map((it) => +it);
    const result: AvailableDate[] = [];
    let nextM = m;
    this.page.m = m;
    this.page.y = y;
    for (let i = 1; i <= 3; i++) {
      nextM = ++nextM;
      if (nextM > 12) {
        y += 1;
        nextM = 1;
      }
      result.push(this.calendarService.generateYearNthMonthCalendar(y, nextM));
    }
    const c = this.generateCalendars(result);
    if (this.scroller) {
      const curY = new Date().getFullYear();
      this.scroller.disabled = curY + 1 == y && nextM == 1;
      this.scroller.complete();
    }
  }
  cancel() {
    this.subscription.unsubscribe();
    this.back.emit();
  }
  async onPreviousMonth() {
    if (this.calendars && this.calendars.length) {
      const [year, month] = this.calendars[0].yearMonth
        .split("-")
        .map((it) => +it);
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
    const w = this.calendarService.getDayOfWeekNames();
    this.weeks = Object.keys(w).map((k) => w[k]);
    // this.calendars = await this.calendarService.generateCanlender(12);
  }
  
  ngAfterViewInit() {
    if (this.disableScroller) {
      if (this.scroller) {
        this.scroller.disabled = true;
      }
    }
  }
  private moveToCurMonth(scrollToMonth: string) {
    console.log("scrollToMonth", scrollToMonth);
    const el = this.el.nativeElement.querySelector(`[ym='${scrollToMonth}']`);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect) {
        this.isSrollToCurYm = true;
        this.content.scrollByPoint(0, rect.top - this.plt.height() / 2, 100);
      }
    }
  }
  onDaySelected(day: DayModel) {
    this.daySelected.emit(day);
  }
}
