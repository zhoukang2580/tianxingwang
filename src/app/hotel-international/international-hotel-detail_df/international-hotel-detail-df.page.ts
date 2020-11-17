import { RefresherComponent } from "../../components/refresher/refresher.component";
import { IHotelInfo } from "../../hotel/hotel.service";
import { SelectPassengerPage } from "src/app/tmc/select-passenger/select-passenger.page";
import { fadeInOut } from "../../animations/fadeInOut";
import { flyInOut } from "../../animations/flyInOut";
import { AppHelper } from "../../appHelper";
import { SlidesComponent } from "../../components/slides/slides.component";
import { ConfigEntity } from "../../services/config/config.entity";
import { ConfigService } from "../../services/config/config.service";
import { finalize, debounceTime } from "rxjs/operators";
import { Subscription, fromEvent } from "rxjs";
import {
  InternationalHotelService,
  IInterHotelSearchCondition,
  IInterHotelInfo,
} from "../international-hotel.service";
import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  ElementRef,
  AfterViewInit,
  Renderer2,
  EventEmitter,
} from "@angular/core";
import {
  IonRefresher,
  DomController,
  IonContent,
  IonHeader,
  Platform,
  NavController,
  PopoverController,
  IonList,
  ModalController,
} from "@ionic/angular";
import { ActivatedRoute, Router } from "@angular/router";
// tslint:disable-next-line: max-line-length
import { FilterPassengersPolicyComponent } from "src/app/tmc/components/filter-passengers-popover/filter-passengers-policy-popover.component";
import {
  PassengerBookInfo,
  FlightHotelTrainType,
} from "src/app/tmc/tmc.service";
import { StaffService } from "src/app/hr/staff.service";
import { TripType } from "src/app/tmc/models/TripType";
import { HotelPassengerModel } from "src/app/hotel/models/HotelPassengerModel";
import { HotelEntity } from "src/app/hotel/models/HotelEntity";
import { RoomPlanEntity } from "src/app/hotel/models/RoomPlanEntity";
import { RoomEntity } from "src/app/hotel/models/RoomEntity";
import { LanguageHelper } from "src/app/languageHelper";
import { SelectedPassengersComponent } from "src/app/tmc/components/selected-passengers/selected-passengers.component";
import { LangService } from "src/app/services/lang.service";
import { SelectPassengerEnPage } from "src/app/tmc/select-passenger_en/select-passenger_en.page";

@Component({
  selector: "app-international-hotel-detail-df",
  templateUrl: "./international-hotel-detail-df.page.html",
  styleUrls: ["./international-hotel-detail-df.page.scss"],
  animations: [flyInOut, fadeInOut],
})
export class InternationalHotelDetailDfPage
  implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(RefresherComponent) refresher: RefresherComponent;
  @ViewChild("bg") bgEle: ElementRef<HTMLElement>;
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(IonHeader) ionHeader: IonHeader;
  @ViewChild("hotelInfo") hotelInfoEle: IonList;
  @ViewChild("trafficInfo") trafficInfo: IonList;
  isSelf = true;
  private subscription = Subscription.EMPTY;
  private subscriptions: Subscription[] = [];
  private scrollEl: HTMLElement;
  private agent: any;
  private hotelPolicy: HotelPassengerModel[];
  private isAutoOpenHotelInfoDetails = true;
  private isAutoOpenHotelInfoTrafficInfo = true;
  private curSlideIndx = 0;
  hotelName: string;
  canAddPassengers = false;
  selectedPassengers: PassengerBookInfo<IInterHotelInfo>[];
  hotel: HotelEntity;
  config: ConfigEntity;
  hotelImages: { imageUrl: string }[];
  isHeaderHide = true;
  queryModel: IInterHotelSearchCondition;
  totalNights: number;
  hotelDetails: {
    Tag: string;
    Name: string;
    Description: string;
    OverviewDesc: string;
  }[];
  colors: {};
  isIos = false;
  constructor(
    public hotelService: InternationalHotelService,
    private route: ActivatedRoute,
    public router: Router,
    private configService: ConfigService,
    private domCtrl: DomController,
    private render: Renderer2,
    private plt: Platform, // private calendarService
    private navCtrl: NavController,
    private popoverController: PopoverController,
    private staffService: StaffService,
    public modalController: ModalController,
    public langService: LangService
  ) {
    this.isIos = plt.is("ios");
  }
  getBgPic() {
    return (
      this.hotel &&
      (this.hotel.FullFileName ||
        (this.hotel.HotelImages &&
          this.hotel.HotelImages.length &&
          this.hotel.HotelImages[0].FullFileName))
    );
  }
  ngOnInit() {
    this.colors = {};
    this.hotel = this.hotelService.viewHotel;
    this.initQueryModel();
    this.subscriptions.push(
      this.route.queryParamMap.subscribe(() => {
        this.staffService.isSelfBookType().then((self) => {
          this.isSelf = self;
          this.canAddPassengers = !self;
        });
        setTimeout(
          () => {
            const infos = this.hotelService.getBookInfos();
            if (
              infos &&
              infos.length &&
              (!this.colors || !Object.keys(this.colors).length)
            ) {
              this.doRefresh();
            }
          },
          this.plt.is("ios") ? 500 : 200
        );
      })
    );
    this.subscriptions.push(
      this.hotelService.getBookInfoSource().subscribe((bookinfos) => {
        this.selectedPassengers = bookinfos;
      })
    );
    this.doRefresh();
  }
  async onOpenSelectedPassengers() {
    const removeitem = new EventEmitter();
    removeitem.subscribe(async (info: PassengerBookInfo<IInterHotelInfo>) => {
      const ok = await AppHelper.alert(
        LanguageHelper.getConfirmDeleteTip(),
        true,
        LanguageHelper.getConfirmTip(),
        LanguageHelper.getCancelTip()
      );
      if (ok) {
        this.hotelService.removeBookInfo(info, true);
      }
    });
    const m = await this.modalController.create({
      component: SelectedPassengersComponent,
      componentProps: {
        bookInfos$: this.hotelService.getBookInfoSource(),
        removeitem,
      },
    });
    await m.present();
    await m.onDidDismiss();
    removeitem.unsubscribe();
  }
  private observeScrollIsShowHoteldetails() {
    this.domCtrl.read((_) => {
      const el = this.hotelInfoEle && this.hotelInfoEle["el"];
      const trafficInfoEl = this.trafficInfo && this.trafficInfo["el"];
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
      if (trafficInfoEl) {
        const rect = trafficInfoEl.getBoundingClientRect();
        const isShow = rect && rect.top <= this.plt.height() / 2;
        if (
          this.isAutoOpenHotelInfoTrafficInfo &&
          this.hotel &&
          !this.hotel["isShowMap"]
        ) {
          this.hotel["isShowMap"] = isShow;
        } else {
          this.isAutoOpenHotelInfoTrafficInfo =
            rect && rect.top > 0.75 * this.plt.height();
        }
      }
    });
  }
  onToggleDetails(detail: { isShowMoreDesc: boolean }) {
    detail.isShowMoreDesc = !detail.isShowMoreDesc;
  }
  onToggleOpenStatus(obj: any, pro: "ishoteldetails" | "isShowMap") {
    if (obj) {
      obj[pro] = !obj[pro];
      if (pro == "ishoteldetails") {
        this.isAutoOpenHotelInfoDetails = false;
      }
      if (pro == "isShowMap") {
        this.isAutoOpenHotelInfoTrafficInfo = false;
      }
    }
  }
  public async initFilterPolicy() {
    await this.getPolicy();
    const filteredPassenger = this.hotelService
      .getBookInfos()
      .find((it) => it.isFilterPolicy);
    this.filterPassengerPolicy(
      filteredPassenger &&
        filteredPassenger.passenger &&
        filteredPassenger.passenger.AccountId
    );
    // if (filteredPassenger) {
    // }
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
    const data = d && (d.data as PassengerBookInfo<IInterHotelInfo>);
    if (data) {
      await this.filterPassengerPolicy(
        data.passenger && data.passenger.AccountId
      );
    }
    return data;
  }
  private async getPolicy() {
    let roomPlans: RoomPlanEntity[] = [];
    if (this.hotel && this.hotel.Rooms) {
      this.hotel.Rooms.forEach((r) => {
        if (r.RoomPlans) {
          r.RoomPlans.forEach((plan) => {
            if (!plan.Room) {
              plan.Room = r;
            }
          });
        }
        roomPlans = roomPlans.concat(r.RoomPlans);
      });
      this.hotelPolicy = await this.hotelService
        .getHotelPolicy(roomPlans, this.hotel)
        .catch((_) => null);
      return this.hotelPolicy;
    }
    return [];
  }
  private async filterPassengerPolicy(passengerId: string = "") {
    try {
      const hotelPolicy = this.hotelPolicy || (await this.getPolicy());
      // console.log("hotelPolicyAsync", hotelPolicy);
      this.colors = {};
      if (hotelPolicy) {
        const policies = hotelPolicy.find(
          (it) => it.PassengerKey == passengerId
        );
        if (policies) {
          if (this.hotel && this.hotel.Rooms) {
            this.hotel.Rooms.forEach((r) => {
              if (r.RoomPlans) {
                r.RoomPlans.forEach((plan) => {
                  const p = policies.HotelPolicies.find(
                    (it) =>
                      it.UniqueIdId ==
                      this.hotelService.getRoomPlanUniqueId(plan)
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
                    this.colors[p.UniqueIdId] = color;
                  }
                });
              }
            });
          }
        } else {
          if (this.hotel.Rooms) {
            this.hotel.Rooms.forEach((r) => {
              if (r.RoomPlans) {
                r.RoomPlans.forEach((plan) => {
                  let color = "";
                  color = "success";
                  this.colors[
                    this.hotelService.getRoomPlanUniqueId(plan)
                  ] = color;
                });
              }
            });
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    console.log("filterPassengerPolicy", this.colors);
  }
  ngOnDestroy() {
    this.hotelService.viewHotel = null;
    this.subscription.unsubscribe();
  }
  private initHotelDetailInfos() {
    if (this.hotel && this.hotel.HotelDetails) {
      const temp: {
        [tag: string]: any[];
      } = {};
      this.hotel.HotelDetails.forEach((d) => {
        if (temp[d.Tag]) {
          temp[d.Tag].push(d);
        } else {
          temp[d.Tag] = [d];
        }
      });
      this.hotelDetails = [];
      const showOpen = `<span class='open-close-arrow'></span>`;
      Object.keys(temp).forEach((tag) => {
        const sep = tag.toLowerCase().includes("facilit")
          ? `<span class='line'>|</span>`
          : ",";
        if (temp[tag] && temp[tag].length) {
          const description = temp[tag].map((it) => it.Description).join(sep);
          let overviewDesc = description;
          const len = 21 * 2;
          const res = description.match(/<\s*(\w+)\s*>.*?<\/\s*\1\s*>/i);
          const el = res && res[1];
          const index = res && res.index;
          if (index && el) {
            if (index >= len) {
              const str1 = description.substring(0, len);
              overviewDesc = `${str1}...${showOpen}</${el}>`;
            } else {
              const str1 = description.substring(0, len);
              overviewDesc = `${str1}...${showOpen}</${el}>`;
            }
          } else {
            if (description.length > len) {
              const str1 = description.substring(0, len);
              overviewDesc = `${str1}...${showOpen}</${el}>`;
            }
          }
          const tempDescription = description;
          const mat = tempDescription.match(/.+<\s*(?!\/\w+)\s*>/gi);
          // console.log("tempDescription", tempDescription, mat);
          this.hotelDetails.push({
            Tag: tag,
            Name: temp[tag][0].Name,
            Description: description,
            OverviewDesc: overviewDesc,
          });
        }
      });
      // console.log(temp, this.hotelDetailsOtherThanFacilities);
    }
  }
  async onShowRoomDetails(room: RoomEntity) {
    // this.curSelectedRoom = room;
    // this.curSelectedRoom.Hotel = this.curSelectedRoom.Hotel || this.hotel;
    let roomImages = this.getRoomImages(room);
    if (!roomImages || roomImages.length === 0) {
      if (this.config && this.config.DefaultImageUrl) {
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
    this.router.navigate(["international-room-detail"]);
  }
  async onShowRoomImages(room: RoomEntity) {
    this.hotelService.showImages = this.getRoomImages(room).map((it) => {
      return {
        url: it,
      };
    });
    this.router.navigate(["international-hotel-show-images"], {
      queryParams: { hotelName: this.hotel && this.hotel.Name },
    });
  }
  getRoomImages(room: RoomEntity) {
    const images = this.hotel && this.hotel.HotelImages;
    if (room && images) {
      const roomImages = images
        .filter((it) => it.Room && it.Room.Id == room.Id)
        .map((it) => it.FullFileName && it.FullFileName);
      return roomImages;
    }
  }
  onSlideChange(idx: number) {
    this.curSlideIndx = idx;
  }
  getRoomLowestAvgPrice(room: RoomEntity) {
    let result = 0;
    if (room && room.RoomPlans) {
      const arr: number[] = [];
      room.RoomPlans.forEach((plan) => {
        arr.push(this.hotelService.getAvgPrice(plan));
      });
      arr.sort((p1, p2) => p1 - p2);
      result = arr[0] || 0;
    }
    return result;
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
  doRefresh() {
    this.initConfig();
    this.hotel = this.hotelService.viewHotel;
    if (this.hotel) {
      this.subscription.unsubscribe();
      this.subscription = this.hotelService
        .getHotelDetail(this.hotel.Id)
        // .pipe(
        //   finalize(() => {
        //     if (this.refresher) {
        //       this.refresher.complete();
        //     }
        //   })
        // )
        .subscribe((res) => {
          console.log("getHotelDetail", res);
          if (res) {
            this.hotel = res;
            if (this.hotel) {
              this.hotel.stars = this.getStars(this.hotel.Category);
              const name = this.hotel.Name;
              const enName = (this.hotel.HotelSummaries || []).find(
                (it) => it.Tag == "Name" && it.Lang == "en"
              );
              this.hotelName = name;
              if (enName) {
                this.hotelName += `(${enName.Content})`;
              }
            }
            this.initHotelDetailInfos();
            this.initHotelImages();
            this.initFilterPolicy();
            // this.hotel.stars = this.getStars(this.hotel);
          }
        });
    }
    if (this.refresher) {
      this.refresher.complete();
    }
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
    }else{
      
    }
  }
  ngAfterViewInit() {
    this.hideHeader(true);
    this.checkScroll();
    this.content.getScrollElement().then((c) => {
      this.scrollEl = c;
      if (this.scrollEl.scrollHeight < 1.31 * this.plt.height()) {
        this.isHeaderHide = true;
      }
    });
  }
  onSearch() {
    this.doRefresh();
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
  async onSelectPassenger(room?: {
    roomPlan: RoomPlanEntity;
    room: RoomEntity;
    color: string;
  }) {
    const remove = new EventEmitter<PassengerBookInfo<IHotelInfo>>();
    const sub = remove.subscribe((info) => {
      const ok = AppHelper.alert(
        LanguageHelper.getConfirmDeleteTip(),
        true,
        LanguageHelper.getConfirmTip(),
        LanguageHelper.getCancelTip()
      );
      if (ok) {
        this.hotelService.removeBookInfo(info, true);
      }
    });
    const olds = this.hotelService
      .getBookInfos()
      .filter((it) => it.passenger && it.passenger.AccountId)
      .map((it) => it.passenger && it.passenger.AccountId);
    const m = await this.modalController.create({
      component: this.langService.isEn
        ? SelectPassengerEnPage
        : SelectPassengerPage,
      componentProps: {
        forType: FlightHotelTrainType.HotelInternational,
        removeitem: remove,
        isOpenPageAsModal: true,
      },
    });
    m.present();
    await m.onDidDismiss();
    const news = this.hotelService
      .getBookInfos()
      .filter((it) => it.passenger && it.passenger.AccountId)
      .map((it) => it.passenger && it.passenger.AccountId);
    let newId = "";
    for (const id of news) {
      if (!olds.find((it) => it == id)) {
        newId = id;
        break;
      }
    }
    if (!newId) {
      newId = news[news.length - 1];
    }
    if (newId) {
      this.hotelService.setBookInfos(
        this.hotelService.getBookInfos().map((it) => {
          if (it.passenger) {
            it.isFilterPolicy = it.passenger.AccountId == newId;
          }
          return it;
        })
      );
    }
    sub.unsubscribe();
    await this.initFilterPolicy();
    if (room) {
      await this.onBookRoomPlan(room);
    }
  }
  private checkIfPassengerSelected() {
    return this.selectedPassengers && this.selectedPassengers.length > 0;
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
    const isself = await this.staffService.isSelfBookType();

    if (!this.checkIfPassengerSelected() && !isself) {
      const ok = await AppHelper.alert(
        "是否先添加旅客(Please Add Passengers)",
        true,
        LanguageHelper.getYesTip(),
        LanguageHelper.getNegativeTip()
      );
      if (ok) {
        this.onSelectPassenger(evt);
      }
      return;
    }
    const color = evt.color || "";
    const removedBookInfos: PassengerBookInfo<IInterHotelInfo>[] = [];
    const policies =
      (this.hotelPolicy && this.hotelPolicy.length && this.hotelPolicy) ||
      (await this.getPolicy());
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
        if (
          info &&
          info.passenger &&
          info.passenger.Policy &&
          info.passenger.Policy.HotelIllegalTip
        ) {
          tip = `(${info.passenger.Policy.HotelIllegalTip})`;
        }
        if (!p.Rules) {
          const r =
            info &&
            info.bookInfo &&
            info.bookInfo.roomPlan &&
            info.bookInfo.roomPlan.Rules;
          p.Rules = Object.keys(r).map((k) => r[k]);
        }
        if (p.Rules) {
          tip = p.Rules.join(",") + "," + tip;
        }
      }
      if (!this.hotelService.isAgent) {
        AppHelper.alert(`超标不可预订,$${tip}`);
        return;
      } else {
        AppHelper.alert(`超标,${tip}`);
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
        await AppHelper.alert("请先添加房客", true, "确定");
        this.onSelectPassenger();
        return;
      }
    } else {
      const s = this.hotelService.getSearchCondition();
      bookInfos.forEach((info) => {
        let bookInfo: IInterHotelInfo;
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
          const p = policies.find(
            (it) => it.PassengerKey == info.passenger.AccountId
          );
          const policy2 =
            p &&
            p.HotelPolicies.find(
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
      if (removedBookInfos.length) {
        AppHelper.alert(
          `${removedBookInfos
            .map((it) => it.credential.Name)
            .join(",")}预订信息因差标变化已被删除`
        );
      }
      this.onShowBookInfos();
    }
  }
  public onShowBookInfos() {
    this.langService.isCn
      ? this.router.navigate(["international-hotel-bookinfos"])
      : this.router.navigate(["international-hotel-bookinfos_en"]);
  }
  private checkIfPassengerCanBookRoomPlan(
    policies: HotelPassengerModel[],
    roomPlan: RoomPlanEntity,
    passengerAccountId: string,
    isAlert = false
  ) {
    if (!roomPlan || !passengerAccountId) {
      return false;
    }
    if (this.hotelService.isAgent) {
      return true;
    }
    const p = policies.find((it) => it.PassengerKey == passengerAccountId);
    if (!p || !p.HotelPolicies) {
      return false;
    }
    const policy = p.HotelPolicies.find(
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
  onShowHotelImages() {
    this.hotelService.showImages = this.getHotelImages();
    this.router.navigate(["international-hotel-show-images"], {
      queryParams: {
        hotelName: this.hotelName,
        initPos: this.curSlideIndx || 0,
      },
    });
  }
  async onOpenCalendar() {
    const checkindate = this.queryModel && this.queryModel.checkinDate;
    const checkoutDate = this.queryModel && this.queryModel.checkoutDate;
    await this.hotelService.openCalendar(checkindate);
    if (this.queryModel) {
      if (
        this.queryModel.checkinDate != checkindate ||
        this.queryModel.checkoutDate != checkoutDate
      ) {
        this.onSearch();
      }
    }
  }
  onOpenMap() {
    // const el = this.trafficInfo && this.trafficInfo["el"];
    // if (el) {
    //   const rect = el.getBoundingClientRect();
    //   if (rect) {
    //     if (this.hotel && !this.hotel["isShowMap"]) {
    //       this.hotel["isShowMap"] = true;
    //     }
    //     setTimeout(() => {
    //       this.content.scrollByPoint(0, rect.top, 100);
    //     }, 100);
    //   }
    // }
    this.router.navigate(["inter-hotel-map"]);
  }
  getWeekName(date: string) {
    return;
  }
  private getStars(grade: string) {
    const res = [];
    if (+grade) {
      const g = +grade;
      const m = Math.floor(g);
      const r = g - m;
      for (let i = 0; i < m; i++) {
        res.push(1);
      }
      if (r) {
        res.push(r);
      }
    }
    return res;
  }
  private calcTotalNights() {
    if (
      this.queryModel &&
      this.queryModel.checkoutDate &&
      this.queryModel.checkinDate
    ) {
      const end = AppHelper.getDate(this.queryModel.checkoutDate).getTime();
      const start = AppHelper.getDate(this.queryModel.checkinDate).getTime();
      this.totalNights = Math.ceil((end - start) / 1000 / 3600 / 24);
    }
  }
  private initQueryModel() {
    const sub = this.hotelService.getSearchConditionSource().subscribe((c) => {
      this.queryModel = c;
      this.calcTotalNights();
    });
    this.subscriptions.push(sub);
  }
  private checkScroll() {
    this.domCtrl.write(async (_) => {
      const scroll = await this.content.getScrollElement();
      this.scrollEl = scroll;

      const h =
        this.bgEle &&
        this.bgEle.nativeElement &&
        this.bgEle.nativeElement.offsetHeight;
      const sub = fromEvent(scroll, "scroll")
        .pipe(debounceTime(10))
        .subscribe((evt) => {
          this.domCtrl.read(() => {
            const top = scroll.scrollTop;
            this.observeScrollIsShowHoteldetails();
            if (scroll.scrollHeight < 1.31 * this.plt.height()) {
              this.isHeaderHide = true;
            }
            const headerH =
              (this.ionHeader && this.ionHeader["el"].offsetHeight) || 44;
            const delta = top - (h - 2 * headerH);
            const opacity = delta / headerH;
            // console.log(this.scrollEl.scrollHeight);
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
  private initHotelImages() {
    this.hotelImages = this.getHotelImages().map((it) => {
      return { imageUrl: it };
    });
  }
  private getHotelImages() {
    return (
      (this.hotel &&
        this.hotel.HotelImages &&
        this.hotel.HotelImages.map((it) => {
          return it.FullFileName;
        })) ||
      []
    );
  }

  private initConfig() {
    this.configService
      .getConfigAsync()
      .catch((_) => null)
      .then((c) => {
        this.config = c;
      });
  }
}
