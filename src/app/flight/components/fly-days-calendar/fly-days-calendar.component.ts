import { Platform } from "@ionic/angular";
import { DayModel } from "./../../models/DayModel";
import {
  Component,
  OnInit,
  Renderer2,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter
} from "@angular/core";
import * as moment from "moment";
import { SelectDateService } from "../../select-date/select-date.service";
@Component({
  selector: "app-fly-days-calendar",
  templateUrl: "./fly-days-calendar.component.html",
  styleUrls: ["./fly-days-calendar.component.scss"]
})
export class FlyDaysCalendarComponent implements OnInit, AfterViewInit {
  @Output()
  itemSelected: EventEmitter<DayModel>;
  @Output()
  calenderClick: EventEmitter<any>;
  days: DayModel[];
  constructor(
    private dayService: SelectDateService,
    private render: Renderer2,
    private plt: Platform
  ) {
    this.days = [];
    this.itemSelected = new EventEmitter();
    this.calenderClick = new EventEmitter();
  }

  ngOnInit() {
    for (let i = 0; i < 30; i++) {
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
    setTimeout(() => {
      const daysEle = document.querySelector(".days");
      const selectedEle = daysEle.querySelector(".active") as HTMLElement;
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
    }, 100);
    this.itemSelected.emit(day);
  }
}
