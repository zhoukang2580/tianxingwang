import { CalendarService } from "src/app/tmc/calendar.service";
import { DayModel } from "../../models/DayModel";
import {
  Component,
  OnInit,
  Input,
  HostBinding,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import * as moment from "moment";

@Component({
  selector: "app-search-day-comp",
  templateUrl: "./search-day.component.html",
  styleUrls: ["./search-day.component.scss"],
})
export class SearchDayComponent implements OnInit, OnChanges {
  @Input() day: DayModel | string;
  @Input()
  @HostBinding("class.disabled")
  disabled: boolean;
  @Input() isCheckIn = false;
  @Input() isCheckOut = false;
  yearMonth: string;
  dayDesc: string;
  dayNumber: string;
  constructor(private calendarService: CalendarService) {}
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.day && changes.day.currentValue) {
      const d = this.getDayModel();
      this.yearMonth = d.date;
      this.dayDesc = this.calendarService.getDescOfDay(d);
      this.dayNumber = d.day;
    }
  }
  ngOnInit() {}
  private getDayModel() {
    return typeof this.day == "string"
      ? this.calendarService.generateDayModelByDate(this.day)
      : this.day;
  }
}
