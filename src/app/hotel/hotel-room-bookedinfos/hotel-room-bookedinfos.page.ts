import { Router } from "@angular/router";
import { CalendarService } from "src/app/tmc/calendar.service";
import { HotelEntity } from "../models/HotelEntity";
import { switchMap, map, tap } from "rxjs/operators";
import { ConfigService } from "src/app/services/config/config.service";
import { ConfigEntity } from "../../services/config/config.entity";
import { LanguageHelper } from "src/app/languageHelper";
import { AppHelper } from "src/app/appHelper";
import { Observable, Subscription } from "rxjs";
import { HotelService, IHotelInfo } from "../hotel.service";
import { ModalController, IonRefresher } from "@ionic/angular";
import {
  Component,
  OnInit,
  ViewChild,
  HostBinding,
  HostListener,
} from "@angular/core";
import { PassengerBookInfo } from "src/app/tmc/tmc.service";
import { RoomPlanEntity } from "../models/RoomPlanEntity";
import { RoomEntity } from "../models/RoomEntity";
import * as moment from "moment";
@Component({
  selector: "app-hotel-room-bookedinfos",
  templateUrl: "./hotel-room-bookedinfos.page.html",
  styleUrls: ["./hotel-room-bookedinfos.page.scss"],
})
export class HotelRoomBookedinfosPage implements OnInit {
  private changeDateBookInfo: PassengerBookInfo<IHotelInfo>;
  private hotelDetailSub = Subscription.EMPTY;
  bookInfos$: Observable<PassengerBookInfo<IHotelInfo>[]>;
  curSelectedRoom: RoomEntity;
  curSelectedBookInfo: PassengerBookInfo<IHotelInfo>;
  isShowRoomDetails = false;
  isShowChangeDateComp = false;
  @HostBinding("class.show-price-detail") isShowPriceDetail = false;
  roomImages: string[];
  config: ConfigEntity;
  @ViewChild(IonRefresher) ionRefresher: IonRefresher;
  dates: { date: string; price: string }[] = [];
  constructor(
    private modalCtrl: ModalController,
    private hotelService: HotelService,
    private calendarService: CalendarService,
    private configService: ConfigService,
    private router: Router
  ) {
    this.bookInfos$ = this.hotelService.getBookInfoSource();
  }
  async back() {
    const m = await this.modalCtrl.getTop();
    if (m) {
      m.dismiss();
    }
    this.hotelDetailSub.unsubscribe();
  }
  private getRoomImages(bookInfo: PassengerBookInfo<IHotelInfo>) {
    const images =
      bookInfo.bookInfo &&
      bookInfo.bookInfo.hotelEntity &&
      bookInfo.bookInfo.hotelEntity.HotelImages;
    if (images && bookInfo.bookInfo.hotelRoom) {
      const roomImages = images
        .filter((it) => it.Room && it.Room.Id == bookInfo.bookInfo.hotelRoom.Id)
        .map((it) => it.FullFileName || it.FileName);
      return roomImages;
    }
  }
  async onRemoveBookInfo(bookInfo: PassengerBookInfo<IHotelInfo>) {
    const a = await AppHelper.alert(
      LanguageHelper.getConfirmDeleteTip(),
      true,
      LanguageHelper.getConfirmTip(),
      LanguageHelper.getCancelTip()
    );
    if (a) {
      this.hotelService.removeBookInfo(bookInfo, false);
    }
  }
  calcNights() {
    const info = this.curSelectedBookInfo;
    if (
      info &&
      info.bookInfo &&
      info.bookInfo.roomPlan &&
      info.bookInfo.roomPlan.BeginDate &&
      info.bookInfo.roomPlan.EndDate
    ) {
      return moment(info.bookInfo.roomPlan.EndDate).diff(
        info.bookInfo.roomPlan.BeginDate,
        "days"
      );
    }
  }
  private initDayPrice() {
    const bookInfos = this.hotelService.getBookInfos();
    this.curSelectedBookInfo = bookInfos[0];
    if (
      this.curSelectedBookInfo &&
      this.curSelectedBookInfo.bookInfo &&
      this.curSelectedBookInfo.bookInfo.roomPlan
    ) {
      this.dates = (
        this.curSelectedBookInfo.bookInfo.roomPlan.RoomPlanPrices || []
      ).map((it) => {
        return {
          date: it.Date && it.Date.substr(0, 10),
          price: it.Price,
        };
      });
    }
  }
  onShowPriceDetails(evt: {
    isShow: boolean;
    bookInfo?: PassengerBookInfo<IHotelInfo>;
  }) {
    if (evt.bookInfo) {
      this.curSelectedBookInfo = evt.bookInfo;
    }
    if (evt.isShow) {
      this.dates = [];
      if (
        this.curSelectedBookInfo &&
        this.curSelectedBookInfo.bookInfo &&
        this.curSelectedBookInfo.bookInfo.roomPlan &&
        this.curSelectedBookInfo.bookInfo.roomPlan.BeginDate
      ) {
        this.initDayPrice();
      }
    }
    this.isShowPriceDetail = evt.isShow;
  }
  async doRefresh() {
    if (this.ionRefresher) {
      this.ionRefresher.complete();
    }
    if (!this.config) {
      this.config = await this.configService.get().catch((_) => null);
    }
    if (this.hotelDetailSub) {
      this.hotelDetailSub.unsubscribe();
    }
    if (!this.changeDateBookInfo || !this.changeDateBookInfo.bookInfo) {
      return;
    }
    // this.hotelDetailSub = this.hotelService
    //   .getHotelDetail({
    //     Hotel: this.changeDateBookInfo.bookInfo.hotelEntity,
    //   } as any)
    //   .pipe(
    //     map((res) => res && res.Data),
    //     tap((r) => {
    //       console.log(r);
    //     })
    //   )
    //   .subscribe(async (hotel) => {
    //     if (hotel) {
    //       this.checkIfBookedRoomPlan(hotel.Hotel);
    //     }
    //   });
  }
  private checkIfBookedRoomPlan(hotel: HotelEntity) {
    const priceHasChanged: { roomPlan: RoomPlanEntity }[] = [];
    const changeDateBookInfo = this.changeDateBookInfo;
    if (!changeDateBookInfo || !this.changeDateBookInfo.bookInfo) {
      return;
    }
    if (changeDateBookInfo && changeDateBookInfo.bookInfo) {
      if (changeDateBookInfo.bookInfo.roomPlan && hotel && hotel.Rooms) {
        const r = hotel.Rooms.find(
          (it) => it.Id == changeDateBookInfo.bookInfo.hotelRoom.Id
        );
        if (r) {
          const rp = r.RoomPlans.find(
            (it) =>
              this.hotelService.getRoomPlanUniqueId(
                changeDateBookInfo.bookInfo.roomPlan
              ) == this.hotelService.getRoomPlanUniqueId(it)
          );
          if (rp) {
            const old = changeDateBookInfo.bookInfo.roomPlan.TotalAmount;
            const cur = rp.TotalAmount;
            if (old !== cur) {
              priceHasChanged.push({ roomPlan: rp });
            }
            changeDateBookInfo.bookInfo.hotelRoom = r;
            changeDateBookInfo.bookInfo.roomPlan = rp;
            const bookinfos = this.hotelService.getBookInfos().map((it) => {
              if (it.id == changeDateBookInfo.id) {
                it = changeDateBookInfo;
              }
              return it;
            });
            this.hotelService.setBookInfos(bookinfos);
          }
        } else {
          const old = changeDateBookInfo.bookInfo.roomPlan.TotalAmount;
          const totalDays = this.calendarService
            .getMoment(0, changeDateBookInfo.bookInfo.roomPlan.EndDate)
            .diff(changeDateBookInfo.bookInfo.roomPlan.BeginDate, "days");
        }
      }
    }
    if (priceHasChanged.length) {
      AppHelper.alert(
        `?????????????????????????????????${this.changeDateBookInfo.bookInfo.roomPlan.TotalAmount}`
      );
    }
    this.changeDateBookInfo = null;
  }
  async nextStep() {
    await this.router.navigate([AppHelper.getRoutePath("hotel-book")]);
    await this.hotelService.dismissAllTopOverlays();
  }
  onbedChange(bed: string, bookInfo: PassengerBookInfo<IHotelInfo>) {
    if (bookInfo && bookInfo.bookInfo && bookInfo.bookInfo.roomPlan) {
      bookInfo.bookInfo.roomPlan.Remark = bed;
    }
  }
  onChangeDate(bookInfo: PassengerBookInfo<IHotelInfo>) {
    this.curSelectedBookInfo = bookInfo;
    console.log("onChangeDate", bookInfo);
    if (bookInfo) {
      this.changeDateBookInfo = bookInfo;
    }
    this.isShowChangeDateComp = true;
  }
  async onConfirm() {
    console.log("onConfirm dorefresh");
    await this.doRefresh();
  }
  async onOpenCalendar(checkInDate: string) {
    const days = await this.hotelService.openCalendar({
      checkInDate: this.calendarService.generateDayModelByDate(checkInDate),
    });
    if (days && days.length) {
      setTimeout(() => {
        console.log("???????????????", days, "onConfirm");
        this.onConfirm();
      }, 100);
    }
  }
  onShowRoomDetail(bookInfo: PassengerBookInfo<IHotelInfo>) {
    this.curSelectedBookInfo = bookInfo;
    this.curSelectedRoom = bookInfo.bookInfo.hotelRoom;
    this.curSelectedRoom.Hotel =
      this.curSelectedRoom.Hotel || bookInfo.bookInfo.hotelEntity;
    this.roomImages = this.getRoomImages(bookInfo);
    if (!this.roomImages || this.roomImages.length === 0) {
      if (this.config && this.config.DefaultImageUrl) {
        this.roomImages = [this.config.DefaultImageUrl];
      }
    }
    this.isShowRoomDetails = true;
    this.hotelService.showRoomDetailInfo = {
      hotel: bookInfo.bookInfo.hotelEntity,
      room: bookInfo.bookInfo.hotelRoom,
      roomImages: this.roomImages,
      config: this.config,
      // agent: this.agent
    };
    this.router.navigate(["hotel-room-detail"]);
  }
  canGoToNext() {
    return true;
  }
  async ngOnInit() {
    this.config = await this.configService.get().catch((_) => null);
  }
  @HostListener("click")
  closePriceDetail() {
    this.isShowPriceDetail = false;
  }
}
