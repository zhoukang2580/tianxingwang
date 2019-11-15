import { Component, OnInit } from "@angular/core";
import { CredentialsEntity } from 'src/app/tmc/models/CredentialsEntity';

@Component({
  selector: "app-price-detail",
  templateUrl: "./price-detail.component.html",
  styleUrls: ["./price-detail.component.scss"]
})
export class PriceDetailComponent implements OnInit {
  fees: number;
  priceInfos: {
    passengerCredential:CredentialsEntity,
    from: string;
    to: string;
    price: number;
    tax: number;
    insurances: {
      name: string;
      price: number;
    };
  }[];
  constructor() {}

  ngOnInit() {
    console.log("priceInfos", this.priceInfos);
  }
}
