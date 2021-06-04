import { Component, OnInit } from "@angular/core";
import { CredentialsEntity } from "src/app/tmc/models/CredentialsEntity";
import { FlightRouteEntity } from '../../models/flight/FlightRouteEntity';

@Component({
  selector: "app-price-detail",
  templateUrl: "./price-detail.component.html",
  styleUrls: ["./price-detail.component.scss"],
})
export class PriceDetailComponent implements OnInit {
  isSelf: boolean;
  fees: { [id: string]: number };
  priceInfos: {
    flightRoutes: FlightRouteEntity[];
    id: string;
    passengerCredential: CredentialsEntity;
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
    console.log("priceInfos", this.priceInfos, this.fees);
  }
}
