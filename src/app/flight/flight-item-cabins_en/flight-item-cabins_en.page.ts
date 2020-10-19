import { Component } from "@angular/core";
import { FlightItemCabinsPage } from '../flight-item-cabins/flight-item-cabins.page';

@Component({
  selector: "app-flight-item-cabins_en",
  templateUrl: "./flight-item-cabins_en.page.html",
  styleUrls: ["./flight-item-cabins_en.page.scss"],
})
export class FlightItemCabinsEnPage extends FlightItemCabinsPage {
  langOpt = {
    meal: "Meal",
    isStop: "Stop over",
    no: "No ",
    common: "Operated by ",
    agreement: "A",
    planeType: "Aircraft ",
    lowestPrice: "LowestPrice",
    lowestPriceRecommend: "LowestPriceRecommend",
  };
}
