import { Subscription } from "rxjs";
import { Platform, DomController } from "@ionic/angular";
import { DayModel } from "../../models/DayModel";
import {
  Component,
  OnInit,
  Renderer2,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  QueryList,
  ViewChildren,
  OnDestroy,
  Input,
} from "@angular/core";
import * as moment from "moment";
import { CalendarService } from "src/app/tmc/calendar.service";
@Component({
  selector: "app-days-calendar",
  templateUrl: "./days-calendar.component.html",
  styleUrls: ["./days-calendar.component.scss"],
})
export class DaysCalendarComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  @Output() itemSelected: EventEmitter<DayModel>;
  @Output() calenderClick: EventEmitter<any>;
  @Input() langOpt= {
    calendar: "日历"
  };
  @ViewChild("daysContainer") daysEle: ElementRef<HTMLElement>;
  @ViewChildren("dayItem") dayItems: QueryList<ElementRef<HTMLElement>>;
  days: DayModel[];
  constructor(
    private calendarService: CalendarService,
    private render: Renderer2,
    private plt: Platform,
    private domCtrl: DomController
  ) {
    this.days = [];
    this.itemSelected = new EventEmitter();
    this.calenderClick = new EventEmitter();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngOnInit() {
    this.initDays(moment().format("YYYY-MM-DD"));
    this.subscription = this.calendarService
      .getSelectedDaysSource()
      .subscribe((days) => {
        setTimeout(() => {
          if (days && days.length) {
            const selectedDate = days.find((it) => it.selected);
            this.initDays(days[0].date, selectedDate);
            this.moveDateToView();
          } else {
            this.initDays(moment().format("YYYY-MM-DD"));
          }
        }, 0);
      });
    // console.log(this.days);
  }
  private initDays(date: string, selectedDate: DayModel = null) {
    this.days = [];
    let idx = moment(date).diff(moment().format("YYYY-MM-DD"), "days");
    if (idx > 7) {
      idx = 7;
    }
    for (let i = -idx; i < 7 + idx; i++) {
      const nextDay = moment(date).add(i, "days");
      const day = this.calendarService.generateDayModel(nextDay);
      day.dayOfWeekName = this.calendarService.getWeekName(day);
      day.topDesc = this.calendarService.getDescOfDay(day);
      if (day.topDesc) {
        if (day.topDesc.toLowerCase() != "today") {
          day.topDesc = day.topDesc.substr(0, 3) + ".";
        }
      }
      day.selected = (selectedDate && selectedDate.date == day.date) || i == 0;
      this.days.push(day);
    }
    // let n = Math.abs(moment(date).diff(moment().format("YYYY-MM-DD"), "days"));
    // n = n > 10 ? 7 : n;
    // for (let i = -1; i >= -n; i--) {
    //   const nextDay = moment(date).add(i, "days");
    //   const day = this.calendarService.generateDayModel(nextDay);
    //   if (day.timeStamp < Math.floor(new Date().getTime() / 1000)) {
    //     break;
    //   }
    //   day.dayOfWeekName = this.calendarService.getWeekName(day);
    //   day.topDesc = this.calendarService.getDescOfDay(day);
    //   this.days.unshift(day);
    // }
    // console.log("days calendar", `n=${n}`, this.days);
  }
  onCalendar() {
    this.calenderClick.emit();
  }
  ngAfterViewInit() {
    this.moveDateToView();
  }
  private moveDateToView() {
    setTimeout(() => {
      const d = this.days.find((it) => it.selected);
      if (d) {
        this.onDaySelected(d, false);
      }
    }, 100);
  }
  onDaySelected(day: DayModel, byUser = true) {
    day.selected = true;
    let index = 0;
    for (let i = 0; i < this.days.length; i++) {
      const d = this.days[i];
      if (d.date !== day.date) {
        // 其他day非选中状态
        d.selected = false;
      } else {
        // 当前选中的是第几个元素
        index = i;
      }
    }
    if (!this.daysEle || !this.daysEle.nativeElement) {
      // 如果这里的日历找不到对应的日期，结束
      if (!this.days.find((item) => item.date == day.date)) {
        const ele = this.daysEle.nativeElement.querySelector(".active");
        // console.log("日期变更停止",ele);
        if (ele) {
          this.render.removeClass(ele, "active");
        }
      }
      return;
    }
    const daysEle = this.daysEle.nativeElement;
    let selectedEle;
    // console.dir(this.dayItems);
    if (this.dayItems && this.dayItems.length) {
      this.dayItems.forEach((item) => {
        // console.log(item.nativeElement.getAttribute("date"));
        if (item.nativeElement.getAttribute("date") == day.date) {
          selectedEle = item.nativeElement;
          this.render.addClass(item.nativeElement, "active");
        } else {
          this.render.removeClass(item.nativeElement, "active");
        }
      });
    }
    if (daysEle && selectedEle) {
      this.domCtrl.read((_) => {
        const clientRect = selectedEle.getBoundingClientRect();
        // console.dir(daysEle);
        const dist =
          clientRect.width / 2 + clientRect.left - this.plt.width() / 2;
        // console.dir(dist);
        this.domCtrl.write((_) => {
          daysEle.scrollBy({
            left: dist,
            top: 0,
            behavior: "smooth",
          });
        });
      });
    }
    if (byUser) {
      this.itemSelected.emit(day);
    }
  }
}
