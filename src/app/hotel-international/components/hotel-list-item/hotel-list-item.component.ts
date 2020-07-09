import { Component, OnInit, Input } from "@angular/core";
import { fadeInOut } from 'src/app/animations/fadeInOut';

@Component({
  selector: "app-hotel-list-item",
  templateUrl: "./hotel-list-item.component.html",
  styleUrls: ["./hotel-list-item.component.scss"],
  animations:[
    fadeInOut
  ]
})
export class HotelListItemComponent implements OnInit {
  @Input() hotel: any;
  @Input() defaultImage: any;
  @Input() loadingImage:any;
  constructor() {}

  ngOnInit() {
    if (this.hotel) {
      this.initObj();
      this.hotel.grades = this.getStars(this.hotel.Category);
      this.hotel.avgPrice = this.getAvgPrice();
      this.hotel.distance = this.getGeoDistance();
      this.hotel.enName = this.getEnName();
    }
  }
  private getEnName() {
    const one =
      this.hotel &&
      this.hotel.HotelSummaries &&
      this.hotel.HotelSummaries.find(
        it =>
          it.Tag == "Name" && ((it.Lang || "") as string).toLowerCase() == "en"
      );
    return one && one.Content;
  }
  private initObj() {
    if (this.hotel && this.hotel.Variables) {
      this.hotel.VariablesObj =
        this.hotel.VariablesObj || JSON.parse(this.hotel.Variables);
    }
  }
  private getGeoDistance() {
    return (
      this.hotel &&
      this.hotel.VariablesObj &&
      this.hotel.VariablesObj["GeoDistance"]
    );
  }
  private getAvgPrice() {
    return (
      this.hotel &&
      this.hotel.VariablesObj &&
      this.hotel.VariablesObj["AvgPrice"]
    );
  }
  private getStars(grade: string) {
    const res = [];
    if (+grade) {
      const g = +grade;
      const m = Math.floor(g);
      const r = g - m;
      for (let i = 0; i < m; i++) {
        res.push(1);
      }
      if (r) {
        res.push(r);
      }
    }
    return res;
  }
}
