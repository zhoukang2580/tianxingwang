import { InternationalHotelService } from "../international-hotel.service";
import { ActivatedRoute } from "@angular/router";
import { ConfigEntity } from "../../services/config/config.entity";
import { Observable, of, Subscription } from "rxjs";
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
import { ModalController } from "@ionic/angular";
import { HotelBookType } from "src/app/hotel/models/HotelBookType";
import { RoomPlanEntity } from "src/app/hotel/models/RoomPlanEntity";
@Component({
  selector: "app-room-detail",
  templateUrl: "./international-room-detail.page.html",
  styleUrls: ["./international-room-detail.page.scss"]
})
export class InternationalRoomDetailPage
  implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  private subscription = Subscription.EMPTY;
  room: any;
  config: ConfigEntity;
  agent: any;
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
    private hotelService: InternationalHotelService,
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
      this.images =
        this.roomImages && this.roomImages.map(it => ({ imageUrl: it }));
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
    this.roomImages = this.hotelService.showRoomDetailInfo&& this.hotelService.showRoomDetailInfo.roomImages;
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
