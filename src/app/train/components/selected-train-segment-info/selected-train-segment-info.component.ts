import { StaffService } from "./../../../hr/staff.service";
import { TrainSeatEntity } from "./../../models/TrainSeatEntity";
import { TrainService, TrainPolicyModel } from "./../../train.service";
import { CalendarService } from "./../../../tmc/calendar.service";
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
import { tap, map } from "rxjs/operators";
@Component({
  selector: "app-selected-train-segment-info",
  templateUrl: "./selected-train-segment-info.component.html",
  styleUrls: ["./selected-train-segment-info.component.scss"]
})
export class SelectedTrainSegmentInfoComponent implements OnInit {
  bookInfos$: Observable<PassengerBookInfo[]>;
  showSelectReturnTrip$ = of(false);
  constructor(
    private modalCtrl: ModalController,
    private calendarService: CalendarService,
    private trainService: TrainService,
    private staffService: StaffService
  ) {}
  async back() {
    const t = await this.modalCtrl.getTop();
    if (t) {
      t.dismiss().catch(_ => 0);
    }
  }
  ngOnInit() {
    this.bookInfos$ = this.trainService.getBookInfoSource().pipe(
      tap(infos => {
        console.log("bookinfos", infos);
      })
    );
    this.showSelectReturnTrip$ = combineLatest([
      from(this.staffService.isSelfBookType()),
      this.trainService.getSearchTrainModelSource()
    ]).pipe(map(([isSelf, s]) => isSelf && s && s.isRoundTrip));
  }
  async onSelectReturnTrip(bookInfo: PassengerBookInfo) {
    await this.trainService.selectReturnTrip();
  }
  nextStep() {}
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
    if (!info) {
      return "";
    }
    return `[${
      info.tripType == TripType.departureTrip
        ? LanguageHelper.getDepartureTip()
        : LanguageHelper.getReturnTripTip()
    }]`;
  }
  remove(bookInfo: PassengerBookInfo) {
    this.trainService.removeBookInfo(bookInfo);
  }
  async reelect(bookInfo: PassengerBookInfo) {
    await this.trainService.reelectBookInfo(bookInfo);
    return true;
  }
}
