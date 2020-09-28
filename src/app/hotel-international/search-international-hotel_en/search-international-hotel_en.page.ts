import { IHotelInfo } from "./../../hotel/hotel.service";
import { CalendarService } from "./../../tmc/calendar.service";
import { StaffService } from "./../../hr/staff.service";
import { ModalController, PopoverController } from "@ionic/angular";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import {
  IInterHotelSearchCondition,
  InternationalHotelService,
  IInterHotelInfo
} from "./../international-hotel.service";
import { Component, OnInit, OnDestroy, EventEmitter } from "@angular/core";
import { TripType } from "src/app/tmc/models/TripType";
import { AppHelper } from "src/app/appHelper";
import {
  PassengerBookInfo,
  FlightHotelTrainType
} from "src/app/tmc/tmc.service";
import { LanguageHelper } from "src/app/languageHelper";
import { SelectedPassengersComponent } from "src/app/tmc/components/selected-passengers/selected-passengers.component";
import { ShowStandardDetailsComponent } from "src/app/tmc/components/show-standard-details/show-standard-details.component";
import { OverHotelComponent } from '../components/over-hotel/over-hotel.component';
import { SearchInternationalHotelPage } from '../search-international-hotel/search-international-hotel.page';

@Component({
  selector: "app-search-international-hotel",
  templateUrl: "./search-international-hotel_en.page.html",
  styleUrls: ["./search-international-hotel_en.page.scss"]
})
export class SearchInternationalHotelEnPage extends SearchInternationalHotelPage{
 
}
