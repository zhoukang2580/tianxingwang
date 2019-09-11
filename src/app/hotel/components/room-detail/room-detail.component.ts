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
    let result = "";
    if (!roomPlan) {
      return result;
    }
    if (
      roomPlan.SupplierType == HotelSupplierType.Company ||
      roomPlan.SupplierType == HotelSupplierType.Group ||
      roomPlan.SupplierType == HotelSupplierType.Agent
    ) {
      result = "规则";
    } else if (
      roomPlan.RoomPlanRules &&
      (roomPlan.RoomPlanRules.reduce((acc, it) => {
        if (it.Type == RoomPlanRuleType.CancelNo) {
          acc++;
        }
        return acc;
      }, 0) > 0 ||
        roomPlan.RoomPlanRules.reduce((acc, it) => {
          if (it.TypeName && it.TypeName.startsWith("Cancel")) {
            acc++;
          }
          return acc;
        }, 0) == 0)
    ) {
      result = "不可取消";
    } else {
      result = "限时取消";
    }
    return result;
  }
  getAvgPrice(plan: RoomPlanEntity) {
    if (plan && plan.VariablesJsonObj) {
      return plan.VariablesJsonObj["AvgPrice"];
    }
    if (plan && plan.Variables) {
      plan.VariablesJsonObj = JSON.parse(plan.Variables);
      return plan.VariablesJsonObj["AvgPrice"];
    }
  }
  private getFullHouseOrCanBook(plan: RoomPlanEntity): string {
    if (plan && plan.VariablesJsonObj) {
      return plan.VariablesJsonObj["FullHouseOrCanBook"];
    }
    if (plan && plan.Variables) {
      plan.VariablesJsonObj = JSON.parse(plan.Variables);
      return plan.VariablesJsonObj["FullHouseOrCanBook"];
    }
  }
  private isFull(p: RoomPlanEntity | string) {
    let plan: RoomPlanEntity;
    if (typeof plan === "string") {
      plan =
        this.room &&
        this.room.RoomPlans &&
        this.room.RoomPlans.find(it => it.Number == p);
    } else if (p instanceof RoomPlanEntity) {
      plan = p;
    }
    const res = this.getFullHouseOrCanBook(plan);
    return res && res.toLowerCase().includes("full");
  }
  private isCanBook(plan: RoomPlanEntity) {
    const res = this.getFullHouseOrCanBook(plan);
    return res && res.toLowerCase().includes("canbook");
  }
  onBook(plan: RoomPlanEntity) {
    this.bookRoom.emit(plan);
  }
  getBreakfast(plan: RoomPlanEntity) {
    if (plan && plan.RoomPlanPrices && plan.RoomPlanPrices.length) {
      const minBreakfast = plan.RoomPlanPrices.map(it => it.Breakfast).sort(
        (a, b) => +a - +b
      )[0];
      if (
        plan.RoomPlanPrices.every(it => it.Breakfast == minBreakfast) &&
        minBreakfast == `${plan.Breakfast}`
      ) {
        if (minBreakfast == "0") {
          return "无早";
        } else {
          return `${plan.Breakfast}份早餐`;
        }
      } else {
        if (minBreakfast == "0") {
          return "部分早餐";
        }
        return `部分${minBreakfast}份早餐`;
      }
    }
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
