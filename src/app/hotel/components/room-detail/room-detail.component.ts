import { AgentEntity } from './../../../tmc/models/AgentEntity';
import { ConfigEntity } from './../../../services/config/config.entity';
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
import { DomController, ModalController } from "@ionic/angular";
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
  @Input() config: ConfigEntity;
  @Input() agent: AgentEntity;
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
    private staffService: StaffService,
    private modalCtrl: ModalController
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
  async onBook(plan: RoomPlanEntity) {
    this.bookRoom.emit(plan);
    const m = await this.modalCtrl.getTop();
    if (m) {
      m.dismiss(plan);
    }
  }
  getBreakfast(plan: RoomPlanEntity) {
    return this.hotelService.getBreakfast(plan);
  }
  async ngOnInit() {
    const identity = await this.identityService.getIdentityAsync();
    if (identity) {
      this.isAgent = identity.Numbers && !!identity.Numbers["AgentId"];
    }

  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.hotelPolicy && changes.hotelPolicy.currentValue) {
    }
  }
  ngAfterViewInit() { }
  onClose() {
    this.modalCtrl.getTop().then(t => {
      if (t) {
        t.dismiss();
      }
    }).catch(_ => 0);
    this.close.emit();
  }
}
