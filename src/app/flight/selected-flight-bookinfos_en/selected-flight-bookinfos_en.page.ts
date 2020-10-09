import { Component } from "@angular/core";
import { SelectedFlightBookInfosPage } from '../selected-flight-bookinfos/selected-flight-bookinfos.page';

@Component({
  selector: "app-selected-flight-bookinfos_en",
  templateUrl: "./selected-flight-bookinfos_en.page.html",
  styleUrls: ["./selected-flight-bookinfos_en.page.scss"],
})
export class SelectedFlightBookInfosEnPage extends SelectedFlightBookInfosPage {
  langOpt={
    meal: "Meal",
    isStop: "Stop over",
    no: "No",
    common: "Operated by ",
    agreement:"A",
    planeType: "Aircraft ",
    lowestPrice: "LowestPrice",
    lowestPriceRecommend: "LowestPriceRecommend"
  }
}
