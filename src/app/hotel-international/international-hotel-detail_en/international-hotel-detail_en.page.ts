import { fadeInOut } from "./../../animations/fadeInOut";
import { flyInOut } from "./../../animations/flyInOut";
import {
  Component, EventEmitter,
} from "@angular/core";
// tslint:disable-next-line: max-line-length
import { InternationalHotelDetailPage } from '../international-hotel-detail/international-hotel-detail.page';
import { of } from 'rxjs/internal/observable/of';
import { RoomPlanEntity } from 'src/app/hotel/models/RoomPlanEntity';
import { RoomEntity } from 'src/app/hotel/models/RoomEntity';
import { FlightHotelTrainType, PassengerBookInfo } from 'src/app/tmc/tmc.service';
import { IHotelInfo } from 'src/app/hotel/hotel.service';
import { AppHelper } from 'src/app/appHelper';
import { LanguageHelper } from 'src/app/languageHelper';
import { SelectPassengerPage } from 'src/app/tmc/select-passenger/select-passenger.page';
import { SelectPassengerEnPage } from 'src/app/tmc/select-passenger_en/select-passenger_en.page';

@Component({
  selector: "app-international-hotel-detail_em",
  templateUrl: "./international-hotel-detail_en.page.html",
  styleUrls: ["./international-hotel-detail_en.page.scss"],
  animations: [flyInOut, fadeInOut],
})
export class InternationalHotelDetailEnPage extends InternationalHotelDetailPage{
  isShowAddPassenger$ = of(false);
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
      component: SelectPassengerEnPage,
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
  public onShowBookInfos() {
    this.router.navigate(["international-hotel-bookinfos_en"]);
  }
}
