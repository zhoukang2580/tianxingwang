import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { TrainEntity, TrainSeatType } from "../../models/TrainEntity";
import { TrainSeatEntity } from "../../models/TrainSeatEntity";

@Component({
  selector: "app-train-list-item",
  templateUrl: "./train-list-item.component.html",
  styleUrls: ["./train-list-item.component.scss"]
})
export class TrainListItemComponent implements OnInit {
  @Input() seat: TrainSeatEntity;
  @Input() train: TrainEntity;
  @Output() scheduleEmit: EventEmitter<any>;
  @Output() bookTicket: EventEmitter<TrainSeatEntity>;
  TrainSeatType = TrainSeatType;
  constructor() {
    this.scheduleEmit = new EventEmitter();
    this.bookTicket = new EventEmitter();
  }
  getLowestSeatPrice() {
    if (!this.train || !this.train.Seats || !this.train.Seats.length) {
      return "";
    }
    this.train.Seats.sort((a, b) => +a.SalesPrice - +b.SalesPrice);
    return this.train.Seats[0].SalesPrice;
  }
  onBookTicket(seat: TrainSeatEntity) {
    this.bookTicket.emit(seat);
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
  ngOnInit() {}
  onScheduls() {
    this.scheduleEmit.emit();
  }
}
