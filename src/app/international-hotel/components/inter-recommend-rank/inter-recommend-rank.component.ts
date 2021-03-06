import { ModalController } from "@ionic/angular";
import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { HotelService } from "src/app/hotel/hotel.service";
import {
  HotelQueryEntity,
  IRankItem,
} from "src/app/hotel/models/HotelQueryEntity";
@Component({
  selector: "app-inter-recommend-rank",
  templateUrl: "./inter-recommend-rank.component.html",
  styleUrls: ["./inter-recommend-rank.component.scss"],
})
export class InterRecommendRankComponent implements OnInit {
  @Output() rank: EventEmitter<any>;
  hotelQuery: HotelQueryEntity;
  constructor(
    private hotelService: HotelService,
    private modalCtrl: ModalController
  ) {
    this.rank = new EventEmitter();
    this.hotelQuery = this.hotelService.getHotelQueryModel();
  }
  onReset() {
    this.hotelQuery.ranks = [];
    this.hotelQuery.ranks.push({
      id: 2,
      label: "低价优先",
      value: "Price",
      orderBy: "PriceAsc",
    });
    this.hotelQuery.ranks.push({
      id: 3,
      label: "高价优先",
      value: "Price",
      orderBy: "PriceDesc",
    });
    this.hotelQuery.ranks.push({
      id: 0,
      label: "星级升序",
      value: "Category",
      orderBy: "CategoryAsc",
      isSelected: true,
    });
    this.hotelQuery.ranks.push({
      id: 1,
      label: "星级倒叙",
      value: "Category",
      orderBy: "CategoryDesc",
      isSelected: false,
    });
    // this.hotelQuery.ranks.push({
    //   id: 3,
    //   label: "价格【高-低↓】",
    //   value: "Price",
    //   orderBy: "PriceDesc"
    // });
    // this.hotelQuery.ranks.push({
    //   id: 2,
    //   label: "价格【低-高↑】",
    //   value: "Price",
    //   orderBy: "PriceAsc"
    // });
    // this.hotelQuery.ranks.push({
    //   id: 1,
    //   label: "星级【高-低↓】",
    //   value: "Category",
    //   orderBy: "CategoryDesc",
    //   isSelected: false
    // });
    // this.hotelQuery.ranks.push({
    //   id: 0,
    //   label: "星级【低-高↑】",
    //   value: "Category",
    //   orderBy: "CategoryAsc",
    //   isSelected: true
    // });
    let rank =
      this.hotelQuery.ranks.find((it) => it.isSelected) ||
      this.hotelQuery.ranks[0];
    if (this.hotelQuery) {
      rank =
        this.hotelQuery.ranks.find(
          (it) => it.orderBy == this.hotelQuery.Orderby
        ) || rank;
    }
    rank.isSelected = true;
    this.hotelService.setHotelQuerySource(this.hotelQuery);
  }
  ngOnInit() {
    if (
      this.hotelQuery &&
      (!this.hotelQuery.ranks || this.hotelQuery.ranks.length == 0)
    ) {
      this.onReset();
    }
  }
  onSelect(r: IRankItem) {
    this.hotelQuery.ranks = this.hotelQuery.ranks.map((it) => {
      it.isSelected = it.id == r.id;
      return it;
    });
    this.hotelService.setHotelQuerySource(this.hotelQuery);
    this.rank.emit(r);
    this.modalCtrl.getTop().then((t) => {
      if (t) {
        t.dismiss();
      }
    });
  }
}
