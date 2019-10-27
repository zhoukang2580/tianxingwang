import { Subscription } from 'rxjs';
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
  OnDestroy
} from "@angular/core";
import * as moment from "moment";
import { CalendarService } from 'src/app/tmc/calendar.service';
@Component({
  selector: "app-days-calendar",
  templateUrl: "./days-calendar.component.html",
  styleUrls: ["./days-calendar.component.scss"]
})
export class DaysCalendarComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  @Output() itemSelected: EventEmitter<DayModel>;
  @Output() calenderClick: EventEmitter<any>;
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
    this.subscription = this.calendarService.getSelectedDays().subscribe(days => {
      if (days && days.length) {
        const selectedDate = days.find(it => it.selected);
        this.initDays(days[0].date, selectedDate);
      } else {
        this.initDays(moment().format("YYYY-MM-DD"))
      }
    });
    // console.log(this.days);
    this.initDays(moment().format("YYYY-MM-DD"));
  }
  private initDays(date: string, selectedDate: DayModel = null) {
    this.days=[];
    for (let i = 0; i < 7; i++) {
      const nextDay = moment(date).add(i, "days");
      const day = this.calendarService.generateDayModel(nextDay);
      day.dayOfWeekName = this.calendarService.getWeekName(day);
      day.desc = this.calendarService.getDescOfDay(day);
      day.selected = (selectedDate && selectedDate.date == day.date) || i == 0;
      this.days.push(day);
    }
  }
  onCalendar() {
    this.calenderClick.emit();
  }
  ngAfterViewInit() { }
  onDaySelected(day: DayModel) {
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
    this.domCtrl.write(ts => {
      if (!this.daysEle || !this.daysEle.nativeElement) {
        // 如果这里的日历找不到对应的日期，结束
        if (!this.days.find(item => item.date == day.date)) {
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
        this.dayItems.forEach(item => {
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
        const clientRect = selectedEle.getBoundingClientRect();
        // console.dir(daysEle);
        const dist =
          clientRect.width / 2 + clientRect.left - this.plt.width() / 2;
        // console.dir(dist);
        daysEle.scrollBy({
          left: dist,
          top: 0,
          behavior: "smooth"
        });
      }
    });
    this.itemSelected.emit(day);
  }
}
