import { HotelService } from "./../../hotel.service";
import { CalendarService } from "./../../../tmc/calendar.service";
import { EventEmitter } from "@angular/core";
import { Component, OnInit, Output, Input } from "@angular/core";
import * as moment from "moment";
@Component({
  selector: "app-change-roomplan-date",
  templateUrl: "./change-roomplan-date.component.html",
  styleUrls: ["./change-roomplan-date.component.scss"]
})
export class ChangeRoomplanDateComponent implements OnInit {
  @Output() close: EventEmitter<any>;
  @Output() confirm: EventEmitter<any>;
  checkInDate: string;
  checkOutDate: string;
  constructor(
    private calendarService: CalendarService,
    private hotelService: HotelService
  ) {
    this.close = new EventEmitter();
    this.confirm = new EventEmitter();
  }
  getDate(date: string) {
    if (date) {
      if (date == moment().format("YYYY-MM-DD")) {
        return "今天";
      }
      return moment(date).format("MM月DD日");
    }
  }
  getDayDesc(date: string) {
    if (date) {
      const d = this.calendarService.generateDayModelByDate(date);
      return this.calendarService.getDescOfDay(d);
    }
  }
  onConfirm() {
    this.onClose();
    this.confirm.emit();
  }
  onAddCheckInDays(days: number) {
    this.checkInDate = moment(this.checkInDate)
      .add(days, "days")
      .format("YYYY-MM-DD");
    this.checkOutDate = moment(this.checkOutDate)
      .add(days, "days")
      .format("YYYY-MM-DD");
  }
  onAddCheckOutDays(days: number) {
    if (this.calcNights() === 1) {
      return;
    }
    this.checkOutDate = moment(this.checkOutDate)
      .add(days, "days")
      .format("YYYY-MM-DD");
  }
  calcNights() {
    return moment(this.checkOutDate).date() - moment(this.checkInDate).date();
  }
  isDateEnabled() {
    return +moment(this.checkInDate) >= +moment();
  }
  onClose() {
    this.close.emit();
  }
  ngOnInit() {
    this.hotelService.getSearchHotelModelSource().subscribe(s => {
      this.checkInDate = s.checkInDate;
      this.checkOutDate = s.checkOutDate;
    });
  }
}
