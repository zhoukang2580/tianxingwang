import { flyInOut } from "../../animations/flyInOut";
import { baiduMapAk, MapService } from "../../services/map/map.service";
import { AgentEntity } from "../../tmc/models/AgentEntity";
import { ApiService } from "src/app/services/api/api.service";
import { AppHelper } from "src/app/appHelper";
import { HotelPolicyModel } from "../models/HotelPolicyModel";
import { ConfigEntity } from "../../services/config/config.entity";
import { LanguageHelper } from "../../languageHelper";
import { HotelPassengerModel } from "../models/HotelPassengerModel";
import { HotelEntity } from "../models/HotelEntity";
import { HotelService, SearchHotelModel, IHotelInfo } from "../hotel.service";
import { HotelDayPriceEntity } from "../models/HotelDayPriceEntity";
import { ActivatedRoute, Router } from "@angular/router";
import {
  Component,
  OnInit,
  Renderer2,
  ElementRef,
  ViewChild,
  AfterViewInit,
  EventEmitter,
  OnDestroy,
  SimpleChanges,
} from "@angular/core";
import {
  Observable,
  Subscription,
  of,
  combineLatest,
  from,
  fromEvent,
} from "rxjs";
import { map, tap, finalize, debounceTime } from "rxjs/operators";
import {
  DomController,
  IonContent,
  IonRefresher,
  Platform,
  IonList,
  IonToolbar,
  ModalController,
  PopoverController,
  IonHeader,
} from "@ionic/angular";
import { CalendarService } from "src/app/tmc/calendar.service";
import { ConfigService } from "src/app/services/config/config.service";
import { RoomEntity } from "../models/RoomEntity";
import { RoomPlanEntity } from "../models/RoomPlanEntity";
import { StaffEntity, HrService } from "src/app/hr/hr.service";
import {
  PassengerBookInfo,
  FlightHotelTrainType,
  TmcService,
} from "src/app/tmc/tmc.service";
import { TripType } from "src/app/tmc/models/TripType";
// tslint:disable-next-line: max-line-length
import { FilterPassengersPolicyComponent } from "src/app/tmc/components/filter-passengers-popover/filter-passengers-policy-popover.component";
import { DayModel } from "src/app/tmc/models/DayModel";
import { HotelDetailEntity } from "../models/HotelDetailEntity";
import { StorageService } from "src/app/services/storage-service.service";
type IHotelDetailTab = "houseInfo" | "hotelInfo" | "trafficInfo";

@Component({
  selector: "app-hotel-detail-df",
  templateUrl: "./hotel-detail-df.page.html",
  styleUrls: ["./hotel-detail-df.page.scss"],
  animations: [flyInOut],
})
export class HotelDetailDfPage implements OnInit, AfterViewInit, OnDestroy {
  private hotelId: string;
  private hotelprice: string;
  private hotelDayPrice: HotelDayPriceEntity;
  private curPos = 0;
  private subscriptions: Subscription[] = [];
  private hotelDetailSub = Subscription.EMPTY;
  private isAutoOpenHotelInfoDetails = true;
  private isAutoOpenMap = true;
  private headerHeight = 0;
  private lastSelectPassengers: string[];
  @ViewChild(IonHeader) ionHeader: IonHeader;
  @ViewChild("bg") bgEle: ElementRef<HTMLElement>;
  @ViewChild("cnt", { static: true }) cnt: ElementRef<HTMLElement>;
  // @ViewChild(IonContent) content: IonContent;
  @ViewChild(IonRefresher) ionRefresher: IonRefresher;
  @ViewChild("houseInfo") private houseInfoEle: IonList;
  @ViewChild("hotelInfo") private hotelInfoEle: IonList;
  @ViewChild("trafficInfo") private trafficInfoEle: IonList;
  curHotelImagePos = 0;
  isShowTrafficInfo = true;
  isShowBackArrow = true;
  isHotelImages = false;
  backArrowColor = "light";
  queryModel: SearchHotelModel;
  isShowAddPassenger$ = of(false);
  selectedPassengersNumbers$ = of(0);
  isMd = false;
  isHeaderHide = false;
  colors: { [key: string]: string } = {};
  hotel: HotelEntity;
  config: ConfigEntity;
  agent: AgentEntity;
  activeTab: IHotelDetailTab = "houseInfo";
  hotelPolicy: HotelPassengerModel[];
  rects: { [key in IHotelDetailTab]: ClientRect | DOMRect };
  bookedRoomPlan: { roomPlan: RoomPlanEntity; room: RoomEntity; color: string };
  hotelImages: { imageUrl: string }[];
  roomDefaultImg: string;
  hotelRoomImages: { [roomId: string]: any[] } = {};
  get totalNights() {
    return this.hotelService.calcTotalNights(
      this.queryModel.checkOutDate,
      this.queryModel.checkInDate
    );
  }
  constructor(
    private mapService: MapService,
    private route: ActivatedRoute,
    private hotelService: HotelService,
    public router: Router,
    private domCtrl: DomController,
    private render: Renderer2,
    private calendarService: CalendarService,
    private storage: StorageService,
    private configService: ConfigService,
    private tmcService: TmcService,
    private staffService: HrService,
    private modalCtrl: ModalController,
    private plt: Platform,
    private apiService: ApiService,
    private popoverController: PopoverController
  ) {
    this.isMd = plt.is("android");
  }
  onSlideChange(idx: number) {
    this.curPos = idx;
  }

  onSelectPassenger() {
    this.router.navigate([AppHelper.getRoutePath("select-passenger")], {
      queryParams: { forType: FlightHotelTrainType.Hotel },
    });
  }
  private async initFilterPolicy() {
    const isSelf = await this.staffService.isSelfBookType();
    const bookInfos = this.hotelService.getBookInfos();
    const filteredPassenger = this.hotelService
      .getBookInfos()
      .find((it) => it.isFilterPolicy);
    if (filteredPassenger) {
      this.filterPassengerPolicy(
        filteredPassenger.passenger && filteredPassenger.passenger.AccountId
      );
    }
  }

  async onFilteredPassenger() {
    const popover = await this.popoverController.create({
      component: FilterPassengersPolicyComponent,
      translucent: true,
      componentProps: {
        isShowOnlyMatchSwitch: false,
        bookInfos$: this.hotelService.getBookInfoSource(),
      },
      // backdropDismiss: false
    });
    await popover.present();
    const d = await popover.onDidDismiss();
    const data = d && (d.data as PassengerBookInfo<IHotelInfo>);
    if (data) {
      this.filterPassengerPolicy(data.passenger && data.passenger.AccountId);
    }
    return data;
  }

  private async filterPassengerPolicy(passengerId: string = "") {
    const hotelPolicy = this.hotelPolicy || (await this.getPolicy());
    this.colors = {};
    if (hotelPolicy) {
      const policies = hotelPolicy.find((it) => it.PassengerKey == passengerId);
      if (policies) {
        if (this.hotel && this.hotel.Rooms) {
          this.hotel.Rooms.forEach((r) => {
            if (r.RoomPlans) {
              r.RoomPlans.forEach((plan) => {
                const p = policies.HotelPolicies.find(
                  (it) =>
                    it.UniqueIdId == this.hotelService.getRoomPlanUniqueId(plan)
                );
                if (p) {
                  let color = "";
                  if (p.IsAllowBook) {
                    color = !p.Rules || !p.Rules.length ? "success" : "warning";
                  } else {
                    color = "danger_disabled";
                  }
                  if (this.hotelService.isFull(plan)) {
                    color = "danger_full";
                  }
                  if (this.hotelService.isNoPermission(plan)) {
                    color = "danger_nopermission";
                  }
                  this.colors[p.UniqueIdId] = color;
                }
              });
            }
          });
        }
      } else {
        this.hotel.Rooms.forEach((r) => {
          if (r.RoomPlans) {
            r.RoomPlans.forEach((plan) => {
              let color = "";
              color = "success";
              this.colors[this.hotelService.getRoomPlanUniqueId(plan)] = color;
            });
          }
        });
      }
    }
    console.log("filterPassengerPolicy", this.colors);
  }
  getWeekName(date: string) {
    if (date) {
      const d = AppHelper.getDate(date);
      return this.calendarService.getDayOfWeekNames(d.getDay());
    }
  }

  isFullOnly(ps: RoomPlanEntity[]) {
    if (ps && ps.length) {
      return ps.every(
        (p) =>
          this.hotelService.getRoomPlanUniqueId(p) &&
          this.colors &&
          this.colors[this.hotelService.getRoomPlanUniqueId(p)] &&
          this.colors[this.hotelService.getRoomPlanUniqueId(p)].includes(
            "danger_full"
          )
      );
    }
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  ngOnInit() {
    this.subscriptions.push(this.hotelDetailSub);
    this.roomDefaultImg = this.hotelService.RoomDefaultImg;
    AppHelper.isWechatMiniAsync().then((isMini) => {
      this.isShowTrafficInfo = !isMini;
    });
    this.isShowAddPassenger$ = from(this.staffService.isSelfBookType()).pipe(
      map((isSelf) => !isSelf)
    );
    this.selectedPassengersNumbers$ = this.hotelService
      .getBookInfoSource()
      .pipe(map((infos) => infos.length));
    this.subscriptions.push(
      this.hotelService.getSearchHotelModelSource().subscribe((m) => {
        this.queryModel = m;
      })
    );
    this.subscriptions.push(
      this.route.queryParamMap.subscribe(async (q) => {
        this.hotelId =
          q.get("hotelId") || q.get("hotelid") || q.get("id") || q.get("Id");
        this.hotelprice = q.get("hotelprice") || q.get("price")||q.get("hotelPrice");
        const isSelf = await this.staffService.isSelfBookType();
        const isReload = this.checkIfPassengerChanged();
        if (!this.hotel || isReload||this.hotelId) {
          this.doRefresh();
        }
      })
    );
    this.configService.get().then((c) => {
      this.config = c;
    });
    // this.doRefresh();
  }
  private checkIfPassengerChanged() {
    if (this.lastSelectPassengers) {
      const pids = this.hotelService
        .getBookInfos()
        .map((it) => it.passenger && it.passenger.Id);
      return (
        this.lastSelectPassengers.length != pids.length ||
        pids.join(",") != this.lastSelectPassengers.join(",")
      );
    }
    return false;
  }
  private getHotelImageUrls() {
    let urls: string[] = [];
    urls =
      this.hotel &&
      this.hotel.HotelImages &&
      this.hotel.HotelImages.map(
        (it) => it.ImageUrl || it.FullFileName || it.FileName
      );
    if (!urls || urls.length == 0) {
      if (this.hotelService.HotelDefaultImg) {
        urls = [this.hotelService.HotelDefaultImg];
      } else if (this.config && this.config.DefaultImageUrl) {
        urls = [this.config.DefaultImageUrl];
      }
    }
    return urls || [];
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
    if (!this.config) {
      this.configService
        .get()
        .then((config) => {
          this.config = config;
        })
        .catch(() => 0);
    }
    if (this.ionRefresher) {
      this.ionRefresher.complete();
    }
    if (this.hotelDetailSub) {
      this.hotelDetailSub.unsubscribe();
    }
    this.hotelDetailSub = this.hotelService
      .getHotelDetail(this.hotelId, this.hotelprice)
      .pipe(
        map((res) => res && res.Data),
        tap((r) => {
          console.log(r);
        })
      )
      .pipe(finalize(() => {}))
      .subscribe(
        async (hotel) => {
          if (hotel) {
            this.hotel = hotel.Hotel;
            if (this.hotel) {
              this.lastSelectPassengers = this.hotelService
                .getBookInfos()
                .map((it) => it.passenger && it.passenger.Id);
              this.hotelDayPrice = { Hotel: this.hotel } as any;
              this.hotelPolicy = await this.getPolicy();
              // this.content.scrollToTop();
              this.cnt.nativeElement.scrollTop = 0;
              this.initFilterPolicy();
              this.checkIfBookedRoomPlan();
              this.initHotelDetailInfos();
              setTimeout(() => {
                this.initRects();
              }, 1000);
            }
            this.initHotelImages();
            this.initHotelRoomImages();
          }
        },
        (e) => {
          AppHelper.alert(e.Message || e);
        }
      );
  }
  private initHotelDetailInfos() {
    if (this.hotel && this.hotel.HotelDetails) {
      const obj = this.hotel.HotelDetails.reduce((acc, it) => {
        if (acc[it.Tag]) {
          acc[it.Tag].push(it);
        } else {
          acc[it.Tag] = [it];
        }
        return acc;
      }, {} as { [tag: string]: HotelDetailEntity[] });
      this.hotel.HotelDetails = Object.keys(obj)
        .map((tag) => {
          if (obj[tag] && obj[tag].length) {
            const it = new HotelDetailEntity();
            const first = obj[tag][0];
            it.Tag = first.Tag;
            it.Name = first.Name;
            const arr = obj[tag];
            let tmp: string[] = [];
            for (const d of arr) {
              if (
                !tmp.find(
                  (desc) =>
                    (desc || "").toLowerCase() ==
                    (d.Description || "").toLowerCase()
                )
              ) {
                tmp.push(d.Description);
              }
            }
            it.Description = tmp.join(`<span class='line'>|</span>`);
            return it;
          }
          return null;
        })
        .filter((it) => !!it);
      this.hotel.HotelDetails.forEach((it) => {
        it["isHtmlDescription"] = this.checkHtml(it.Description);
      });
    }
  }
  private checkHtml(htmlStr) {
    const reg = /<[^>]+>/g;
    return reg.test(htmlStr);
  }
  private initHotelImages() {
    this.hotelImages = this.getHotelImageUrls().map((it) => {
      return { imageUrl: it };
    });
  }
  private initHotelRoomImages() {
    if (this.hotel && this.hotel.Rooms && this.hotel.HotelImages) {
      this.hotelRoomImages = {};
      this.hotel.Rooms.forEach((r) => {
        this.hotelRoomImages[r.Id] = this.getRoomImages(r);
      });
    }
  }
  private checkIfBookedRoomPlan() {
    if (
      this.bookedRoomPlan &&
      this.bookedRoomPlan.roomPlan &&
      this.hotel.Rooms
    ) {
      for (let i = 0; i < this.hotel.Rooms.length; i++) {
        const r = this.hotel.Rooms[i];
        const rp = r.RoomPlans.find(
          (it) => it.Id == this.bookedRoomPlan.roomPlan.Id
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
  private getRoomImages(room: RoomEntity) {
    const images = this.hotel && this.hotel.HotelImages;
    if (room && images) {
      const roomImages = images
        .filter((it) => it.Room && it.Room.Id == room.Id)
        .map((it) => it.ImageUrl || (it.FullFileName && it.FullFileName));
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
  getRoomDescriptions(room: RoomEntity) {
    return this.hotelService.getRoomPlanDescriptions(room);
  }
  onSegmentChanged(evt: CustomEvent) {
    this.activeTab = evt.detail.value;
    if (this.activeTab == "trafficInfo") {
      this.onOpenMap();
      return;
    }
    this.scrollToTab(this.activeTab);
  }
  private scrollToTab(tab: IHotelDetailTab) {
    this.initRects();
    if (this.rects[tab]) {
      if (this.isShowTrafficInfo) {
        this.scrollToPoint(this.rects[tab]);
      }
    }
    if (tab == "hotelInfo") {
      if (this.hotel) {
        this.hotel["ishoteldetails"] = true;
      }
    }
    if (tab == "trafficInfo") {
      if (!this.hotel) {
        return;
      }
      if (this.isShowTrafficInfo) {
        if (this.hotel) {
          this.hotel["isShowMap"] = true;
        }
      } else {
        // 小程序中显示地图
        const lat = this.hotel.Lat;
        const lng = this.hotel.Lng;
        const { longitude, latitude } = this.mapService.bMapTransqqMap(
          lng,
          lat
        );
        if (window["wx"] && window["wx"].miniProgram) {
          window["wx"].miniProgram.navigateTo({
            url: `/pages/map/map?lat=${latitude}&lng=${longitude}&hotelName=${this.hotel.Name}`,
          });
        }
      }
    }
  }
  private async scrollToPoint(tab: ClientRect | DOMRect) {
    // console.log("scrollToPoint", rect);
    if (tab) {
      // const scrollEle = await this.content.getScrollElement();
      const scrollEle = this.cnt.nativeElement;
      scrollEle.scrollBy({
        behavior: "smooth",
        top: tab.top - this.headerHeight,
      });
    }
  }
  async onShowRoomPlans(room) {
    const isSelf = await this.staffService.isSelfBookType();
    if (!isSelf && this.hotelService.getBookInfos().length == 0) {
      const ok = await AppHelper.alert("请先添加旅客", true, "确定");
      if (ok) {
        this.onSelectPassenger();
      }
    }
    room["isShowRoomPlans"] = !room["isShowRoomPlans"];
  }
  async onFreeBookRoom(evt: {
    roomPlan: RoomPlanEntity;
    room: RoomEntity;
    color: string;
  }) {
    if (!evt || !evt.room || !evt.roomPlan) {
      return;
    }
    evt.roomPlan.isFreeBookRoom = true;
    const color = evt.color || "success";
    const policies = this.hotelPolicy || (await this.getPolicy()) || [];
    const policy =
      policies &&
      policies.find(
        (it) =>
          !!it.HotelPolicies.find(
            (k) =>
              k.UniqueIdId ==
              this.hotelService.getRoomPlanUniqueId(evt.roomPlan)
          )
      );
    const p =
      policy &&
      policy.HotelPolicies &&
      policy.HotelPolicies.find(
        (it) =>
          it.UniqueIdId == this.hotelService.getRoomPlanUniqueId(evt.roomPlan)
      );
    console.log("onBookRoomPlan", evt.roomPlan, p);
    if (color.includes("full")) {
      AppHelper.alert("已满房，不可预订");
      return;
    }
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
      bookInfos.forEach((info) => {
        let bookInfo: IHotelInfo;
        bookInfo = {
          hotelEntity: this.hotel,
          hotelRoom: evt.room,
          roomPlan: evt.roomPlan,
          tripType: s.tripType || TripType.checkIn,
          id: AppHelper.uuid(),
        };
        if (bookInfo) {
          const p2 = policies.find(
            (it) => it.PassengerKey == info.passenger.AccountId
          );
          const policy2 =
            p2 &&
            p2.HotelPolicies.find(
              (it) =>
                it.UniqueIdId ==
                this.hotelService.getRoomPlanUniqueId(bookInfo.roomPlan)
            );
          if (policy2 && policy2.Rules) {
            const rules = {};
            policy2.Rules.forEach((r) => {
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
      await this.onShowBookInfos();
    }
  }
  async onBookRoomPlan(evt: {
    roomPlan: RoomPlanEntity;
    room: RoomEntity;
    color: string;
  }) {
    console.log("onBookRoomPlan", evt.roomPlan);
    if (!evt || !evt.room || !evt.roomPlan) {
      return;
    }
    evt.roomPlan.isFreeBookRoom = false;
    const color = evt.color || "";
    const removedBookInfos: PassengerBookInfo<IHotelInfo>[] = [];
    const policies = this.hotelPolicy || (await this.getPolicy()) || [];
    const policy =
      policies &&
      policies.find(
        (it) =>
          !!it.HotelPolicies.find(
            (k) =>
              k.UniqueIdId ==
              this.hotelService.getRoomPlanUniqueId(evt.roomPlan)
          )
      );
    const p =
      policy &&
      policy.HotelPolicies &&
      policy.HotelPolicies.find(
        (it) =>
          it.UniqueIdId == this.hotelService.getRoomPlanUniqueId(evt.roomPlan)
      );
    console.log("onBookRoomPlan", evt.roomPlan, p);
    if (color.includes("disabled")) {
      let tip = "";
      if (p) {
        const info = this.hotelService
          .getBookInfos()
          .find((it) => it.isFilterPolicy);
        const rules =
          p.Rules ||
          (evt.roomPlan.Rules as any) ||
          (info.bookInfo &&
            info.bookInfo.roomPlan &&
            info.bookInfo.roomPlan.Rules);
        if (
          info &&
          info.passenger &&
          info.passenger.Policy &&
          info.passenger.Policy.HotelIllegalTip
        ) {
          tip = `(${info.passenger.Policy.HotelIllegalTip})`;
        }
        if (rules) {
          const msg = (
            Array.isArray(rules)
              ? rules
              : Object.keys(rules).map((k) => rules[k])
          ).join(",");
          tip = `${msg}${tip}`;
        }
      }
      if (!this.tmcService.isAgent) {
        AppHelper.alert(`超标不可预订,${tip}`);
        return;
      } else {
        await AppHelper.alert(`超标,${tip}`);
      }
    }
    if (color.includes("nopermission")) {
      if (!this.tmcService.isAgent) {
        AppHelper.alert("您没有权限预订该类型产品！");
        return;
      }
    }
    if (color.includes("full")) {
      AppHelper.alert("已满房，不可预订");
      return;
    }
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
      bookInfos.forEach((info) => {
        let bookInfo: IHotelInfo;
        bookInfo = {
          hotelEntity: this.hotel,
          hotelRoom: evt.room,
          roomPlan: evt.roomPlan,
          tripType: s.tripType || TripType.checkIn,
          id: AppHelper.uuid(),
        };
        if (
          !this.checkIfPassengerCanBookRoomPlan(
            policies,
            evt.roomPlan,
            info.passenger.AccountId,
            true
          )
        ) {
          bookInfo = null;
        }
        if (info.bookInfo && !bookInfo) {
          removedBookInfos.push(info);
        }
        if (bookInfo) {
          const p2 = policies.find(
            (it) => it.PassengerKey == info.passenger.AccountId
          );
          const policy2 =
            p2 &&
            p2.HotelPolicies.find(
              (it) =>
                it.UniqueIdId ==
                this.hotelService.getRoomPlanUniqueId(bookInfo.roomPlan)
            );
          if (policy2 && policy2.Rules) {
            const rules = {};
            policy2.Rules.forEach((r) => {
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
            .map((it) => it.credential.Name)
            .join(",")}预订信息因差标变化已被删除`
        );
      }
      await this.onShowBookInfos();
    }
  }
  private checkIfPassengerCanBookRoomPlan(
    policies: HotelPassengerModel[],
    roomPlan: RoomPlanEntity,
    passengerAccountId: string,
    isAlert = false
  ) {
    if (this.tmcService.isAgent) {
      return true;
    }
    if (!roomPlan || !passengerAccountId) {
      return false;
    }
    policies = policies || [];
    const p = policies.find((it) => it.PassengerKey == passengerAccountId);
    const policy =
      p &&
      p.HotelPolicies.find(
        (it) => this.hotelService.getRoomPlanUniqueId(roomPlan) == it.UniqueIdId
      );
    const passenger = this.hotelService
      .getBookInfos()
      .find((it) => it.passenger && it.passenger.AccountId == p.PassengerKey);
    if (policy && !policy.IsAllowBook) {
      if (passenger && isAlert) {
        AppHelper.alert(`房客${passenger.passenger.Name}超标不可预订`);
      }
      return false;
    }
    if (this.hotelService.isFull(roomPlan)) {
      if (passenger && isAlert) {
        AppHelper.alert(`满房不可预订`);
      }
      return false;
    }
    return true;
  }
  public async onShowBookInfos() {
    // const m = await this.modalCtrl.create({
    //   component: HotelRoomBookedinfosComponent
    // });
    // await m.present();
    // this.router.navigate(["hotel-room-bookedinfos"]);
    this.router.navigate([AppHelper.getRoutePath("hotel-book")]);
  }
  getRoomLowestAvgPrice(room: RoomEntity) {
    let result = 0;
    if (room && room.RoomPlans) {
      const arr: number[] = [];
      room.RoomPlans.forEach((plan) => {
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
  async onShowRoomDetails(room: RoomEntity) {
    // this.curSelectedRoom = room;
    // this.curSelectedRoom.Hotel = this.curSelectedRoom.Hotel || this.hotel;
    let roomImages = this.getRoomImages(room);
    if (!roomImages || roomImages.length === 0) {
      if (this.hotelService.RoomDefaultImg) {
        roomImages = [this.hotelService.RoomDefaultImg];
      } else if (this.config && this.config.DefaultImageUrl) {
        roomImages = [this.config.DefaultImageUrl];
      }
    }
    this.hotelService.showRoomDetailInfo = {
      hotel: this.hotel,
      room,
      roomImages,
      config: this.config,
      agent: this.agent,
    };
    this.router.navigate(["hotel-room-detail-df"]);
    // const m = await this.modalCtrl.create({
    //   component: RoomDetailComponent,
    //   componentProps: {
    //     room,
    //     hotelName:this.hotel&&this.hotel.Name,
    //     roomImages,
    //     config: this.config,
    //     agent: this.agent
    //   }
    // });
    // if (m) {
    //   await m.present();
    //   const result = await m.onDidDismiss();
    //   const data = result && (result.data as RoomPlanEntity);
    //   if (data) {
    //   }
    // }
  }
  onShowRoomImages(room: RoomEntity) {
    let roomImages = this.getRoomImages(room);
    if (!roomImages || !roomImages.length) {
      if (this.hotelService.RoomDefaultImg) {
        roomImages = [this.hotelService.RoomDefaultImg];
      }
    }
    if (roomImages) {
      this.hotelService.showImages = roomImages.map((it) => {
        return {
          url: it,
          imageUrl: it,
        };
      });
    }
    this.router.navigate(["hotel-show-images"], {
      queryParams: { hotelName: this.hotel && this.hotel.Name },
    });
  }
  async onShowHotelImages() {
    this.hotelService.showImages = this.getHotelImageUrls().map((it) => {
      return {
        url: it,
        imageUrl: it,
      };
    });
    this.router.navigate(["hotel-show-images"], {
      queryParams: {
        hotelName: this.hotel && this.hotel.Name,
        initPos: this.curPos,
      },
    });
  }
  onOpenMap() {
    this.router.navigate(["hotel-map"], {
      queryParams: {
        name: this.hotel && this.hotel.Name,
        lat: this.hotel && this.hotel.Lat,
        lng: this.hotel && this.hotel.Lng,
      },
    });
  }
  async ngAfterViewInit() {
    setTimeout(() => {
      this.initRects();
    }, 1000);
    this.hideHeader(true);
    this.checkScroll();
  }
  async onOpenCalendar() {
    const checkInDate = this.queryModel && this.queryModel.checkInDate;
    const checkOutDate = this.queryModel && this.queryModel.checkOutDate;
    await this.hotelService.openCalendar({});
    if (
      this.queryModel &&
      (checkInDate != this.queryModel.checkInDate ||
        checkOutDate != this.queryModel.checkOutDate)
    ) {
      this.onSearch();
    }
  }
  private async getPolicy() {
    let roomPlans: RoomPlanEntity[] = [];
    if (
      this.hotelDayPrice &&
      this.hotelDayPrice.Hotel &&
      this.hotelDayPrice.Hotel.Rooms
    ) {
      this.hotelDayPrice.Hotel.Rooms.forEach((r) => {
        if (r.RoomPlans) {
          r.RoomPlans.forEach((plan) => {
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
      this.rects.trafficInfo =
        this.trafficInfoEle["el"].getBoundingClientRect();
    }
    // console.log(this.rects);
  }
  async onCall() {
    if (this.hotel && this.hotel.Phone) {
      const phoneNumber = this.hotel.Phone;
      const callNumber = window["call"];
      // window.location.href=`tel:${phoneNumber}`;
      if (callNumber) {
        callNumber
          .callNumber(phoneNumber, true)
          .then((res) => console.log("Launched dialer!", res))
          .catch((err) => console.log("Error launching dialer", err));
      } else {
        const a = document.createElement("a");
        a.href = `tel:${phoneNumber}`;
        a.click();
      }
    }
  }
  private checkScroll() {
    this.domCtrl.write(async (_) => {
      // const scroll = await this.content.getScrollElement();
      const scroll = this.cnt.nativeElement;
      const sub = fromEvent(scroll, "scroll")
        .pipe(debounceTime(10))
        .subscribe(() => {
          this.domCtrl.read(() => {
            const h =
              this.bgEle &&
              this.bgEle.nativeElement &&
              this.bgEle.nativeElement.offsetHeight;
            const top = scroll.scrollTop;
            this.observeScrollIsShowHoteldetails();
            if (scroll.scrollHeight < 1.31 * this.plt.height()) {
              this.isHeaderHide = true;
            }
            if (!this.headerHeight) {
              this.headerHeight =
                this.ionHeader && this.ionHeader["el"].offsetHeight;
            }
            const headerH = this.headerHeight;
            // console.log("header height",headerH,h)
            const delta = top - (h - headerH);
            const opacity = delta / headerH;
            if (delta >= 0) {
              this.changeHeaderOpacity(opacity);
            } else {
              this.hideHeader(true);
            }
          });
        });
      this.subscriptions.push(sub);
    });
  }
  private changeHeaderOpacity(opacity: number) {
    this.domCtrl.write((_) => {
      if (this.ionHeader) {
        if (opacity < 0.01) {
          this.hideHeader(true);
        } else {
          this.hideHeader(false);
          this.render.setStyle(this.ionHeader["el"], "opacity", opacity);
        }
      }
    });
  }
  private hideHeader(hide: boolean) {
    this.domCtrl.write((_) => {
      if (this.ionHeader) {
        this.render.setStyle(
          this.ionHeader["el"],
          "display",
          `${hide ? "none" : "initial"}`
        );
      }
    });
  }
  private observeScrollIsShowHoteldetails() {
    this.domCtrl.read((_) => {
      const el = this.hotelInfoEle && this.hotelInfoEle["el"];
      const trafficEl = this.trafficInfoEle && this.trafficInfoEle["el"];
      if (trafficEl) {
        const rect = trafficEl.getBoundingClientRect();
        const isShow = rect && rect.top <= this.plt.height() / 2;
        if (this.isAutoOpenMap && this.hotel && !this.hotel["isShowMap"]) {
          this.hotel["isShowMap"] = isShow;
        } else {
          this.isAutoOpenMap = rect && rect.top > 0.75 * this.plt.height();
        }
      }
      if (el) {
        const rect = el.getBoundingClientRect();
        const isShow = rect && rect.top <= this.plt.height() / 2;
        if (
          this.isAutoOpenHotelInfoDetails &&
          this.hotel &&
          !this.hotel["ishoteldetails"]
        ) {
          this.hotel["ishoteldetails"] = isShow;
        } else {
          this.isAutoOpenHotelInfoDetails =
            rect && rect.top > 0.75 * this.plt.height();
        }
      }
    });
  }
}
