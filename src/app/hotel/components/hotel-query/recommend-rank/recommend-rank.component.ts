import { HotelQueryEntity } from './../../../models/HotelQueryEntity';
import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { HotelService } from 'src/app/hotel/hotel.service';
@Component({
  selector: "app-recommend-rank",
  templateUrl: "./recommend-rank.component.html",
  styleUrls: ["./recommend-rank.component.scss"]
})
export class RecommendRankComponent implements OnInit {
  @Output() rank: EventEmitter<any>;
  hotelQuery: HotelQueryEntity;
  constructor(private hotelService: HotelService) {
    this.rank = new EventEmitter();
    this.hotelQuery = this.hotelService.getHotelQueryModel();
  }
  onReset() {
    this.hotelQuery.ranks = [];
    this.hotelQuery.ranks.push({
      id: 0,
      label: "默认排序",
      value: "Category",
      orderBy: "PriceDesc",
      isSelected: true
    });
    // this.hotelQuery.ranks.push({
    //   id: 1,
    //   label: "口碑高-低",
    //   value: "Grade",
    //   orderBy: "Desc"
    // });
    this.hotelQuery.ranks.push({
      id: 2,
      label: "价格低-高",
      value: "Price",
      orderBy: "PriceAsc"
    });
    this.hotelQuery.ranks.push({
      id: 3,
      label: "价格高-低",
      value: "Price",
      orderBy: "PriceDesc"
    });
    let rank = this.hotelQuery.ranks.find(it => it.isSelected) || this.hotelQuery.ranks[0];
    if (this.hotelQuery) {
      rank = this.hotelQuery.ranks.find(it => it.orderBy == this.hotelQuery.Orderby) || rank;
    }
    rank.isSelected = true;
  }
  ngOnInit() {
    if(this.hotelQuery&&(!this.hotelQuery.ranks||this.hotelQuery.ranks.length==0)){
      this.onReset();
    }
  }
  onSelect(r: IRankItem) {
    this.hotelQuery.ranks = this.hotelQuery.ranks.map(it => {
      it.isSelected = it.id == r.id;
      return it;
    });
    this.hotelService.setHotelQuerySource(this.hotelQuery);
    this.rank.emit();
  }
}

export interface IRankItem {
  id: number;
  label: string;
  orderBy: "PriceAsc" | "PriceDesc";
  isSelected?: boolean;
  value: string;
}
