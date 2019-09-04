import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-query-tab",
  templateUrl: "./query-tab.component.html",
  styleUrls: ["./query-tab.component.scss"]
})
export class QueryTabComponent implements OnInit {
  @Input() label: string;
  @Output() active: EventEmitter<any>;
  isActive = false;
  constructor() {
    this.active = new EventEmitter();
  }
  onActive() {
    this.isActive = !this.isActive;
    this.active.emit({
      label: this.label
    });
  }
  ngOnInit() {}
  onReset() {
    this.isActive = false;
  }
}
