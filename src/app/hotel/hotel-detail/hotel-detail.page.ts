import { HotelEntity } from "./../models/HotelEntity";
import { AppHelper } from "./../../appHelper";
import { HotelService, SearchHotelModel } from "./../hotel.service";
import { HotelResultEntity } from "./../models/HotelResultEntity";
import { HotelDayPriceEntity } from "./../models/HotelDayPriceEntity";
import { ActivatedRoute, Router } from "@angular/router";
import {
  Component,
  OnInit,
  Renderer2,
  ElementRef,
  ViewChild,
  AfterViewInit
} from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { map, tap } from "rxjs/operators";
import {
  DomController,
  IonContent,
  IonRefresher,
  Platform
} from "@ionic/angular";
import { CalendarService } from "src/app/tmc/calendar.service";
import { Storage } from "@ionic/storage";
import { environment } from "src/environments/environment";
import { ImageRecoverService } from "src/app/services/imageRecover/imageRecover.service";
import { ConfigService } from "src/app/services/config/config.service";
import { RoomEntity } from "../models/RoomEntity";
import { RoomPlanEntity } from "../models/RoomPlanEntity";
type IHotelDetailTab = "houseInfo" | "hotelInfo" | "trafficInfo";

@Component({
  selector: "app-hotel-detail",
  templateUrl: "./hotel-detail.page.html",
  styleUrls: ["./hotel-detail.page.scss"]
})
export class HotelDetailPage implements OnInit, AfterViewInit {
  private item: HotelDayPriceEntity;
  private scrollEle: HTMLElement;
  private headerHeight = 0;
  @ViewChild("header") headerEle: ElementRef<HTMLElement>;
  @ViewChild("bgPic") bgPicEle: ElementRef<HTMLElement>;
  @ViewChild(IonContent) ionCnt: IonContent;
  @ViewChild(IonRefresher) ionRefresher: IonRefresher;
  @ViewChild("houseInfo") private houseInfoEle: ElementRef<HTMLElement>;
  @ViewChild("hotelInfo") private hotelInfoEle: ElementRef<HTMLElement>;
  @ViewChild("trafficInfo") private trafficInfoEle: ElementRef<HTMLElement>;
  isShowImages = false;
  isShowBackArrow = true;
  backArrowColor = "light";
  queryModel: SearchHotelModel;
  isShowRoomImages = false;
  isShowRoomDetails = false;
  isMd = false;
  roomImages: string[] = [];
  curSelectedRoom: RoomEntity;
  hotelDetailSub = Subscription.EMPTY;
  queryModelSub = Subscription.EMPTY;
  hotel: HotelEntity;
  config: any;
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
    plt: Platform
  ) {
    this.isMd = plt.is("android");
  }
  back() {
    this.router.navigate([AppHelper.getRoutePath("hotel-list")]);
  }
  getWeekName(date: string) {
    if (date) {
      const d = new Date(date);
      return this.calendarService.getDayOfWeekNames()[d.getDay()];
    }
  }
  async ngOnInit() {
    this.queryModelSub = this.hotelService
      .getSearchHotelModelSource()
      .subscribe(m => {
        this.queryModel = m;
      });
    this.route.queryParamMap.subscribe(q => {
      if (q.get("data")) {
        this.item = JSON.parse(q.get("data"));
      }
      this.onSearch();
    });
    this.config = await this.configService.get().catch(_ => null);
  }
  getImageUrls() {
    return (
      this.hotel &&
      this.hotel.HotelImages &&
      this.hotel.HotelImages.map(it => it.FileName)
    );
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
    if (!environment.production) {
      this.hotel = await this.storage.get("mock-hotel-detail");
      console.log(this.hotel);
      if (this.hotel) {
        this.initBgPic(this.hotel.FileName);
        return;
      }
    }
    if (this.hotelDetailSub) {
      this.hotelDetailSub.unsubscribe();
    }
    this.hotelDetailSub = this.hotelService
      .getHotelDetail(this.item)
      .pipe(
        map(res => res && res.Data),
        tap(r => {
          console.log(r);
        })
      )
      .subscribe(hotel => {
        if (hotel) {
          this.hotel = hotel.Hotel;
          if (this.hotel) {
            this.initBgPic(this.hotel.FileName);
            this.storage.set("mock-hotel-detail", this.hotel);
          }
        }
      });
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
  getRoomImages(room: RoomEntity) {
    const images = this.hotel && this.hotel.HotelImages;
    if (room && images) {
      const roomImages = images
        .filter(it => it.Room && it.Room.Id == room.Id)
        .map(it => it.FileName && it.FileName);
      return roomImages;
    }
  }
  getRoomArea(room: RoomEntity) {
    return (
      room && room.RoomDetails && room.RoomDetails.find(it => it.Tag == "Area")
    );
  }
  getFloor(room: RoomEntity) {
    return (
      room && room.RoomDetails && room.RoomDetails.find(it => it.Tag == "Floor")
    );
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
  segmentChanged(evt: CustomEvent) {
    if (evt.detail.value) {
      this.scrollToTab(evt.detail.value);
    }
  }
  private scrollToTab(tab: IHotelDetailTab) {
    if (tab == "houseInfo") {
      if (this.houseInfoEle && this.houseInfoEle.nativeElement) {
        const rect = this.houseInfoEle.nativeElement.getBoundingClientRect();
        if (rect) {
          this.scrollToPoint(rect.top);
        }
      }
    }
    if (tab == "hotelInfo") {
      if (this.hotelInfoEle && this.hotelInfoEle.nativeElement) {
        const rect = this.hotelInfoEle.nativeElement.getBoundingClientRect();
        if (rect) {
          this.scrollToPoint(rect.top);
        }
      }
    }
    if (tab == "trafficInfo") {
      if (this.trafficInfoEle && this.trafficInfoEle.nativeElement) {
        const rect = this.trafficInfoEle.nativeElement.getBoundingClientRect();
        if (rect) {
          this.scrollToPoint(rect.top);
        }
      }
    }
  }
  private scrollToPoint(y: number) {
    this.ionCnt.scrollToPoint(0, y, 100);
  }
  onBookRoomPlan(plan: RoomPlanEntity) {}
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
    if (plan && plan.VariablesJsonObj) {
      return plan.VariablesJsonObj["AvgPrice"];
    }
    if (plan && plan.Variables) {
      plan.VariablesJsonObj = JSON.parse(plan.Variables);
      return plan.VariablesJsonObj["AvgPrice"];
    }
  }
  onShowRoomDetails(room: RoomEntity) {
    this.curSelectedRoom = room;
    this.curSelectedRoom.Hotel = this.curSelectedRoom.Hotel || this.hotel;
    this.roomImages = this.getRoomImages(room);
    this.isShowRoomDetails = true;
  }
  onShowRoomImages(room: RoomEntity) {
    this.isShowRoomImages = true;
    this.roomImages = this.getRoomImages(room);
  }
  onBookRoom(room: RoomEntity, evt: MouseEvent) {
    evt.preventDefault();
    evt.stopPropagation();
  }
  onOpenMap() {}
  async ngAfterViewInit() {
    if (this.ionCnt) {
      this.scrollEle = await this.ionCnt.getScrollElement();
    }
    const config = await this.configService.get().catch(_ => null);
    this.initBgPic(
      (config && config.PrerenderImageUrl) || AppHelper.getDefaultLoadingImage()
    );
    setTimeout(() => {
      this.initEle();
    }, 1000);
  }
  onOpenCalendar() {
    this.hotelService.openCalendar();
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
          this.domCtrl.write(_ => {
            this.render.setStyle(
              this.headerEle.nativeElement,
              "opacity",
              opacity < 0.35 ? 0 : opacity
            );
          });
        });
      };
    }
  }
}
