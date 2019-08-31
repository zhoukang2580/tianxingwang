import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-price-detail",
  templateUrl: "./price-detail.component.html",
  styleUrls: ["./price-detail.component.scss"]
})
export class PriceDetailComponent implements OnInit {
  fees: number;
  priceInfos: {
    from: string;
    to: string;
    price: number;
    tax: number;
    insuraces: {
      name: string;
      price: number;
    };
  }[];
  constructor() {}

  ngOnInit() {
    this.priceInfos =
      this.priceInfos && this.priceInfos.concat(this.priceInfos);
  }
}
