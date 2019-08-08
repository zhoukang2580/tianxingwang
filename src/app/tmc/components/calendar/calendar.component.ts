import { Component, OnInit, Output, EventEmitter,Input } from "@angular/core";
import { AvailableDate } from "../../models/AvailableDate";
import { CalendarService } from "../../calendar.service";
import { DayModel } from "../../models/DayModel";

@Component({
  selector: "app-calendar",
  templateUrl: "./calendar.component.html",
  styleUrls: ["./calendar.component.scss"]
})
export class CalendarComponent implements OnInit {
  @Input()calendars: AvailableDate[];
  weeks: string[];
  @Output() back: EventEmitter<any>;
  @Output() daySelected: EventEmitter<any>;
  constructor(private calendarService: CalendarService) {
    this.back = new EventEmitter();
    this.daySelected = new EventEmitter();
  }
  cancel() {
    this.back.emit();
  }
  async ngOnInit() {
    const w = this.calendarService.getDayOfWeekNames();
    this.weeks = Object.keys(w).map(k => w[k]);
    // this.calendars = await this.calendarService.generateCanlender(12);
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
