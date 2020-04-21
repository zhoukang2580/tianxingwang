import { InternationalHotelService } from "./../../international-hotel.service";
import { CalendarService } from "../../../tmc/calendar.service";
import { EventEmitter } from "@angular/core";
import { Component, OnInit, Output, HostListener } from "@angular/core";
import * as moment from "moment";
@Component({
  selector: "app-change-inter-roomplan-date",
  templateUrl: "./change-inter-roomplan-date.component.html",
  styleUrls: ["./change-inter-roomplan-date.component.scss"]
})
export class ChangeInterRoomPlanDateComponent implements OnInit {
  @Output() close: EventEmitter<any>;
  @Output() confirm: EventEmitter<any>;
  @Output() openCalendar: EventEmitter<any>;
  checkInDate: string;
  checkOutDate: string;
  show = false;
  constructor(
    private calendarService: CalendarService,
    private hotelService: InternationalHotelService
  ) {
    this.close = new EventEmitter();
    this.confirm = new EventEmitter();
    this.openCalendar = new EventEmitter();
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
    this.confirm.emit({
      checkInDate: this.hotelService.getSearchCondition().checkinDate,
      checkOutDate: this.hotelService.getSearchCondition().checkoutDate
    });
    setTimeout(() => {
      this.onClose();
    }, 200);
  }
  onAddCheckInDays(days: number, evt: CustomEvent) {
    evt.stopPropagation();
    const checkInDate = moment(this.checkInDate)
      .add(days, "days")
      .format("YYYY-MM-DD");
    const checkOutDate = moment(this.checkOutDate)
      .add(days, "days")
      .format("YYYY-MM-DD");
    this.hotelService.setSearchConditionSource({
      ...this.hotelService.getSearchCondition(),
      checkinDate: checkInDate,
      checkoutDate: checkOutDate
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
    this.hotelService.setSearchConditionSource({
      ...this.hotelService.getSearchCondition(),
      checkoutDate: checkOutDate
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
    this.hotelService.getSearchConditionSource().subscribe(s => {
      this.checkInDate = s.checkinDate;
      this.checkOutDate = s.checkoutDate;
    });
    setTimeout(() => {
      this.show = true;
    }, 200);
  }
  async onOpenCalendar() {
    this.openCalendar.emit(this.checkInDate);
  }
}
