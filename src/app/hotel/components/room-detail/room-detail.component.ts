import { Observable, of } from "rxjs";
import { HotelPassengerModel } from "./../../models/HotelPassengerModel";
import { IdentityService } from "./../../../services/identity/identity.service";
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  AfterViewInit,
  Output,
  EventEmitter,
  ElementRef,
  OnChanges,
  SimpleChanges
} from "@angular/core";
import { RoomEntity } from "../../models/RoomEntity";
import { DomController } from "@ionic/angular";
import { RoomPlanEntity } from "../../models/RoomPlanEntity";
import { HotelSupplierType } from "../../models/HotelSupplierType";
import { RoomPlanRuleType } from "../../models/RoomPlanRuleType";
import { HotelBookType } from "../../models/HotelBookType";
import { HotelService } from "../../hotel.service";
import { StaffService } from "src/app/hr/staff.service";
import { map, tap } from "rxjs/operators";
@Component({
  selector: "app-room-detail",
  templateUrl: "./room-detail.component.html",
  styleUrls: ["./room-detail.component.scss"]
})
export class RoomDetailComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() room: RoomEntity;
  @Input() roomImages: string[];
  @Output() close: EventEmitter<any>;
  @Output() bookRoom: EventEmitter<any>;
  curIndex = 0;
  isAgent = false;
  HotelBookType = HotelBookType;
  color$: Observable<{ [roomPlanId: string]: string }> = of({});
  constructor(
    private domCtrl: DomController,
    private identityService: IdentityService,
    private hotelService: HotelService,
    private staffService: StaffService
  ) {
    this.close = new EventEmitter();
    this.bookRoom = new EventEmitter();
  }
  getRules(roomPlan: RoomPlanEntity) {
    return this.hotelService.getRules(roomPlan);
  }
  getAvgPrice(plan: RoomPlanEntity) {
    return this.hotelService.getAvgPrice(plan);
  }
  private getFullHouseOrCanBook(plan: RoomPlanEntity): string {
    return this.hotelService.getFullHouseOrCanBook(plan);
  }
  private isFull(p: RoomPlanEntity | string) {
    return this.hotelService.isFull(p, this.room);
  }
  private isCanBook(plan: RoomPlanEntity) {
    const res = this.getFullHouseOrCanBook(plan);
    return res && res.toLowerCase().includes("canbook");
  }
  onBook(plan: RoomPlanEntity) {
    this.bookRoom.emit(plan);
  }
  getBreakfast(plan: RoomPlanEntity) {
    return this.hotelService.getBreakfast(plan);
  }
  async ngOnInit() {
    const identity = await this.identityService.getIdentityAsync();
    if (identity) {
      this.isAgent = identity.Numbers && !!identity.Numbers["AgentId"];
    }
    this.initFilterPolicy();
  }
  private async initFilterPolicy() {
    const isSelf = await this.staffService.isSelfBookType();
    if (isSelf) {
      const bookInfos = this.hotelService.getBookInfos();
      if (bookInfos.length && bookInfos[0] && bookInfos[0].passenger) {
        this.filterPassengerPolicy(
          this.hotelService.getBookInfos()[0].passenger.AccountId
        );
      }
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.hotelPolicy && changes.hotelPolicy.currentValue) {
      this.initFilterPolicy();
    }
  }
  private async getPolicy() {
    let roomPlans: RoomPlanEntity[] = [];
    if (this.room && this.room.Hotel && this.room.Hotel.Rooms) {
      this.room.Hotel.Rooms.forEach(r => {
        roomPlans = roomPlans.concat(r.RoomPlans);
      });
      return this.hotelService.getHotelPolicy(roomPlans, this.room.Hotel);
    }
    return [];
  }
  async filterPassengerPolicy(passengerId: string) {
    const hotelPolicy = await this.getPolicy();
    this.color$ = this.hotelService.getBookInfoSource().pipe(
      map(_ => {
        const colors = {};
        console.log("hotelPolicy", hotelPolicy);
        if (hotelPolicy) {
          const policies = hotelPolicy.find(
            it => it.PassengerKey == passengerId
          );
          if (policies) {
            policies.HotelPolicies.forEach(p => {
              let color = "";
              if (p.IsAllowBook) {
                color = !p.Rules || !p.Rules.length ? "success" : "warning";
              } else {
                color = "danger";
              }
              if (this.isFull(p.Number)) {
                color = "danger";
              }
              colors[p.Number] = color;
            });
          }
        }
        return colors;
      }),
      tap(colors => {
        console.log("colors", colors);
      })
    );
  }
  ngAfterViewInit() {}
  onClose() {
    this.close.emit();
  }
}
