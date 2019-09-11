import { IdentityService } from "./../../../services/identity/identity.service";
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  AfterViewInit,
  Output,
  EventEmitter
} from "@angular/core";
import { RoomEntity } from "../../models/RoomEntity";
import { DomController } from "@ionic/angular";
import { RoomPlanEntity } from "../../models/RoomPlanEntity";
import { HotelSupplierType } from "../../models/HotelSupplierType";
import { RoomPlanRuleType } from "../../models/RoomPlanRuleType";
import { HotelBookType } from "../../models/HotelBookType";

@Component({
  selector: "app-room-detail",
  templateUrl: "./room-detail.component.html",
  styleUrls: ["./room-detail.component.scss"]
})
export class RoomDetailComponent implements OnInit, AfterViewInit {
  @Input() room: RoomEntity;
  @Input() roomImages: string[];
  @Output() close: EventEmitter<any>;
  @Output() bookRoom: EventEmitter<any>;
  curIndex = 0;
  @ViewChild("imagesEle") imagesEle: HTMLElement;
  isAgent = false;
  HotelBookType = HotelBookType;
  constructor(
    private domCtrl: DomController,
    private identityService: IdentityService
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
  private isFull(plan: RoomPlanEntity) {
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
  getBookBtnColor(plan: RoomPlanEntity) {
    if (this.isFull(plan)) {
      return "danger";
    }
    if (this.isCanBook(plan)) {
      return "secondary";
    }
    return "primary";
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
  }
  ngAfterViewInit() {}
  onClose() {
    this.close.emit();
  }
}
