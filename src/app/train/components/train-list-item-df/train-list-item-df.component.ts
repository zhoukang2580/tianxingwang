import { TrainService } from "src/app/train/train.service";
import { AppHelper } from "./../../../appHelper";
import { ITrainInfo } from "./../../train.service";
import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { TrainEntity, TrainSeatType } from "../../models/TrainEntity";
import { TrainSeatEntity } from "../../models/TrainSeatEntity";
import { LanguageHelper } from "src/app/languageHelper";

@Component({
  selector: "app-train-list-item-df",
  templateUrl: "./train-list-item-df.component.html",
  styleUrls: ["./train-list-item-df.component.scss"],
})
export class TrainListItemDfComponent implements OnInit {
  @Input() isShowSelectSeatLocation: boolean = true;
  @Input() selectSeatLocation: string;
  @Input() showBookBtn = true;
  @Input() seat: TrainSeatEntity;
  @Input() train: TrainEntity;
  @Input() bookInfo: ITrainInfo;
  @Input() langOpt: any = {
    about: "约",
    time: "时",
    minute: "分",
    isStopInfo: "经停信息",
    has: "有",
    no: "无",
    Left: "余票",
    agreement: "协",
    agreementDesc: "协议价",
    reserve: "预订",
  };
  @Output() scheduleEmit: EventEmitter<any>;
  @Output() bookTicket: EventEmitter<TrainSeatEntity>;
  @Output() seatPicker: EventEmitter<string>;
  TrainSeatType = TrainSeatType;

  constructor(private trainService: TrainService) {
    this.scheduleEmit = new EventEmitter();
    this.bookTicket = new EventEmitter();
    this.seatPicker = new EventEmitter();
  }
  onShowTip(evt: CustomEvent) {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    AppHelper.toast(
      LanguageHelper.Train.getCanSwipeIdCardTip(),
      2000,
      "middle"
    );
  }
  getLowestSeatPrice() {
    if (!this.train || !this.train.Seats || !this.train.Seats.length) {
      return "";
    }
    this.train.Seats.sort((a, b) => +a.SalesPrice - +b.SalesPrice);
    return this.train.Seats[0].SalesPrice;
  }
  showOpenCloseIcon() {
    return (
      this.train &&
      this.train.Seats &&
      this.train.Seats.some((it) => +it.Count > 0)
    );
  }
  onShowSeats(train: TrainEntity) {
    if (!train || train.Seats.every((it) => +it.Count <= 0)) {
      return;
    }
    train.isShowSeats = !train.isShowSeats;
  }
  onBookTicket(seat: TrainSeatEntity) {
    if (seat && +seat.Count <= 0) {
      AppHelper.alert("余票不足!");
      return;
    }
    if ((seat && seat.color) == "danger") {
      if (seat && seat.Policy && seat.Policy.Rules) {
        let tip = "";
        const bookInfos = this.trainService.getBookInfos();
        if (bookInfos && bookInfos.length) {
          const info = bookInfos.find(
            (it) =>
              it.bookInfo &&
              it.bookInfo.id == (this.bookInfo && this.bookInfo.id)
          );
          if (info && info.passenger && info.passenger.Policy) {
            tip = info.passenger.Policy.TrainIllegalTip
              ? `(${info.passenger.Policy.TrainIllegalTip})`
              : "";
          }
        }
      }
    }
    if (this.train) {
      this.train.BookSeatType = seat.SeatType;
    }
    this.bookTicket.emit(seat);
  }
  onSeatPicker(seat: string) {
    this.seatPicker.emit(seat);
  }
  getSeats() {
    if (!this.train || !this.train.Seats || !this.train.Seats.length) {
      return [];
    }

    return this.train.Seats;
  }
  ngOnInit() {}
  onScheduls(evt: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
    }
    this.scheduleEmit.emit();
  }
}
