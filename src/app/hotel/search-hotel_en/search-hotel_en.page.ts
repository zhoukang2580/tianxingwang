
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import {
  Component,
} from "@angular/core";
import { AppHelper } from "src/app/appHelper";
import { SearchHotelPage } from '../search-hotel/search-hotel.page';
import { FlightHotelTrainType } from 'src/app/tmc/tmc.service';
@Component({
  selector: "app-search-hotel",
  templateUrl: "./search-hotel_en.page.html",
  styleUrls: ["./search-hotel_en.page.scss"],
})
export class SearchHotelEnPage extends  SearchHotelPage{
  onShowSelectedBookInfos() {
    this.router.navigate([AppHelper.getRoutePath("hotel-room-bookedinfos_en")]);
  }
  onSelectPassenger() {
    this.router.navigate([AppHelper.getRoutePath("select-passenger_en")], {
      queryParams: {
        forType: this.isDomestic
          ? FlightHotelTrainType.Hotel
          : FlightHotelTrainType.HotelInternational,
      },
    });
  }
}
