import { style } from "@angular/animations";
import { HotelQueryEntity } from "./../../models/HotelQueryEntity";
import { HotelService } from "./../../hotel.service";
import { Component, OnInit } from "@angular/core";
import { ConditionModel } from "../../models/ConditionModel";
import { trigger, transition, animate } from "@angular/animations";

@Component({
  selector: "app-hotel-query",
  templateUrl: "./hotel-query.component.html",
  styleUrls: ["./hotel-query.component.scss"],
  animations: [
    trigger("flyInOut", [
      transition(
        ":enter",
        animate("200ms", style({ opacity: 1, transform: "scale(1)" }))
      ),
      transition(
        ":leave",
        animate("200ms", style({ opacity: 0, transform: "scale(0)" }))
      )
    ])
  ]
})
export class HotelQueryComponent implements OnInit {
  hotelQueryModel: HotelQueryEntity;
  conditions: ConditionModel;
  isShowRank = false;
  constructor(private hotelService: HotelService) {}
  async onReset() {
    if (
      !this.conditions ||
      !this.conditions.Amenities ||
      !this.conditions.Brands ||
      !this.conditions.Geos
    ) {
      this.conditions = await this.hotelService
        .getConditions()
        .catch(_ => null);
    }
    this.hotelQueryModel = new HotelQueryEntity();
  }
  onShowRank(isShow: boolean) {
    this.isShowRank = isShow;
  }
  ngOnInit() {
    this.onReset();
  }
  onRank(rank: { label: string; value: string; orderBy: "Asc" | "Desc" }) {}
}
