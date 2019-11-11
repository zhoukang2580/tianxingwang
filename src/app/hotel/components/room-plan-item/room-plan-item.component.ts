import { PopoverController } from '@ionic/angular';
import { AppHelper } from './../../../appHelper';
import { RoomPlanEntity } from "src/app/hotel/models/RoomPlanEntity";
import { HotelService } from "./../../hotel.service";
import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output
} from "@angular/core";
import { RoomEntity } from "../../models/RoomEntity";
import { RoomPlanRuleType } from "../../models/RoomPlanRuleType";
import { HotelSupplierType } from "../../models/HotelSupplierType";
import { HotelBookType } from "../../models/HotelBookType";
import { of, Subscription } from "rxjs";
import { map, tap } from "rxjs/operators";
import { StaffService } from "src/app/hr/staff.service";
import { HotelEntity } from "../../models/HotelEntity";
import { HotelPaymentType } from "../../models/HotelPaymentType";
import { ShowMsgComponent } from '../show-msg/show-msg.component';

@Component({
  selector: "app-room-plan-item",
  templateUrl: "./room-plan-item.component.html",
  styleUrls: ["./room-plan-item.component.scss"]
})
export class RoomPlanItemComponent implements OnInit, OnChanges {
  @Input() room: RoomEntity;
  @Input() hotel: HotelEntity;
  @Input() roomPlan: RoomPlanEntity;
  @Output() bookRoom: EventEmitter<any>;
  HotelBookType = HotelBookType;
  HotelPaymentType = HotelPaymentType;
  @Input() colors: { [k: string]: string };
  private colorsSubscription=Subscription.EMPTY;
  constructor(
    private hotelService: HotelService,
    private staffService: StaffService,
    private popoverCtrl: PopoverController
  ) {
    this.bookRoom = new EventEmitter();
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
          msg
        }
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
  onBook(roomPlan: RoomPlanEntity, color: string) {
    this.bookRoom.emit({ roomPlan: this.roomPlan, room: this.room, color });
  }
  ngOnInit() {
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.room && changes.room.firstChange) {
      // this.initFilterPolicy();
    }
  }
}
