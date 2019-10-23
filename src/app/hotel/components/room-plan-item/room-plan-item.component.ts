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
import { of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { StaffService } from "src/app/hr/staff.service";
import { HotelEntity } from "../../models/HotelEntity";
import { HotelPaymentType } from "../../models/HotelPaymentType";

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
  @Input() color$ = of({});
  constructor(
    private hotelService: HotelService,
    private staffService: StaffService
  ) {
    this.bookRoom = new EventEmitter();
  }
  getRules(roomPlan: RoomPlanEntity) {
    return this.hotelService.getRules(roomPlan);
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
    this.bookRoom.emit({ roomPlan: this.roomPlan, room: this.room,color });
  }
  // private async initFilterPolicy() {
  //   const isSelf = await this.staffService.isSelfBookType();
  //   const bookInfos = this.hotelService.getBookInfos();
  //   if (isSelf) {
  //     if (bookInfos.length) {
  //       if (bookInfos[0] && bookInfos[0].passenger) {
  //         this.filterPassengerPolicy(
  //           this.hotelService.getBookInfos()[0].passenger.AccountId
  //         );
  //       }
  //     } else {
  //       this.initUnFilterColors();
  //     }
  //   } else {
  //     this.initUnFilterColors();
  //   }
  // }
  // private initUnFilterColors() {
  //   let roomPlans: RoomPlanEntity[] = [];
  //   if (this.hotel && this.hotel.Rooms) {
  //     this.hotel.Rooms.forEach(r => {
  //       roomPlans = roomPlans.concat(r.RoomPlans);
  //     });
  //   }
  //   const colors = {};
  //   roomPlans.forEach(p => {
  //     let color = "success";
  //     if (this.isFull(p.Number)) {
  //       color = "danger";
  //     }
  //     colors[p.Number] = color;
  //   });
  //   this.color$ = of(colors);
  // }
  // async filterPassengerPolicy(passengerId: string) {
  //   const hotelPolicy = await this.getPolicy();
  //   this.color$ = this.hotelService.getBookInfoSource().pipe(
  //     map(_ => {
  //       const colors = {};
  //       console.log("hotelPolicy", hotelPolicy, this.room);
  //       if (hotelPolicy) {
  //         const policies = hotelPolicy.find(
  //           it => it.PassengerKey == passengerId
  //         );
  //         if (policies) {
  //           policies.HotelPolicies.forEach(p => {
  //             let color = "";
  //             if (p.IsAllowBook) {
  //               color = !p.Rules || !p.Rules.length ? "success" : "warning";
  //             } else {
  //               color = "danger";
  //             }
  //             if (this.isFull(p.Number)) {
  //               color = "danger";
  //             }
  //             colors[p.Number] = color;
  //           });
  //         }
  //       }
  //       return colors;
  //     }),
  //     tap(colors => {
  //       console.log("colors", colors);
  //     })
  //   );
  // }
  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.room && changes.room.firstChange) {
      // this.initFilterPolicy();
    }
  }
}
