import { Component, OnInit } from "@angular/core";
import { AvailableDate } from "../../models/AvailableDate";
import { CalendarService } from "../../calendar.service";
import { DayModel } from "../../models/DayModel";

@Component({
  selector: "app-calendar",
  templateUrl: "./calendar.component.html",
  styleUrls: ["./calendar.component.scss"]
})
export class CalendarComponent implements OnInit {
  calendars: AvailableDate[];
  weeks: string[];
  constructor(private calendarService: CalendarService) {}

  ngOnInit() {
    const w = this.calendarService.getDayOfWeekNames();
    this.weeks = Object.keys(w).map(k => w[k]);
    this.calendars = this.calendarService.generateCanlender(12);
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
  }
}
