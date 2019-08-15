import { TrainService } from "./../../train.service";
import { CalendarService } from "./../../../tmc/calendar.service";
import { ModalController } from "@ionic/angular";
import { Observable } from "rxjs";
import { EventEmitter } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { PassengerBookInfo } from "src/app/tmc/tmc.service";
import * as moment from "moment";
import { TrainEntity } from "../../models/TrainEntity";
import { TripType } from "src/app/tmc/models/TripType";
import { ITrainInfo } from "../../train.service";
import { LanguageHelper } from "src/app/languageHelper";
@Component({
  selector: "app-selected-train-segment-info",
  templateUrl: "./selected-train-segment-info.component.html",
  styleUrls: ["./selected-train-segment-info.component.scss"]
})
export class SelectedTrainSegmentInfoComponent implements OnInit {
  bookInfos$: Observable<PassengerBookInfo[]>;
  private dayOfWeekNames: any;
  constructor(
    private modalCtrl: ModalController,
    private calendarService: CalendarService,
    private trainService: TrainService
  ) {}
  async back() {
    const t = await this.modalCtrl.getTop();
    if (t) {
      t.dismiss().catch(_ => 0);
    }
  }
  ngOnInit() {
    this.dayOfWeekNames = this.calendarService.getDayOfWeekNames();
    this.bookInfos$ = this.trainService.getBookInfoSource();
  }
  getDate(s: TrainEntity) {
    if (!s) {
      return "";
    }
    const day = this.calendarService.generateDayModel(moment(s.TravelTime));
    return `${day.date} ${day.dayOfWeekName}`;
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
  onSelectLowestSegment() {}
}
