import { DayModel } from "../../../tmc/models/DayModel";
import { Component, OnInit, Input,HostBinding } from "@angular/core";
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

  constructor() {}

  ngOnInit() {}
  getYearMonth() {
    if (!this.day) {
      return "";
    }
    return moment(this.day.date).format("YYYY.MM");
  }
}
