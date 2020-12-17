import { StaffService } from "../../../hr/staff.service";
import { TrainSeatEntity } from "../../models/TrainSeatEntity";
import { TrainService, TrainPolicyModel } from "../../train.service";
import { CalendarService } from "../../../tmc/calendar.service";
import { ModalController } from "@ionic/angular";
import { Observable, of, combineLatest, from } from "rxjs";
import { EventEmitter } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { PassengerBookInfo } from "src/app/tmc/tmc.service";
import * as moment from "moment";
import { TrainEntity } from "../../models/TrainEntity";
import { TripType } from "src/app/tmc/models/TripType";
import { ITrainInfo } from "../../train.service";
import { LanguageHelper } from "src/app/languageHelper";
import { tap, map, filter } from "rxjs/operators";
import { AppHelper } from "src/app/appHelper";
import { Router } from "@angular/router";
@Component({
  selector: "app-selected-train-segment-info-df",
  templateUrl: "./selected-train-segment-info-df.component.html",
  styleUrls: ["./selected-train-segment-info-df.component.scss"]
})
export class SelectedTrainSegmentInfoDfComponent implements OnInit {
  bookInfos$: Observable<PassengerBookInfo<ITrainInfo>[]>;
  showSelectReturnTrip$ = of(false);
  TripType = TripType;
  isExchange = false;
  isSelf = false;
  constructor(
    private modalCtrl: ModalController,
    private calendarService: CalendarService,
    private trainService: TrainService,
    private staffService: StaffService,
    private router: Router
  ) { }
  async back() {
    const t = await this.modalCtrl.getTop();
    if (t) {
      t.dismiss().catch(_ => 0);
    }
  }
  ngOnInit() {
    this.staffService.isSelfBookType().then(is => {
      this.isSelf = is;
    });
    this.bookInfos$ = this.trainService.getBookInfoSource().pipe(
      tap(infos => {
        console.log("bookinfos", infos);
        setTimeout(() => {
          this.isExchange = !!infos.find(it => it.bookInfo && it.bookInfo.isExchange);
        }, 0);
      })
    );
    this.showSelectReturnTrip$ = combineLatest([
      from(this.staffService.isSelfBookType()),
      this.trainService.getSearchTrainModelSource(),
      this.trainService.getBookInfoSource()
    ]).pipe(
      map(([isSelf, s, bookInfos]) => {
        return (
          isSelf &&
          s &&
          s.isRoundTrip &&
          bookInfos &&
          (bookInfos.length &&
            !bookInfos.find(
              it => it.bookInfo && it.bookInfo.tripType == TripType.returnTrip
            ))
        );
      })
    );
  }
  onSeatPicked(location: string, bookInfo: PassengerBookInfo<ITrainInfo>) {
    if (bookInfo && bookInfo.bookInfo && bookInfo.bookInfo.trainEntity) {
      bookInfo.bookInfo.trainEntity.BookSeatLocation = location;
    }
  }
  async onSelectReturnTrip(bookInfo: PassengerBookInfo<ITrainInfo>) {
    await this.trainService.selectReturnTrip();
  }
  nextStep() {
    this.trainService.dismissAllTopOverlays();
    this.router.navigate([AppHelper.getRoutePath("train-book")]);
  }
  getDate(s: TrainEntity) {
    if (!s) {
      return "";
    }
    const day = this.calendarService.generateDayModel(moment(s.StartTime));
    return `${day.date} ${day.dayOfWeekName}`;
  }
  getSeatPrice(info: ITrainInfo) {
    if (info && info.trainEntity && info.trainEntity.Seats) {
      const s = info.trainEntity.Seats.find(
        s => s.SeatType == info.trainPolicy.SeatType
      );
      return s && s.SalesPrice;
    }
    return "";
  }
  getTripTypeTip(info: ITrainInfo) {
    if (!info || !this.isSelf) {
      return "";
    }
    return `[${
      info.tripType == TripType.departureTrip
        ? LanguageHelper.getDepartureTip()
        : LanguageHelper.getReturnTripTip()
      }]`;
  }
  canGoToNext() {
    return (
      this.trainService.getBookInfos().filter(it => !!it.bookInfo).length > 0
    );
  }
  remove(bookInfo: PassengerBookInfo<ITrainInfo>) {
    this.trainService.removeBookInfo(bookInfo, false);
  }
  // async reelect(bookInfo: PassengerBookInfo<ITrainInfo>) {
  //   await this.trainService.reelectBookInfo(bookInfo);
  //   return true;
  // }

  reelect(){
    this.back();
  }
}
