import { InternationalHotelService } from "./../../international-hotel.service";
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges
} from "@angular/core";
import { PopoverController } from "@ionic/angular";
import { InterShowMsgComponent } from "../inter-show-msg/inter-show-msg.component";
import { HotelEntity } from 'src/app/hotel/models/HotelEntity';
import { RoomEntity } from 'src/app/hotel/models/RoomEntity';
import { RoomPlanEntity } from 'src/app/hotel/models/RoomPlanEntity';
import { HotelBookType } from 'src/app/hotel/models/HotelBookType';
import { HotelPaymentType } from 'src/app/hotel/models/HotelPaymentType';

@Component({
  selector: "app-inter-room-plan-item",
  templateUrl: "./inter-room-plan-item.component.html",
  styleUrls: ["./inter-room-plan-item.component.scss"]
})
export class InterRoomPlanItemComponent implements OnInit {
  @Input() room: RoomEntity;
  @Input() hotel: HotelEntity;
  @Input() roomPlan: RoomPlanEntity;
  @Output() bookRoom: EventEmitter<any>;
  HotelBookType = HotelBookType;
  HotelPaymentType = HotelPaymentType;
  @Input() colors: { [k: string]: string };
  constructor(
    private hotelService: InternationalHotelService,
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
        component: InterShowMsgComponent,
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
  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.room && changes.room.firstChange) {
      // this.initFilterPolicy();
    }
  }
}
