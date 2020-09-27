import {
  InternationalHotelService,
  IInterHotelSearchCondition,
} from "../../hotel-international/international-hotel.service";
import { LanguageHelper } from "../../languageHelper";
import { ImageRecoverService } from "../../services/imageRecover/imageRecover.service";
import { DayModel } from "src/app/tmc/models/DayModel";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { CalendarService } from "src/app/tmc/calendar.service";
import {
  FlightHotelTrainType,
  PassengerBookInfo,
} from "../../tmc/tmc.service";
import { TmcService } from "src/app/tmc/tmc.service";
import { HotelService, IHotelInfo, SearchHotelModel } from "../hotel.service";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { Observable, Subscription, from, of } from "rxjs";
import {
  Component,
  OnInit,
  OnDestroy,
  EventEmitter,
  ViewChild,
} from "@angular/core";
import { ModalController, PopoverController } from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
import { StaffService } from "src/app/hr/staff.service";
import { map } from "rxjs/operators";
import * as moment from "moment";
import { TripType } from "src/app/tmc/models/TripType";
import { SelectedPassengersComponent } from "src/app/tmc/components/selected-passengers/selected-passengers.component";
import { ShowStandardDetailsComponent } from "src/app/tmc/components/show-standard-details/show-standard-details.component";
import { OverHotelComponent } from "../components/over-hotel/over-hotel.component";
import { environment } from "src/environments/environment";
import { BackButtonComponent } from "src/app/components/back-button/back-button.component";
import { SearchHotelPage } from '../search-hotel/search-hotel.page';
@Component({
  selector: "app-search-hotel",
  templateUrl: "./search-hotel_en.page.html",
  styleUrls: ["./search-hotel_en.page.scss"],
})
export class SearchHotelEnPage extends  SearchHotelPage{
 
}
