import { ActivatedRoute } from "@angular/router";
import { AgentEntity } from "../../tmc/models/AgentEntity";
import { ConfigEntity } from "../../services/config/config.entity";
import { Observable, of, Subscription } from "rxjs";
import { HotelPassengerModel } from "../models/HotelPassengerModel";
import { IdentityService } from "../../services/identity/identity.service";
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
  SimpleChanges,
  OnDestroy
} from "@angular/core";
import { RoomEntity } from "../models/RoomEntity";
import { DomController, ModalController } from "@ionic/angular";
import { RoomPlanEntity } from "../models/RoomPlanEntity";
import { HotelSupplierType } from "../models/HotelSupplierType";
import { RoomPlanRuleType } from "../models/RoomPlanRuleType";
import { HotelBookType } from "../models/HotelBookType";
import { HotelService } from "../hotel.service";
import { StaffService } from "src/app/hr/staff.service";
import { map, tap } from "rxjs/operators";
@Component({
  selector: "app-room-detail",
  templateUrl: "./room-detail.page.html",
  styleUrls: ["./room-detail.page.scss"]
})
export class RoomDetailPage
  implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  private subscription = Subscription.EMPTY;
  room: RoomEntity;
  config: ConfigEntity;
  agent: AgentEntity;
  roomImages: string[];
  close: EventEmitter<any>;
  bookRoom: EventEmitter<any>;
  hotelName: string;
  images: any[];
  curIndex = 0;
  isAgent = false;
  HotelBookType = HotelBookType;
  color$: Observable<{ [roomPlanId: string]: string }> = of({});
  constructor(
    private identityService: IdentityService,
    private hotelService: HotelService,
    private modalCtrl: ModalController,
    private route: ActivatedRoute
  ) {
    this.close = new EventEmitter();
    this.bookRoom = new EventEmitter();
    this.route.queryParamMap.subscribe(_ => {
      this.init();
    });
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
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  getBreakfast(plan: RoomPlanEntity) {
    return this.hotelService.getBreakfast(plan);
  }
  private init() {
    if (this.hotelService.showRoomDetailInfo) {
      this.room = this.hotelService.showRoomDetailInfo.room;
      this.config = this.hotelService.showRoomDetailInfo.config;
      this.agent = this.hotelService.showRoomDetailInfo.agent;
      this.roomImages = this.hotelService.showRoomDetailInfo.roomImages;
      this.hotelName =
        this.hotelService.showRoomDetailInfo.hotel &&
        this.hotelService.showRoomDetailInfo.hotel.Name;
    }
  }
  back() {
    this.modalCtrl.getTop().then(t => {
      if (t) {
        t.dismiss();
      }
    });
  }
  async ngOnInit() {

    if (this.roomImages) {
      this.images = this.roomImages.map(it => {
        return {
          imageUrl: it
        };
      });
    }
    const identity = await this.identityService.getIdentityAsync();
    if (identity) {
      this.isAgent = identity.Numbers && !!identity.Numbers["AgentId"];
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.hotelPolicy && changes.hotelPolicy.currentValue) {
    }
  }
  ngAfterViewInit() {}
  onClose() {
    this.modalCtrl
      .getTop()
      .then(t => {
        if (t) {
          t.dismiss();
        }
      })
      .catch(_ => 0);
    this.close.emit();
  }
}
