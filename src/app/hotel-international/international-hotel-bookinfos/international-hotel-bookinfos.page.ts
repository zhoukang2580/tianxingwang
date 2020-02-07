import { InternationalHotelService } from "./../international-hotel.service";
import {
  Component,
  OnInit,
  HostBinding,
  ViewChild,
  HostListener
} from "@angular/core";
import { PassengerBookInfo } from "src/app/tmc/tmc.service";
import { Subscription, Observable } from "rxjs";
import { ConfigEntity } from "src/app/services/config/config.entity";
import { IonRefresher, ModalController } from "@ionic/angular";
import { CalendarService } from "src/app/tmc/calendar.service";
import { ConfigService } from "src/app/services/config/config.service";
import { Router } from "@angular/router";
import { AppHelper } from "src/app/appHelper";
import { LanguageHelper } from "src/app/languageHelper";
import * as moment from "moment";
import { map, tap } from "rxjs/operators";
import { IInterHotelInfo } from "../international-hotel.service";
import { RoomEntity } from 'src/app/hotel/models/RoomEntity';
import { HotelEntity } from 'src/app/hotel/models/HotelEntity';
import { RoomPlanEntity } from 'src/app/hotel/models/RoomPlanEntity';

@Component({
  selector: "app-international-hotel-bookinfos",
  templateUrl: "./international-hotel-bookinfos.page.html",
  styleUrls: ["./international-hotel-bookinfos.page.scss"]
})
export class InternationalHotelBookinfosPage implements OnInit {
  private changeDateBookInfo: PassengerBookInfo<IInterHotelInfo>;
  private hotelDetailSub = Subscription.EMPTY;
  bookInfos$: Observable<PassengerBookInfo<IInterHotelInfo>[]>;
  curSelectedRoom: RoomEntity;
  curSelectedBookInfo: PassengerBookInfo<IInterHotelInfo>;
  isShowRoomDetails = false;
  isShowChangeDateComp = false;
  @HostBinding("class.show-price-detail") isShowPriceDetail = false;
  roomImages: string[];
  config: ConfigEntity;
  @ViewChild(IonRefresher, { static: false }) ionRefresher: IonRefresher;
  dates: { date: string; price: string }[] = [];
  constructor(
    private modalCtrl: ModalController,
    private hotelService: InternationalHotelService,
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
  private getRoomImages(bookInfo: PassengerBookInfo<IInterHotelInfo>) {
    const images =
      bookInfo.bookInfo &&
      bookInfo.bookInfo.hotelEntity &&
      bookInfo.bookInfo.hotelEntity.HotelImages;
    if (images && bookInfo.bookInfo.hotelRoom) {
      const roomImages = images
        .filter(it => it.Room && it.Room.Id == bookInfo.bookInfo.hotelRoom.Id)
        .map(it => it.FileName && it.FileName);
      return roomImages;
    }
  }
  async onRemoveBookInfo(bookInfo: PassengerBookInfo<IInterHotelInfo>) {
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
  onShowPriceDetails(evt: {
    isShow: boolean;
    bookInfo?: PassengerBookInfo<IInterHotelInfo>;
  }) {
    if(evt.bookInfo){
      this.curSelectedBookInfo = evt.bookInfo;
    }
    if (evt.isShow) {
      this.dates = [];
      const n = this.calcNights();
      if (
        this.curSelectedBookInfo &&
        this.curSelectedBookInfo.bookInfo &&
        this.curSelectedBookInfo.bookInfo.roomPlan &&
        this.curSelectedBookInfo.bookInfo.roomPlan.BeginDate
      ) {
        for (let i = 0; i < n; i++) {
          this.dates.push({
            date: moment(this.curSelectedBookInfo.bookInfo.roomPlan.BeginDate)
              .add(i, "days")
              .format("YYYY-MM-DD"),
            price: this.hotelService.getAvgPrice(
              this.curSelectedBookInfo.bookInfo.roomPlan
            )
          });
        }
      }
    }
    this.isShowPriceDetail = evt.isShow;
  }
  async doRefresh() {
    if (this.ionRefresher) {
      this.ionRefresher.complete();
    }
    if (!this.config) {
      this.config = await this.configService.get().catch(_ => null);
    }
    if (this.hotelDetailSub) {
      this.hotelDetailSub.unsubscribe();
    }
    if (!this.changeDateBookInfo || !this.changeDateBookInfo.bookInfo) {
      return;
    }
    this.hotelDetailSub = this.hotelService
      .getHotelDetail(this.changeDateBookInfo.bookInfo.hotelEntity.Id)
      .pipe(
        tap(r => {
          console.log(r);
        })
      )
      .subscribe(async hotel => {
        if (hotel) {
          this.checkIfBookedRoomPlan(hotel);
        }
      });
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
          it => it.Id == changeDateBookInfo.bookInfo.hotelRoom.Id
        );
        if (r) {
          const rp = r.RoomPlans.find(
            it => it.Number == changeDateBookInfo.bookInfo.roomPlan.Number
          );
          if (rp) {
            const old = changeDateBookInfo.bookInfo.roomPlan.TotalAmount;
            const cur = rp.TotalAmount;
            if (old !== cur) {
              priceHasChanged.push({ roomPlan: rp });
            }
            changeDateBookInfo.bookInfo.hotelRoom = r;
            changeDateBookInfo.bookInfo.roomPlan = rp;
            const bookinfos = this.hotelService.getBookInfos().map(it => {
              if (it.id == changeDateBookInfo.id) {
                it = changeDateBookInfo;
              }
              return it;
            });
            this.hotelService.setBookInfos(bookinfos);
          }
        }
      }
    }
    if (priceHasChanged.length) {
      AppHelper.alert(
        `总价格有变动，当前总价${this.changeDateBookInfo.bookInfo.roomPlan.TotalAmount}`
      );
    }
    this.changeDateBookInfo = null;
  }
  async nextStep() {
    await this.router.navigate([AppHelper.getRoutePath("inter-hotel-book")]);
    await this.hotelService.dismissAllTopOverlays();
  }
  onbedChange(bed: string, bookInfo: PassengerBookInfo<IInterHotelInfo>) {
    if (bookInfo && bookInfo.bookInfo && bookInfo.bookInfo.roomPlan) {
      bookInfo.bookInfo.roomPlan.Remark = bed;
    }
  }
  onChangeDate(bookInfo: PassengerBookInfo<IInterHotelInfo>) {
    this.curSelectedBookInfo = bookInfo;
    console.log("onChangeDate", bookInfo);
    if (bookInfo) {
      this.changeDateBookInfo = bookInfo;
    }
    this.isShowChangeDateComp = true;
  }
  async onConfirm(evt: { checkInDate: string; checkOutDate: string }) {
    if (
      evt &&
      this.changeDateBookInfo &&
      this.changeDateBookInfo.bookInfo &&
      this.changeDateBookInfo.bookInfo.roomPlan
    ) {
      this.changeDateBookInfo.bookInfo.roomPlan.BeginDate = evt.checkInDate;
      this.changeDateBookInfo.bookInfo.roomPlan.EndDate = evt.checkOutDate;
    }
    await this.doRefresh();
  }
  async onOpenCalendar(checkInDate: string) {
    const days = await this.hotelService.openCalendar(
      this.calendarService.generateDayModelByDate(checkInDate)
    );
    if (days && days.length > 1) {
      setTimeout(() => {
        console.log("选择的日期", days, "onConfirm");
        this.onConfirm({
          checkInDate: days[0].date,
          checkOutDate: days[1].date
        });
      }, 100);
    }
  }
  onShowRoomDetail(bookInfo: PassengerBookInfo<IInterHotelInfo>) {
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
      config: this.config
      // agent: this.agent
    };
    this.router.navigate(["international-room-detail"]);
  }
  canGoToNext() {
    return true;
  }
  async ngOnInit() {
    this.config = await this.configService.get().catch(_ => null);
  }
  @HostListener("click")
  closePriceDetail() {
    this.isShowPriceDetail = false;
  }
}
