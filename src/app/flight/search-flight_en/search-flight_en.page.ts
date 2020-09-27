import { ShowStandardDetailsComponent } from "./../../tmc/components/show-standard-details/show-standard-details.component";
import { CanComponentDeactivate } from "src/app/guards/candeactivate.guard";
import { LanguageHelper } from "src/app/languageHelper";
import { TmcService, FlightHotelTrainType } from "src/app/tmc/tmc.service";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { IdentityService } from "../../services/identity/identity.service";
import { ApiService } from "src/app/services/api/api.service";
import { StaffEntity, StaffBookType } from "src/app/hr/staff.service";
import { FlightSegmentEntity } from "../models/flight/FlightSegmentEntity";
import { StaffService } from "../../hr/staff.service";
import {
  FlightService,
  SearchFlightModel,
} from "src/app/flight/flight.service";
import { CalendarService } from "../../tmc/calendar.service";
import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { Component, OnInit, OnDestroy, AfterViewInit } from "@angular/core";
import { Subscription, of, from } from "rxjs";
import { DayModel } from "../../tmc/models/DayModel";
import {
  NavController,
  ModalController,
  PopoverController,
} from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { TripType } from "src/app/tmc/models/TripType";
import { map } from "rxjs/operators";
import { SearchFlightPage } from '../search-flight/search-flight.page';
@Component({
  selector: "app-search-flight",
  templateUrl: "./search-flight_en.page.html",
  styleUrls: ["./search-flight_en.page.scss"],
})
export class SearchFlightEnPage extends SearchFlightPage{
  
}
