import { Component } from "@angular/core";
import { AppHelper } from 'src/app/appHelper';
import { FlightHotelTrainType } from 'src/app/tmc/tmc.service';
import { SearchTrainBasePage } from "../search-train/search-train-base";
@Component({
  selector: "app-search-train",
  templateUrl: "./search-train_en.page.html",
  styleUrls: ["./search-train_en.page.scss"],
})
export class SearchTrainEnPage extends SearchTrainBasePage{
  onSelectPassenger() {
    AppHelper.Router.navigate([AppHelper.getRoutePath("select-passenger")], {
      queryParams: { forType: FlightHotelTrainType.Train },
    });
  }
}
