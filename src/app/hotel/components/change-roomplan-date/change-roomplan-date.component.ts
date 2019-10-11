import { HotelService } from "./../../hotel.service";
import { CalendarService } from "./../../../tmc/calendar.service";
import { EventEmitter } from "@angular/core";
import { Component, OnInit, Output, HostListener } from "@angular/core";
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
  show = false;
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
  onAddCheckInDays(days: number, evt: CustomEvent) {
    evt.stopPropagation();
    const checkInDate = moment(this.checkInDate)
      .add(days, "days")
      .format("YYYY-MM-DD");
    const checkOutDate = moment(this.checkOutDate)
      .add(days, "days")
      .format("YYYY-MM-DD");
    this.hotelService.setSearchHotelModel({
      ...this.hotelService.getSearchHotelModel(),
      checkInDate,
      checkOutDate
    });
  }
  onAddCheckOutDays(days: number, evt: CustomEvent) {
    evt.stopPropagation();
    if (days < 0 && this.calcNights() === 1) {
      return;
    }
    const checkOutDate = moment(this.checkOutDate)
      .add(days, "days")
      .format("YYYY-MM-DD");
    this.hotelService.setSearchHotelModel({
      ...this.hotelService.getSearchHotelModel(),
      checkOutDate
    });
  }
  calcNights() {
    const m0 = moment(this.checkInDate);
    const m1 = moment(this.checkOutDate);
    return m1.diff(m0, "days");
  }
  isDateEnabled() {
    return +moment(this.checkInDate) >= +moment();
  }
  @HostListener("click")
  onClose() {
    this.close.emit();
  }
  ngOnInit() {
    this.hotelService.getSearchHotelModelSource().subscribe(s => {
      this.checkInDate = s.checkInDate;
      this.checkOutDate = s.checkOutDate;
    });
    setTimeout(() => {
      this.show = true;
    }, 200);
  }
  async openCalendar() {
    const days = await this.hotelService.openCalendar(
      this.calendarService.generateDayModelByDate(this.checkInDate)
    );
    if (days && days.length) {
      setTimeout(() => {
        console.log("选择的日期", days, "onConfirm");
        this.onConfirm();
      }, 100);
    }
  }
}
