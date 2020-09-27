import { OrderTrainTicketEntity } from "./../../order/models/OrderTrainTicketEntity";
import { LanguageHelper } from "src/app/languageHelper";
import { CanComponentDeactivate } from "src/app/guards/candeactivate.guard";
import { FlightHotelTrainType } from "./../../tmc/tmc.service";
import { TrainService, SearchTrainModel } from "./../train.service";
import { TrafficlineEntity } from "./../../tmc/models/TrafficlineEntity";
import { IdentityService } from "../../services/identity/identity.service";
import { ApiService } from "src/app/services/api/api.service";
import { StaffEntity, StaffBookType } from "src/app/hr/staff.service";
import { StaffService } from "../../hr/staff.service";
import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { Component, OnInit, OnDestroy, AfterViewInit } from "@angular/core";
import * as moment from "moment";
import { Subscription, Observable, of, from } from "rxjs";
import { DayModel } from "../../tmc/models/DayModel";
import {
  ModalController,
  NavController,
  PopoverController,
} from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { CredentialsEntity } from "src/app/tmc/models/CredentialsEntity";
import { TripType } from "src/app/tmc/models/TripType";
import { TrainEntity } from "../models/TrainEntity";
import { CalendarService } from "src/app/tmc/calendar.service";
import { PassengerBookInfo, TmcService } from "src/app/tmc/tmc.service";
import { map } from "rxjs/operators";
import { SelectedTrainSegmentInfoComponent } from "../components/selected-train-segment-info/selected-train-segment-info.component";
import { ShowStandardDetailsComponent } from "src/app/tmc/components/show-standard-details/show-standard-details.component";
import { SearchTrainPage } from '../search-train/search-train.page';
@Component({
  selector: "app-search-train",
  templateUrl: "./search-train_en.page.html",
  styleUrls: ["./search-train_en.page.scss"],
})
export class SearchTrainEnPage extends SearchTrainPage{
 
}
