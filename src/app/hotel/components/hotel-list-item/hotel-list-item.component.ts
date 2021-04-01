import { ConfigEntity } from "./../../../services/config/config.entity";
import { Component, OnInit, Input } from "@angular/core";
import { HotelDayPriceEntity } from "../../models/HotelDayPriceEntity";
import { HotelQueryEntity } from "../../models/HotelQueryEntity";
import { SearchHotelModel } from "../../hotel.service";

@Component({
  selector: "app-hotel-list-item",
  templateUrl: "./hotel-list-item.component.html",
  styleUrls: ["./hotel-list-item.component.scss"],
})
export class HotelListItemComponent implements OnInit {
  @Input() item: HotelDayPriceEntity;
  @Input() hotelquery: SearchHotelModel;
  @Input() config: ConfigEntity;
  @Input() langOpt = {
    branch: "分",
    rise: "起",
  };
  constructor() { }

  ngOnInit() {
    if (this.item && this.item.Hotel && this.item.Hotel.VariablesJsonObj) {
      if (this.item.Hotel.VariablesJsonObj["GeoDistance"]) {
        const distance = this.item.Hotel.VariablesJsonObj["GeoDistance"];
        this.item.Hotel.VariablesJsonObj["geoDistance"] = {
          distance: distance.substring(distance.indexOf(",") + 1),
          name: distance.substring(0, distance.indexOf(",")),
        };
      }
    }
    console.log(this.hotelquery, "========");
  }
  getHotelAddress() {
  }
}
