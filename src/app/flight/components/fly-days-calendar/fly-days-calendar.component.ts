import { Platform, DomController } from "@ionic/angular";
import { DayModel } from "./../../models/DayModel";
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
  ViewChildren
} from "@angular/core";
import * as moment from "moment";
import { SelectDateService } from "../../select-date/select-date.service";
@Component({
  selector: "app-fly-days-calendar",
  templateUrl: "./fly-days-calendar.component.html",
  styleUrls: ["./fly-days-calendar.component.scss"]
})
export class FlyDaysCalendarComponent implements OnInit, AfterViewInit {
  @Output() itemSelected: EventEmitter<DayModel>;
  @Output() calenderClick: EventEmitter<any>;
  @ViewChild("daysContainer") daysEle: ElementRef<HTMLElement>;
  @ViewChildren("dayItem") dayItems: QueryList<ElementRef<HTMLElement>>;
  days: DayModel[];
  constructor(
    private dayService: SelectDateService,
    private render: Renderer2,
    private plt: Platform,
    private domCtrl: DomController
  ) {
    this.days = [];
    this.itemSelected = new EventEmitter();
    this.calenderClick = new EventEmitter();
  }

  ngOnInit() {
    for (let i = 0; i < 7; i++) {
      const nextDay = moment().add(i, "days");
      const day = this.dayService.generateDayModel(nextDay);
      day.dayOfWeekName = this.dayService.getWeekName(day);
      day.desc = this.dayService.getDescOfDay(day);
      day.selected = i == 0;
      this.days.push(day);
    }
    // console.log(this.days);
  }
  onCalendar() {
    this.calenderClick.emit();
  }
  ngAfterViewInit() {}
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
