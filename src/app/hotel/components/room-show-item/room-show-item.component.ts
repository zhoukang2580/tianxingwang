import { CalendarService } from "./../../../tmc/calendar.service";
import { IHotelInfo, HotelService } from "./../../hotel.service";
import { RoomEntity } from "./../../models/RoomEntity";
import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter
} from "@angular/core";
import { PassengerBookInfo } from "src/app/tmc/tmc.service";
import * as moment from "moment";

@Component({
  selector: "app-room-show-item",
  templateUrl: "./room-show-item.component.html",
  styleUrls: ["./room-show-item.component.scss"]
})
export class RoomShowItemComponent implements OnInit, OnChanges {
  @Output() changeDate: EventEmitter<any>;
  @Output() showRoomDetail: EventEmitter<any>;
  @Input() bookInfo: PassengerBookInfo<IHotelInfo>;
  items: string[] = [
    // "大床",
    // "可住2人",
    // "不含早餐",
    // "36㎡",
    // "2-8层",
    // "全部房间WiFi、有线宽带免费"
  ];
  constructor(
    private hotelService: HotelService,
    private calendarService: CalendarService
  ) {
    this.changeDate = new EventEmitter();
    this.showRoomDetail = new EventEmitter();
  }
  getDate(date: string) {
    if (date) {
      return moment(date).format("MM月DD日");
    }
  }
  getDayDesc(date: string) {
    if (date) {
      const d = this.calendarService.generateDayModelByDate(date);
      return this.calendarService.getDescOfDay(d);
    }
  }
  calcNights() {
    if (
      this.bookInfo &&
      this.bookInfo.bookInfo &&
      this.bookInfo.bookInfo.roomPlan &&
      this.bookInfo.bookInfo.roomPlan.BeginDate &&
      this.bookInfo.bookInfo.roomPlan.EndDate
    ) {
      return (
        moment(this.bookInfo.bookInfo.roomPlan.EndDate).date() -
        moment(this.bookInfo.bookInfo.roomPlan.BeginDate).date()
      );
    }
  }
  onChangeDate() {
    this.changeDate.emit();
  }
  onShowRoomDetail() {
    this.showRoomDetail.emit();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.bookInfo && changes.bookInfo.currentValue) {
      this.initItems();
    }
  }
  private initItems() {
    this.items = [];
    const it = this.hotelService.getBedType(this.bookInfo.bookInfo.hotelRoom);
    if (it) {
      this.items.push(it.Description);
    }
    const capacity = this.hotelService.getCapacity(
      this.bookInfo.bookInfo.hotelRoom
    );
    if (capacity) {
      this.items.push(`可住${capacity.Description}人`);
    }
    const b = this.hotelService.getBreakfast(this.bookInfo.bookInfo.roomPlan);
    if (b) {
      this.items.push(b);
    }
    const area = this.hotelService.getRoomArea(
      this.bookInfo.bookInfo.hotelRoom
    );
    if (area && area.Description) {
      this.items.push(
        area.Description.toLowerCase().includes("m")
          ? area.Description
          : `${area.Description}㎡`
      );
    }
    const f = this.hotelService.getFloor(this.bookInfo.bookInfo.hotelRoom);
    if (f && f.Description) {
      this.items.push(
        f.Description.includes("层") ? f.Description : `${f.Description}层`
      );
    }
    const c = this.hotelService.getComments(this.bookInfo.bookInfo.hotelRoom);
    if (c) {
      this.items.push(c.Description);
    }
  }
  ngOnInit() {}
}
