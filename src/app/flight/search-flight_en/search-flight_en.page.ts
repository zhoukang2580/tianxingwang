import { Component } from "@angular/core";
import { AppHelper } from 'src/app/appHelper';
import { FlightHotelTrainType } from 'src/app/tmc/tmc.service';
import { SearchFlightPage } from '../search-flight/search-flight.page';
@Component({
  selector: "app-search-flight_en",
  templateUrl: "./search-flight_en.page.html",
  styleUrls: ["./search-flight_en.page.scss"],
})
export class SearchFlightEnPage extends SearchFlightPage{
  onSelectPassenger() {
    this.isCanleave = true;
    this.isleave = true;
    this.router.navigate([AppHelper.getRoutePath("select-passenger_en")], {
      queryParams: { forType: FlightHotelTrainType.Flight },
    });
  }
}
