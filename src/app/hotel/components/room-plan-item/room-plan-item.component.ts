import { HotelService } from "./../../hotel.service";
import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges
} from "@angular/core";
import { RoomEntity } from "../../models/RoomEntity";
import { RoomPlanEntity } from "../../models/RoomPlanEntity";
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
  HotelBookType = HotelBookType;
  HotelPaymentType = HotelPaymentType;
  color$ = of({});
  constructor(
    private hotelService: HotelService,
    private staffService: StaffService
  ) {}
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
  getRoomArea(room: RoomEntity) {
    return (
      room && room.RoomDetails && room.RoomDetails.find(it => it.Tag == "Area")
    );
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
    if (typeof p === "string") {
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
  private async getPolicy() {
    let roomPlans: RoomPlanEntity[] = [];
    if (this.hotel && this.hotel.Rooms) {
      this.hotel.Rooms.forEach(r => {
        roomPlans = roomPlans.concat(r.RoomPlans);
      });
      return this.hotelService.getHotelPolicy(roomPlans, this.hotel);
    }
    return [];
  }
  getRenovationDate(room: RoomEntity) {
    return (
      room &&
      room.RoomDetails &&
      room.RoomDetails.find(it => it.Tag == "RenovationDate")
    );
  }
  getComments(room: RoomEntity) {
    return (
      room &&
      room.RoomDetails &&
      room.RoomDetails.find(it => it.Tag == "Comments")
    );
  }
  getCapacity(room: RoomEntity) {
    return (
      room &&
      room.RoomDetails &&
      room.RoomDetails.find(it => it.Tag == "Capacity")
    );
  }
  getBedType(room: RoomEntity) {
    return (
      room &&
      room.RoomDetails &&
      room.RoomDetails.find(it => it.Tag == "BedType")
    );
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
  onBook() {}
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
  async filterPassengerPolicy(passengerId: string) {
    const hotelPolicy = await this.getPolicy();
    this.color$ = this.hotelService.getBookInfoSource().pipe(
      map(_ => {
        const colors = {};
        console.log("hotelPolicy", hotelPolicy, this.room);
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
  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.room && changes.room.firstChange) {
      this.initFilterPolicy();
    }
  }
}
