import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { IllegalReasonEntity } from "../../tmc.service";

@Component({
  selector: "app-book-illegal-reason-comp",
  templateUrl: "./book-illegal-reason-comp.component.html",
  styleUrls: ["./book-illegal-reason-comp.component.scss"]
})
export class BookIllegalReasonCompComponent implements OnInit {
  @Input() isAllowCustomReason: boolean;
  @Input() illegalReasons: IllegalReasonEntity[] = [];
  @Output() ionchange: EventEmitter<any>;
  isOtherIllegalReason: boolean;
  otherIllegalReason: string;
  illegalReason: string;
  constructor() {
    this.ionchange = new EventEmitter();
  }
  onValueChange() {
    this.ionchange.emit({
      isOtherIllegalReason: this.isOtherIllegalReason,
      otherIllegalReason: this.otherIllegalReason,
      illegalReason: this.illegalReason
    });
  }
  ngOnInit() {}
}
