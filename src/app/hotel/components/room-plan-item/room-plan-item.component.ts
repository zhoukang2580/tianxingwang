import { LangService } from "src/app/services/lang.service";
import { PopoverController } from "@ionic/angular";
import { RoomPlanEntity } from "src/app/hotel/models/RoomPlanEntity";
import { HotelService } from "./../../hotel.service";
import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
} from "@angular/core";
import { RoomEntity } from "../../models/RoomEntity";
import { HotelBookType } from "../../models/HotelBookType";
import { HotelEntity } from "../../models/HotelEntity";
import { HotelPaymentType } from "../../models/HotelPaymentType";
import { ShowMsgComponent } from "../show-msg/show-msg.component";

@Component({
  selector: "app-room-plan-item",
  templateUrl: "./room-plan-item.component.html",
  styleUrls: ["./room-plan-item.component.scss"],
})
export class RoomPlanItemComponent implements OnInit, OnChanges {
  @Input() room: RoomEntity;
  @Input() hotel: HotelEntity;
  @Input() roomPlan: RoomPlanEntity;
  @Input() langOpt = {
    Exceeding: "超标",
    Book: "预订",
    NonBook: "不可预订",
    freeBook: "随心订",
    NowPay: "现付",
    PayIn: "预付",
    MonthlyPay: "月结",
    SoldOut: "满房",
    Ok: "及时确认",
  };
  @Output() bookRoom: EventEmitter<any>;
  @Output() freeBookRoom: EventEmitter<any>;
  HotelBookType = HotelBookType;
  HotelPaymentType = HotelPaymentType;
  @Input() colors: { [k: string]: string };
  isFreebook = false;
  get isAgent() {
    return this.hotelService.isAgent;
  }
  constructor(
    private hotelService: HotelService,
    private popoverCtrl: PopoverController
  ) {
    this.bookRoom = new EventEmitter();
    this.freeBookRoom = new EventEmitter();
  }
  getRules(roomPlan: RoomPlanEntity) {
    return this.hotelService.getRules(roomPlan);
  }
  async showRoomRateRuleMessage(roomPlan: RoomPlanEntity) {
    const msg = this.hotelService.getRoomRateRuleMessage(roomPlan);
    if (msg) {
      const m = await this.popoverCtrl.create({
        component: ShowMsgComponent,
        componentProps: {
          msg,
        },
      });
      if (m) {
        await m.present();
      }
    }
  }
  getRoomPlanUniqueId(plan: RoomPlanEntity) {
    return this.hotelService.getRoomPlanUniqueId(plan);
  }
  getRoomArea(room: RoomEntity) {
    return this.hotelService.getRoomArea(room);
  }
  getAvgPrice(plan: RoomPlanEntity) {
    return this.hotelService.getAvgPrice(plan);
  }
  getRenovationDate(room: RoomEntity) {
    return this.hotelService.getRenovationDate(room);
  }
  getComments(room: RoomEntity) {
    return this.hotelService.getComments(room);
  }
  getCapacity(room: RoomEntity) {
    return this.hotelService.getCapacity(room);
  }
  getBedType(room: RoomEntity) {
    return this.hotelService.getBedType(room);
  }
  getBreakfast(plan: RoomPlanEntity) {
    return this.hotelService.getBreakfast(plan);
  }
  onBook(rp, color: string) {
    this.bookRoom.emit({ roomPlan: this.roomPlan, room: this.room, color });
  }
  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.room && changes.room.firstChange) {
      // this.initFilterPolicy();
    }
    if (changes && changes.roomPlan && changes.roomPlan.currentValue) {
      this.checkIsFreebook();
    }
  }
  onFreeBook() {
    this.freeBookRoom.emit({ roomPlan: this.roomPlan, room: this.room });
  }
  private checkIsFreebook() {
    if (this.roomPlan) {
      this.roomPlan.VariablesJsonObj =
        this.roomPlan.VariablesJsonObj ||
        (this.roomPlan.Variables && JSON.parse(this.roomPlan.Variables)) ||
        {};
      this.isFreebook =
        this.roomPlan.VariablesJsonObj.IsSelfPayAmount &&
        this.roomPlan.VariablesJsonObj.SelfPayAmount > 0;
    }
  }
}
