import { Component } from "@angular/core";
import { AppHelper } from 'src/app/appHelper';
import { FlightHotelTrainType } from 'src/app/tmc/tmc.service';
import { SearchInternationalHotelPage } from '../search-international-hotel/search-international-hotel.page';

@Component({
  selector: "app-search-international-hotel",
  templateUrl: "./search-international-hotel_en.page.html",
  styleUrls: ["./search-international-hotel_en.page.scss"]
})
export class SearchInternationalHotelEnPage extends SearchInternationalHotelPage{
  onSelectPassenger() {
    this.router.navigate([AppHelper.getRoutePath("select-passenger")], {
      queryParams: {
        forType: FlightHotelTrainType.HotelInternational
      }
    });
  }
}
