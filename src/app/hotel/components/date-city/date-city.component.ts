import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";

@Component({
  selector: "app-date-city",
  templateUrl: "./date-city.component.html",
  styleUrls: ["./date-city.component.scss"]
})
export class DateCityComponent implements OnInit {
  @Input() checkInDate: string;
  @Input() checkOutDate: string;
  @Input() city: TrafficlineEntity;
  @Output() cityClick: EventEmitter<any>;
  @Output() dateClick: EventEmitter<any>;
  @Output() searchBarClick: EventEmitter<any>;
  constructor() {
    this.cityClick = new EventEmitter();
    this.dateClick = new EventEmitter();
    this.searchBarClick = new EventEmitter();
  }
  getDays() {
    if (this.checkInDate && this.checkOutDate) {
      const d1 = this.checkInDate.substring("2019-08-".length);
      const d2 = this.checkOutDate.substring("2019-08-".length);
      return +d2 - +d1;
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
    this.dateClick.emit();
  }
}
