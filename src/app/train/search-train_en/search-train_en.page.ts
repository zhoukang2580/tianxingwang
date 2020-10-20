import { Component } from "@angular/core";
import { AppHelper } from 'src/app/appHelper';
import { FlightHotelTrainType } from 'src/app/tmc/tmc.service';
import { SearchTrainPage } from '../search-train/search-train.page';
@Component({
  selector: "app-search-train",
  templateUrl: "./search-train_en.page.html",
  styleUrls: ["./search-train_en.page.scss"],
})
export class SearchTrainEnPage extends SearchTrainPage{
  onSelectPassenger() {
    this.router.navigate([AppHelper.getRoutePath("select-passenger")], {
      queryParams: { forType: FlightHotelTrainType.Train },
    });
  }
}
