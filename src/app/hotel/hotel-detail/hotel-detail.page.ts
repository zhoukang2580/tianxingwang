import { AppHelper } from "src/app/appHelper";
import { HotelPolicyModel } from "./../models/HotelPolicyModel";
import { ConfigEntity } from "./../../services/config/config.entity";
import { HotelRoomBookedinfosComponent } from "./../components/hotel-room-bookedinfos/hotel-room-bookedinfos.component";
import { LanguageHelper } from "./../../languageHelper";
import { HotelPassengerModel } from "./../models/HotelPassengerModel";
import { HotelEntity } from "./../models/HotelEntity";
import { HotelService, SearchHotelModel, IHotelInfo } from "./../hotel.service";
import { HotelDayPriceEntity } from "./../models/HotelDayPriceEntity";
import { ActivatedRoute, Router } from "@angular/router";
import {
  Component,
  OnInit,
  Renderer2,
  ElementRef,
  ViewChild,
  AfterViewInit,
  EventEmitter
} from "@angular/core";
import { Observable, Subscription, of, combineLatest, from } from "rxjs";
import { map, tap } from "rxjs/operators";
import {
  DomController,
  IonContent,
  IonRefresher,
  Platform,
  IonList,
  IonToolbar,
  ModalController,
  PopoverController
} from "@ionic/angular";
import { CalendarService } from "src/app/tmc/calendar.service";
import { Storage } from "@ionic/storage";
import { ConfigService } from "src/app/services/config/config.service";
import { RoomEntity } from "../models/RoomEntity";
import { RoomPlanEntity } from "../models/RoomPlanEntity";
import { StaffService } from "src/app/hr/staff.service";
import { PassengerBookInfo } from "src/app/tmc/tmc.service";
import { TripType } from "src/app/tmc/models/TripType";
import { environment } from "src/environments/environment";
import { FilterPassengersPolicyComponent } from "src/app/tmc/components/filter-passengers-popover/filter-passengers-policy-popover.component";
type IHotelDetailTab = "houseInfo" | "hotelInfo" | "trafficInfo";

@Component({
  selector: "app-hotel-detail",
  templateUrl: "./hotel-detail.page.html",
  styleUrls: ["./hotel-detail.page.scss"]
})
export class HotelDetailPage implements OnInit, AfterViewInit {
  private hotelDayPrice: HotelDayPriceEntity;
  private scrollEle: HTMLElement;
  private headerHeight = 0;

  @ViewChild("header") headerEle: ElementRef<HTMLElement>;
  @ViewChild("bgPic") bgPicEle: ElementRef<HTMLElement>;
  @ViewChild(IonContent) ionCnt: IonContent;
  @ViewChild(IonRefresher) ionRefresher: IonRefresher;
  @ViewChild("toolbarsegment") private toolbarsegmentEle: IonToolbar;
  @ViewChild("houseInfo") private houseInfoEle: IonList;
  @ViewChild("hotelInfo") private hotelInfoEle: IonList;
  @ViewChild("trafficInfo") private trafficInfoEle: IonList;
  isShowImages = false;
  isShowBackArrow = true;
  backArrowColor = "light";
  queryModel: SearchHotelModel;
  isShowRoomImages = false;
  isShowRoomDetails = false;
  isShowAddPassenger$ = of(false);
  selectedPassengersNumbers$ = of(0);
  isMd = false;
  roomImages: string[] = [];
  curSelectedRoom: RoomEntity = {} as any;
  color$ = of({});
  hotelDetailSub = Subscription.EMPTY;
  queryModelSub = Subscription.EMPTY;
  hotel: HotelEntity;
  config: ConfigEntity;
  activeTab: IHotelDetailTab = "houseInfo";
  hotelPolicy: HotelPassengerModel[];
  rects: { [key in IHotelDetailTab]: ClientRect | DOMRect };
  bookedRoomPlan: { roomPlan: RoomPlanEntity; room: RoomEntity, color: string };
  get totalNights() {
    return (
      this.queryModel.checkInDate &&
      this.queryModel.checkOutDate &&
      +this.queryModel.checkOutDate.substring("2019-10-".length) -
      +this.queryModel.checkInDate.substring("2019-10-".length)
    );
  }
  constructor(
    private route: ActivatedRoute,
    private hotelService: HotelService,
    private router: Router,
    private domCtrl: DomController,
    private render: Renderer2,
    private calendarService: CalendarService,
    private storage: Storage,
    private configService: ConfigService,
    private staffService: StaffService,
    private modalCtrl: ModalController,
    plt: Platform,
    private popoverController: PopoverController
  ) {
    this.isMd = plt.is("android");
  }
  back() {
    this.router.navigate([AppHelper.getRoutePath("hotel-list")]);
  }
  onSelectPassenger() {
    this.router.navigate([AppHelper.getRoutePath("select-passenger")]);
  }
  private async initFilterPolicy() {
    const isSelf = await this.staffService.isSelfBookType();
    const bookInfos = this.hotelService.getBookInfos();
    if (isSelf) {
      if (bookInfos.length) {
        if (bookInfos[0] && bookInfos[0].passenger) {
          this.filterPassengerPolicy(
            this.hotelService.getBookInfos()[0].passenger.AccountId
          );
        }
      } else {
        await this.initUnFilterColors();
      }
    } else {
      const p = bookInfos.find(it => it.isFilteredPolicy);
      if (p && p.passenger && p.passenger.AccountId) {
        this.filterPassengerPolicy(p.passenger.AccountId);
      } else {
        await this.initUnFilterColors();
      }
    }
  }
  private async initUnFilterColors() {
    let roomPlans: RoomPlanEntity[] = [];
    const policies = await this.getPolicy();
    if (this.hotel && this.hotel.Rooms) {
      this.hotel.Rooms.forEach(r => {
        roomPlans = roomPlans.concat(r.RoomPlans);
      });
    }
    const colors = {};
    const bookInfos = this.hotelService.getBookInfos();
    roomPlans.forEach(p => {
      let color = "success";
      const isRoomPlanCanBook = bookInfos.some(b => this.checkIfPassengerCanBookRoomPlan(policies, p, b.passenger.AccountId));
      if (isRoomPlanCanBook) {
        color = 'success';
      } else {
        color = 'danger_disabled';
      }
      if (this.hotelService.isFull(p)) {
        color = "danger_full";
      }
      colors[p.Number] = color;
    });
    this.color$ = of(colors);
  }
  private async getFilteredPassenger() {
    const popover = await this.popoverController.create({
      component: FilterPassengersPolicyComponent,
      translucent: true,
      componentProps: {
        isShowOnlyMatchSwitch: false,
        bookInfos$: this.hotelService.getBookInfoSource()
      }
      // backdropDismiss: false
    });
    await popover.present();
    const d = await popover.onDidDismiss();
    const data = d && (d.data as PassengerBookInfo<IHotelInfo>);
    return data;
  }
  async filterPassengerPolicy(passengerId: string = "") {
    if (!passengerId) {
      const data = await this.getFilteredPassenger();
      if (!data) {
        return;
      }
      passengerId = data.passenger.AccountId;
    }
    const hotelPolicy = await this.getPolicy();
    this.color$ = this.hotelService.getBookInfoSource().pipe(
      map(_ => {
        const colors = {};
        if (hotelPolicy) {
          const policies = hotelPolicy.find(
            it => it.PassengerKey == passengerId
          );
          if (policies) {
            if (this.hotel && this.hotel.Rooms) {
              this.hotel.Rooms.forEach(r => {
                if (r.RoomPlans) {
                  r.RoomPlans.forEach(plan => {
                    const p = policies.HotelPolicies.find(
                      it => it.Number == plan.Number
                    );
                    if (p) {
                      let color = "";
                      if (p.IsAllowBook) {
                        color =
                          !p.Rules || !p.Rules.length ? "success" : "warning";
                      } else {
                        color = "danger_disabled";
                      }
                      if (this.hotelService.isFull(plan)) {
                        color = "danger_full";
                      }
                      colors[p.Number] = color;
                    }
                  });
                }
              });
            }
          }
        }
        return colors;
      }),
      tap(colors => {
        console.log("colors", colors);
      })
    );
  }
  getWeekName(date: string) {
    if (date) {
      const d = new Date(date);
      return this.calendarService.getDayOfWeekNames()[d.getDay()];
    }
  }
  async ngOnInit() {
    this.isShowAddPassenger$ = from(this.staffService.isSelfBookType()).pipe(
      map(isSelf => !isSelf)
    );
    this.selectedPassengersNumbers$ = this.hotelService
      .getBookInfoSource()
      .pipe(map(infos => infos.length));
    this.queryModelSub = this.hotelService
      .getSearchHotelModelSource()
      .subscribe(m => {
        this.queryModel = m;
      });
    this.route.queryParamMap.subscribe(q => {
      if (q.get("data")) {
        this.hotelDayPrice = JSON.parse(q.get("data"));
      }
      this.onSearch();
    });
    this.config = await this.configService.get().catch(_ => null);
  }
  onCloseRoomImages() {
    setTimeout(() => {
      this.isShowRoomImages = false;
    }, 100);
  }
  getHotelImageUrls() {
    let urls = [];
    urls =
      this.hotel &&
      this.hotel.HotelImages &&
      this.hotel.HotelImages.map(it => it.FileName);
    if (!urls || urls.length == 0) {
      if (this.config && this.config.DefaultImageUrl) {
        urls = [this.config.DefaultImageUrl];
      }
    }
    return urls;
  }
  getStars(hotel: HotelEntity) {
    if (hotel && hotel.Category) {
      hotel.Category = `${hotel.Category}`;
      if (+hotel.Category >= 5) {
        return new Array(5).fill(1);
      }
      if (hotel.Category.includes(".")) {
        const a = hotel.Category.split(".");
        return new Array(+a[0]).fill(1).concat([0.5]);
      }
      return new Array(+hotel.Category).fill(1);
    }
    return [];
  }
  onSearch() {
    this.doRefresh();
  }
  async doRefresh() {
    if (this.ionRefresher) {
      this.ionRefresher.complete();
    }
    this.hotel = null;
    if (!this.config) {
      this.config = await this.configService.get().catch(_ => null);
    }
    // if (!environment.production) {
    //   this.hotel = await this.storage.get("mock-hotel-detail");
    //   console.log(this.hotel);
    //   if (this.hotel) {
    //     this.initBgPic(this.hotel.FileName);
    //     return;
    //   }
    // }
    if (this.hotelDetailSub) {
      this.hotelDetailSub.unsubscribe();
    }
    this.hotelDetailSub = this.hotelService
      .getHotelDetail(this.hotelDayPrice)
      .pipe(
        map(res => res && res.Data),
        tap(r => {
          console.log(r);
        })
      )
      .subscribe(async hotel => {
        if (hotel) {
          this.hotel = hotel.Hotel;
          if (this.hotel) {
            this.hotelDayPrice.Hotel = this.hotel;
            this.initBgPic(this.hotel.FileName);
            this.hotelPolicy = await this.getPolicy();
            if (!environment.production) {
              this.storage.set("mock-hotel-detail", this.hotel);
            }
            await this.ionCnt.scrollToTop();
            this.initFilterPolicy();
            this.checkIfBookedRoomPlan();
            setTimeout(() => {
              this.initRects();
            }, 1000);
          }
        }
      });
  }
  private checkIfBookedRoomPlan() {
    if (this.bookedRoomPlan && this.hotel.Rooms) {
      for (let i = 0; i < this.hotel.Rooms.length; i++) {
        const r = this.hotel.Rooms[i];
        const rp = r.RoomPlans.find(
          it => it.Id == this.bookedRoomPlan.roomPlan.Id
        );
        if (rp) {
          this.bookedRoomPlan.room = r;
          this.bookedRoomPlan.roomPlan = rp;
          break;
        }
      }
      if (this.bookedRoomPlan) {
        this.onBookRoomPlan(this.bookedRoomPlan);
      }
    }
  }
  private initBgPic(src: string) {
    src = src || (this.config && this.config.PrerenderImageUrl);
    if (src) {
      this.backArrowColor =
        src == (this.config && this.config.PrerenderImageUrl)
          ? "dark"
          : "light";
      if (this.bgPicEle) {
        this.render.setStyle(
          this.bgPicEle.nativeElement,
          "background-image",
          `url(${src})`
        );
      }
    }
  }
  private getRoomImages(room: RoomEntity) {
    const images = this.hotel && this.hotel.HotelImages;
    if (room && images) {
      const roomImages = images
        .filter(it => it.Room && it.Room.Id == room.Id)
        .map(it => it.FileName && it.FileName);
      return roomImages;
    }
  }
  getRoomArea(room: RoomEntity) {
    return this.hotelService.getRoomArea(room);
  }
  getFloor(room: RoomEntity) {
    return this.hotelService.getFloor(room);
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
  segmentChanged(evt: CustomEvent) {
    if (evt.detail.value) {
      this.scrollToTab(evt.detail.value);
    }
  }
  private scrollToTab(tab: IHotelDetailTab) {
    this.initRects();
    if (this.rects[tab]) {
      this.scrollToPoint(this.rects[tab]);
    }
  }
  private scrollToPoint(tab: ClientRect | DOMRect) {
    // console.log("scrollToPoint", rect);
    if (tab) {
      if (this.toolbarsegmentEle && this.toolbarsegmentEle["el"]) {
        const segmentbar = this.toolbarsegmentEle["el"].getBoundingClientRect();
        if (segmentbar && this.scrollEle) {
          const delta = tab.top - segmentbar.bottom;
          // console.log("scrollToPoint", delta);
          this.scrollEle.scrollBy({ behavior: "smooth", top: delta });
        }
      }
      // console.log("header", hh);
    }
  }
  async onBookRoomPlan(evt: { roomPlan: RoomPlanEntity; room: RoomEntity, color: string }) {
    console.log("onBookRoomPlan", evt.roomPlan);
    if (!evt || !evt.room || !evt.roomPlan) {
      return;
    }
    const color = evt.color || "";
    if (color.includes("disabled")) {
      AppHelper.alert("超标不可预订");
      return;
    }
    if (color.includes("full")) {
      AppHelper.alert("已满房，不可预订");
      return;
    }
    const removedBookInfos: PassengerBookInfo<IHotelInfo>[] = [];
    const policies = await this.getPolicy();
    const bookInfos = this.hotelService.getBookInfos();
    const isSelf = await this.staffService.isSelfBookType();
    if (bookInfos.length === 0) {
      if (!isSelf) {
        const a = await AppHelper.alert(
          "请先添加房客",
          true,
          LanguageHelper.getConfirmTip()
        );
        if (a) {
          this.bookedRoomPlan = evt;
          this.onSelectPassenger();
        }
      }
    } else {
      const s = this.hotelService.getSearchHotelModel();
      bookInfos.forEach(info => {
        let bookInfo: IHotelInfo;
        bookInfo = {
          hotelEntity: this.hotel,
          hotelRoom: evt.room,
          roomPlan: evt.roomPlan,
          tripType: s.tripType || TripType.checkIn,
          id: AppHelper.uuid()
        };
        if (
          !this.checkIfPassengerCanBookRoomPlan(
            policies,
            evt.roomPlan,
            info.passenger.AccountId
          )
        ) {
          bookInfo = null;
        }
        if (info.bookInfo && !bookInfo) {
          removedBookInfos.push(info);
        }
        if (bookInfo) {
          const p = policies.find(
            it => it.PassengerKey == info.passenger.AccountId
          );
          const policy =
            p &&
            p.HotelPolicies.find(it => it.Number == bookInfo.roomPlan.Number);
          if (policy && policy.Rules) {
            const rules = {};
            policy.Rules.forEach(r => {
              rules[AppHelper.uuid()] = r;
            });
            bookInfo.roomPlan.Rules = bookInfo.roomPlan.Rules || rules;
          }
        }
        info.bookInfo = bookInfo;
      });
      this.bookedRoomPlan = null;
      const m = await this.modalCtrl.getTop();
      if (m) {
        m.dismiss();
      }
      if (removedBookInfos.length) {
        AppHelper.alert(
          `${removedBookInfos
            .map(it => it.credential.Name)
            .join(",")}预订信息因差标变化已被删除`
        );
      }
      await this.onShowBookInfos();
    }
  }
  private checkIfPassengerCanBookRoomPlan(
    policies: HotelPassengerModel[],
    roomPlan: RoomPlanEntity,
    passengerAccountId: string
  ) {
    if (!roomPlan || !passengerAccountId) {
      return false;
    }
    const p = policies.find(it => it.PassengerKey == passengerAccountId);
    const policy = p.HotelPolicies.find(it => it.Number == roomPlan.Number);
    const passenger = this.hotelService.getBookInfos().find(it => it.passenger && it.passenger.AccountId == p.PassengerKey);
    if (!policy.IsAllowBook) {
      if (passenger) {
        AppHelper.alert(`房客${passenger.passenger.Name}超标不可预订`)
      }
      return false;
    }
    if (this.hotelService.isFull(roomPlan)) {
      if (passenger) {
        AppHelper.alert(`满房不可预订`)
      }
      return false;
    }
    return true;
  }
  private async onShowBookInfos() {
    const m = await this.modalCtrl.create({
      component: HotelRoomBookedinfosComponent
    });
    await m.present();
  }
  getRoomLowestAvgPrice(room: RoomEntity) {
    let result = 0;
    if (room && room.RoomPlans) {
      const arr: number[] = [];
      room.RoomPlans.forEach(plan => {
        arr.push(this.getAvgPrice(plan));
      });
      arr.sort((p1, p2) => p1 - p2);
      result = arr[0] || 0;
    }
    return result;
  }
  private getAvgPrice(plan: RoomPlanEntity) {
    return this.hotelService.getAvgPrice(plan);
  }
  onShowRoomDetails(room: RoomEntity) {
    this.curSelectedRoom = room;
    this.curSelectedRoom.Hotel = this.curSelectedRoom.Hotel || this.hotel;
    this.roomImages = this.getRoomImages(room);
    if (!this.roomImages || this.roomImages.length === 0) {
      if (this.config && this.config.DefaultImageUrl) {
        this.roomImages = [this.config.DefaultImageUrl];
      }
    }
    this.isShowRoomDetails = true;
  }
  onShowRoomImages(room: RoomEntity) {
    this.roomImages = this.getRoomImages(room);
    if (!this.roomImages || this.roomImages.length === 0) {
      return;
    }
    this.isShowRoomImages = true;
  }
  onOpenMap() {
    this.segmentChanged({
      detail: { value: "trafficInfo" as IHotelDetailTab }
    } as any);
  }
  async ngAfterViewInit() {
    if (this.ionCnt) {
      this.scrollEle = await this.ionCnt.getScrollElement();
    }
    const config = await this.configService.get().catch(_ => null);
    this.initBgPic(
      (config && config.PrerenderImageUrl) || AppHelper.getDefaultLoadingImage()
    );
    setTimeout(() => {
      this.initRects();
      this.initEle();
    }, 1000);
  }
  onOpenCalendar() {
    this.hotelService.openCalendar();
  }
  private async getPolicy() {
    let roomPlans: RoomPlanEntity[] = [];
    if (
      this.hotelDayPrice &&
      this.hotelDayPrice.Hotel &&
      this.hotelDayPrice.Hotel.Rooms
    ) {
      this.hotelDayPrice.Hotel.Rooms.forEach(r => {
        if (r.RoomPlans) {
          r.RoomPlans.forEach(plan => {
            if (!plan.Room) {
              plan.Room = r;
            }
          });
        }
        roomPlans = roomPlans.concat(r.RoomPlans);
      });
      return this.hotelService.getHotelPolicy(
        roomPlans,
        this.hotelDayPrice.Hotel
      );
    }
    return [];
  }

  private initRects() {
    this.activeTab = "houseInfo";
    this.rects = {} as any;
    if (this.hotelInfoEle && this.hotelInfoEle["el"]) {
      this.rects.hotelInfo = this.hotelInfoEle["el"].getBoundingClientRect();
    }
    if (this.houseInfoEle && this.houseInfoEle["el"]) {
      this.rects.houseInfo = this.houseInfoEle["el"].getBoundingClientRect();
    }
    if (this.trafficInfoEle && this.trafficInfoEle["el"]) {
      this.rects.trafficInfo = this.trafficInfoEle[
        "el"
      ].getBoundingClientRect();
    }
    // console.log(this.rects);
  }
  private initEle() {
    if (this.headerEle && this.headerEle.nativeElement) {
      this.headerHeight = this.headerEle.nativeElement.clientHeight;
    }
    if (this.scrollEle) {
      this.scrollEle.onscroll = () => {
        let bottom = 0;
        this.domCtrl.read(_ => {
          this.isShowBackArrow = this.scrollEle.scrollTop < 10;
          let opacity = 0;
          const bottomRect =
            this.bgPicEle &&
            this.bgPicEle.nativeElement &&
            this.bgPicEle.nativeElement.getBoundingClientRect();
          if (bottomRect) {
            bottom = bottomRect.bottom;
          }
          if (bottom <= this.headerHeight * 6) {
            if (bottom >= this.headerHeight * 1.3) {
              opacity = +(bottom / (this.headerHeight * 6)).toFixed(1);
              opacity = Math.min(1 - opacity, 1);
              // console.log(opacity);
            } else {
              opacity = 1;
            }
          } else {
            opacity = 0;
          }
          opacity = opacity < 0.35 ? 0 : opacity;
          this.render.setStyle(
            this.headerEle.nativeElement,
            "zIndex",
            `${opacity}`
          );
          this.domCtrl.write(_ => {
            this.render.setStyle(
              this.headerEle.nativeElement,
              "opacity",
              opacity
            );
          });
        });
      };
    }
  }
}
