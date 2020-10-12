
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import {
  Component,
} from "@angular/core";
import { AppHelper } from "src/app/appHelper";
import { SearchHotelPage } from '../search-hotel/search-hotel.page';
@Component({
  selector: "app-search-hotel",
  templateUrl: "./search-hotel_en.page.html",
  styleUrls: ["./search-hotel_en.page.scss"],
})
export class SearchHotelEnPage extends  SearchHotelPage{
  onShowSelectedBookInfos() {
    this.router.navigate([AppHelper.getRoutePath("hotel-room-bookedinfos_en")]);
  }
}
