import { HotelEntity } from "./../../models/HotelEntity";
import { switchMap, map, tap } from "rxjs/operators";
import { ConfigService } from "src/app/services/config/config.service";
import { ConfigEntity } from "./../../../services/config/config.entity";
import { LanguageHelper } from "src/app/languageHelper";
import { AppHelper } from "src/app/appHelper";
import { Observable, Subscription } from "rxjs";
import { HotelService, IHotelInfo } from "./../../hotel.service";
import { ModalController, IonRefresher } from "@ionic/angular";
import { Component, OnInit, ViewChild } from "@angular/core";
import { PassengerBookInfo } from "src/app/tmc/tmc.service";
import { RoomPlanEntity } from "../../models/RoomPlanEntity";
import { RoomEntity } from "../../models/RoomEntity";

@Component({
  selector: "app-hotel-room-bookedinfos",
  templateUrl: "./hotel-room-bookedinfos.component.html",
  styleUrls: ["./hotel-room-bookedinfos.component.scss"]
})
export class HotelRoomBookedinfosComponent implements OnInit{
  private changeDateBookInfo: PassengerBookInfo<IHotelInfo>;
  private hotelDetailSub = Subscription.EMPTY;
  bookInfos$: Observable<PassengerBookInfo<IHotelInfo>[]>;
  curSelectedRoom: RoomEntity;
  isShowRoomDetails = false;
  isShowChangeDateComp = false;
  roomImages: string[];
  config: ConfigEntity;
  @ViewChild(IonRefresher) ionRefresher: IonRefresher;
  constructor(
    private modalCtrl: ModalController,
    private hotelService: HotelService,
    private configService: ConfigService
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
        .filter(it => it.Room && it.Room.Id == bookInfo.bookInfo.hotelRoom.Id)
        .map(it => it.FileName && it.FileName);
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
      this.hotelService.removeBookInfo(bookInfo);
    }
  }
  async doRefresh(changeDateBookInfo: PassengerBookInfo<IHotelInfo> = null) {
    if (this.ionRefresher) {
      this.ionRefresher.complete();
    }
    if (!this.config) {
      this.config = await this.configService.get().catch(_ => null);
    }
    if (this.hotelDetailSub) {
      this.hotelDetailSub.unsubscribe();
    }
    const bookinfos = this.hotelService.getBookInfos();
    if (!changeDateBookInfo) {
      changeDateBookInfo = bookinfos[0];
    }
    if (!changeDateBookInfo || !changeDateBookInfo.bookInfo) {
      return;
    }
    this.hotelDetailSub = this.hotelService
      .getHotelDetail({
        Hotel: changeDateBookInfo.bookInfo.hotelEntity
      } as any)
      .pipe(
        map(res => res && res.Data),
        tap(r => {
          console.log(r);
        })
      )
      .subscribe(async hotel => {
        if (hotel) {
          this.checkIfBookedRoomPlan(
            hotel.Hotel,
            changeDateBookInfo ? [changeDateBookInfo] : bookinfos
          );
        }
      });
  }
  private checkIfBookedRoomPlan(
    hotel: HotelEntity,
    changeDateBookInfos: PassengerBookInfo<IHotelInfo>[]
  ) {
    const priceHasChanged: { roomPlan: RoomPlanEntity }[] = [];
    changeDateBookInfos.forEach(changeDateBookInfo => {
      if (changeDateBookInfo && changeDateBookInfo.bookInfo) {
        if (changeDateBookInfo.bookInfo.roomPlan && hotel && hotel.Rooms) {
          for (let i = 0; i < hotel.Rooms.length; i++) {
            const r = hotel.Rooms[i];
            const rp = r.RoomPlans.find(
              it => it.Id == changeDateBookInfo.bookInfo.roomPlan.Id
            );
            if (rp) {
              const old = this.hotelService.getAvgPrice(
                changeDateBookInfo.bookInfo.roomPlan
              );
              const cur = this.hotelService.getAvgPrice(rp);
              if (old !== cur) {
                priceHasChanged.push({ roomPlan: rp });
              }
              changeDateBookInfo.bookInfo.hotelRoom = r;
              changeDateBookInfo.bookInfo.roomPlan = rp;
            }
          }
        }
      }
    });
    // this.hotelService.setBookInfos(this.hotelService.getBookInfos());
    if (priceHasChanged.length) {
      AppHelper.alert("价格有变动");
    }
  }
  async nextStep() {}
  onChangeDate(bookInfo: PassengerBookInfo<IHotelInfo>) {
    if (bookInfo) {
      this.changeDateBookInfo = bookInfo;
    }
    this.isShowChangeDateComp = true;
  }
  async onConfirm() {
    await this.doRefresh(this.changeDateBookInfo);
    this.changeDateBookInfo = null;
  }
  onShowRoomDetail(bookInfo: PassengerBookInfo<IHotelInfo>) {
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
  }
  canGoToNext() {
    return true;
  }
  async ngOnInit() {
    this.config = await this.configService.get();
  }
}
