import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import * as moment from "moment";

@Component({
  selector: "app-date-city",
  templateUrl: "./date-city.component.html",
  styleUrls: ["./date-city.component.scss"],
})
export class DateCityComponent implements OnInit {
  @Input() keywords: string;
  @Input() langOpt: {
    checkin: "住";
    checkout: "离";
    night: "晚";
    placeholder: "地名/酒店/关键词";
  };
  @Input() checkInDate: string;
  @Input() checkOutDate: string;
  @Input() city: TrafficlineEntity;
  @Output() cityClick: EventEmitter<any>;
  @Output() dateChange: EventEmitter<any>;
  @Output() searchBarClick: EventEmitter<any>;
  constructor() {
    this.cityClick = new EventEmitter();
    this.dateChange = new EventEmitter();
    this.searchBarClick = new EventEmitter();
  }
  getDays() {
    if (this.checkInDate && this.checkOutDate) {
      return Math.abs(
        moment(this.checkOutDate).diff(moment(this.checkInDate), "days")
      );
    }
  }
  ngOnInit() {}
  onCityClick() {
    this.cityClick.emit();
  }
  onSearchBarClick() {
    this.searchBarClick.emit();
  }
  onDateClick() {
    this.dateChange.emit();
  }
}
