import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { IHotelQueryCompTab } from "../hotel-query/hotel-query.component";

@Component({
  selector: "app-query-tab",
  templateUrl: "./query-tab.component.html",
  styleUrls: ["./query-tab.component.scss"],
})
export class QueryTabComponent implements OnInit {
  @Input() tab: IHotelQueryCompTab;
  @Output() active: EventEmitter<any>;
  isActive = false;
  constructor() {
    this.active = new EventEmitter();
  }
  onActive() {
    this.isActive = !this.isActive;
    this.active.emit({
      ...this.tab,
      label: this.tab.label,
      isActive: this.isActive,
    });
  }
  ngOnInit() {}
  onReset() {
    this.isActive = false;
  }
}
