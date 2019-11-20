import { TrainService } from 'src/app/train/train.service';
import { AppHelper } from './../../../appHelper';
import { ITrainInfo } from './../../train.service';
import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { TrainEntity, TrainSeatType } from "../../models/TrainEntity";
import { TrainSeatEntity } from "../../models/TrainSeatEntity";

@Component({
  selector: "app-train-list-item",
  templateUrl: "./train-list-item.component.html",
  styleUrls: ["./train-list-item.component.scss"]
})
export class TrainListItemComponent implements OnInit {
  @Input() selectSeatLocation: string;
  @Input() showBookBtn = true;
  @Input() seat: TrainSeatEntity;
  @Input() train: TrainEntity;
  @Input() bookInfo: ITrainInfo;
  @Output() scheduleEmit: EventEmitter<any>;
  @Output() bookTicket: EventEmitter<TrainSeatEntity>;
  @Output() seatPicker: EventEmitter<string>;
  TrainSeatType = TrainSeatType;
  constructor(private trainService: TrainService) {
    this.scheduleEmit = new EventEmitter();
    this.bookTicket = new EventEmitter();
    this.seatPicker = new EventEmitter();
  }
  getLowestSeatPrice() {
    if (!this.train || !this.train.Seats || !this.train.Seats.length) {
      return "";
    }
    this.train.Seats.sort((a, b) => +a.SalesPrice - +b.SalesPrice);
    return this.train.Seats[0].SalesPrice;
  }
  onBookTicket(seat: TrainSeatEntity) {
    if (this.getBookBtnColor(seat) == "danger") {
      if (seat && seat.Policy && seat.Policy.Rules) {
        let tip = '';
        const bookInfos = this.trainService.getBookInfos();
        if (bookInfos && bookInfos.length) {
          const info = bookInfos.find(it => it.bookInfo && it.bookInfo.id == (this.bookInfo && this.bookInfo.id));
          if (info && info.passenger && info.passenger.Policy) {
            tip = info.passenger.Policy.TrainIllegalTip ? `(${info.passenger.Policy.TrainIllegalTip})` : "";
          }
        }
        AppHelper.alert(seat.Policy.Rules.join(",") + tip);
      }
      return;
    }
    if (this.train) {
      this.train.BookSeatType = seat.SeatType;
    }
    this.bookTicket.emit(seat);
  }
  onSeatPicker(seat: string) {
    this.seatPicker.emit(seat);
  }
  getBookBtnColor(seat: TrainSeatEntity) {
    if (seat && seat.Policy) {
      if (!seat.Policy.IsAllowBook) {
        return "danger";
      }
      if (seat.Policy.Rules && seat.Policy.Rules.length > 0) {
        return "warning";
      }
      return "success";
    }
    return "secondary";
  }
  getSeats() {
    if (!this.train || !this.train.Seats || !this.train.Seats.length) {
      return [];
    }

    return this.train.Seats.filter(
      seat => +seat.Count > 0 && +seat.SalesPrice > 0
    );
  }
  ngOnInit() { }
  onScheduls(evt: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
    }
    this.scheduleEmit.emit();
  }
}
