import { CalendarService } from "src/app/tmc/calendar.service";
import { DayModel } from "../../models/DayModel";
import { Component, OnInit, Input, HostBinding } from "@angular/core";
import * as moment from "moment";

@Component({
  selector: "app-search-day-comp",
  templateUrl: "./search-day.component.html",
  styleUrls: ["./search-day.component.scss"]
})
export class SearchDayComponent implements OnInit {
  @Input() day: DayModel;
  @Input()
  @HostBinding("class.disabled")
  disabled: boolean;
  @Input() isCheckIn = false;
  @Input() isCheckOut = false;
  constructor(private calendarService: CalendarService) {}

  ngOnInit() {}
  getYearMonth() {
    if (!this.day) {
      return "";
    }
    return moment(this.day.date).format("YYYY.MM");
  }
  getDayDesc() {
    if (this.day) {
      return this.calendarService.getDescOfDay(this.day);
    }
  }
}
