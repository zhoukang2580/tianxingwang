import { ConfigEntity } from "./../../../services/config/config.entity";
import { Component, OnInit, Input } from "@angular/core";
import { HotelDayPriceEntity } from "../../models/HotelDayPriceEntity";

@Component({
  selector: "app-hotel-list-item",
  templateUrl: "./hotel-list-item.component.html",
  styleUrls: ["./hotel-list-item.component.scss"]
})
export class HotelListItemComponent implements OnInit {
  @Input() item: HotelDayPriceEntity;
  @Input() config: ConfigEntity;
  constructor() {}

  ngOnInit() {}
}
