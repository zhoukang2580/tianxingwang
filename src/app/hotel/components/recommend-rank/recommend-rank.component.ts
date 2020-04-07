import { ModalController } from "@ionic/angular";
import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { HotelService } from "src/app/hotel/hotel.service";
import { HotelQueryEntity, IRankItem } from "../../models/HotelQueryEntity";
@Component({
  selector: "app-recommend-rank",
  templateUrl: "./recommend-rank.component.html",
  styleUrls: ["./recommend-rank.component.scss"]
})
export class RecommendRankComponent implements OnInit {
  @Output() rank: EventEmitter<any>;
  hotelQuery: HotelQueryEntity;
  selectedItem: any;
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
      id: 0,
      label: "星级【低-高↑】",
      value: "Category",
      orderBy: "CategoryAsc",
      isSelected: true
    });
    this.hotelQuery.ranks.push({
      id: 1,
      label: "星级【高-低↓】",
      value: "Category",
      orderBy: "CategoryDesc",
      isSelected: false
    });
    this.hotelQuery.ranks.push({
      id: 2,
      label: "价格【低-高↑】",
      value: "Price",
      orderBy: "PriceAsc"
    });
    this.hotelQuery.ranks.push({
      id: 3,
      label: "价格【高-低↓】",
      value: "Price",
      orderBy: "PriceDesc"
    });
    let rank =
      this.hotelQuery.ranks.find(it => it.isSelected) ||
      this.hotelQuery.ranks[0];
    if (this.hotelQuery) {
      rank =
        this.hotelQuery.ranks.find(
          it => it.orderBy == this.hotelQuery.Orderby
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
    this.selectedItem = r;
    this.hotelQuery.ranks = this.hotelQuery.ranks.map(it => {
      it.isSelected = it.id == r.id;
      return it;
    });
    this.hotelQuery.Orderby = r.orderBy;
    this.hotelService.setHotelQuerySource(this.hotelQuery);
    this.rank.emit();
    this.modalCtrl.getTop().then(t => {
      if (t) {
        t.dismiss();
      }
    });
  }
}
