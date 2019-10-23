import { HotelQueryEntity } from './../../../models/HotelQueryEntity';
import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
export interface IRankItem {
  id: number;
  label: string;
  orderBy: "PriceAsc" | "PriceDesc";
  isSelected?: boolean;
  value: string;
}
@Component({
  selector: "app-recommend-rank",
  templateUrl: "./recommend-rank.component.html",
  styleUrls: ["./recommend-rank.component.scss"]
})
export class RecommendRankComponent implements OnInit {
  @Output() rank: EventEmitter<any>;
  @Input() hotelQuery: HotelQueryEntity;
  ranks: IRankItem[];
  selectedId: number;
  constructor() {
    this.rank = new EventEmitter();
  }
  onReset() {
    this.ranks = [];
    this.ranks.push({
      id: 0,
      label: "默认排序",
      value: "Category",
      orderBy: "PriceDesc",
      isSelected: true
    });
    // this.ranks.push({
    //   id: 1,
    //   label: "口碑高-低",
    //   value: "Grade",
    //   orderBy: "Desc"
    // });
    this.ranks.push({
      id: 2,
      label: "价格低-高",
      value: "Price",
      orderBy: "PriceAsc"
    });
    this.ranks.push({
      id: 3,
      label: "价格高-低",
      value: "Price",
      orderBy: "PriceDesc"
    });
    let rank = this.ranks.find(it => it.isSelected) || this.ranks[0];
    if (this.hotelQuery) {
      rank = this.ranks.find(it => it.orderBy == this.hotelQuery.Orderby) || rank;
    }
    rank.isSelected = true;
    this.selectedId = rank.id;
  }
  ngOnInit() {
    this.onReset();
  }
  onSelect(r: IRankItem) {
    this.ranks.forEach(it => {
      it.isSelected = it.id == r.id;
    });
    const one = this.ranks.find(it => it.isSelected);
    console.log(one);
    if (one) {
      this.rank.emit(one);
    }
  }
}
