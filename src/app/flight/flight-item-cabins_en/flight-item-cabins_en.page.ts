import { LanguageHelper } from "src/app/languageHelper";
import { FilterConditionModel } from "src/app/flight/models/flight/advanced-search-cond/FilterConditionModel";
import { FlightCabinEntity } from "./../models/flight/FlightCabinEntity";
import { IdentityService } from "./../../services/identity/identity.service";
import {
  StaffService,
  StaffEntity,
  StaffBookType,
} from "../../hr/staff.service";
import { DayModel } from "../../tmc/models/DayModel";
import { CalendarService } from "../../tmc/calendar.service";
import { FlightSegmentEntity } from "./../models/flight/FlightSegmentEntity";
import { ActivatedRoute, Router } from "@angular/router";
import { FlightService } from "src/app/flight/flight.service";
import { Component, OnInit } from "@angular/core";
import {
  ModalController,
  AlertController,
  NavController,
  PopoverController,
} from "@ionic/angular";
import { TicketchangingComponent } from "../components/ticketchanging/ticketchanging.component";
import * as moment from "moment";
import { FilterPassengersPolicyComponent } from "../../tmc/components/filter-passengers-popover/filter-passengers-policy-popover.component";
import {
  FlightPolicy,
  IFlightSegmentInfo,
} from "../models/PassengerFlightInfo";
import { of, Observable, Subscription } from "rxjs";
import { map, tap, filter } from "rxjs/operators";
import { PassengerBookInfo } from "src/app/tmc/tmc.service";
import { AppHelper } from "src/app/appHelper";
import { FlightFareType } from "../models/flight/FlightFareType";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { SearchTypeModel } from "../models/flight/advanced-search-cond/SearchTypeModel";
import { FlightCabinType } from "../models/flight/FlightCabinType";
import { OrderFlightTripEntity } from "src/app/order/models/OrderFlightTripEntity";
import { OrderService } from "src/app/order/order.service";
import { TripType } from "src/app/tmc/models/TripType";
import { FlightItemCabinsPage } from '../flight-item-cabins/flight-item-cabins.page';

@Component({
  selector: "app-flight-item-cabins_en",
  templateUrl: "./flight-item-cabins_en.page.html",
  styleUrls: ["./flight-item-cabins_en.page.scss"],
})
export class FlightItemCabinsEnPage extends FlightItemCabinsPage {
  langOpt = {
    meal: "Meal",
    isStop: "Stop over",
    no: "No",
    common: "Operated by ",
    agreement: "A",
    planeType: "Aircraft ",
    lowestPrice: "LowestPrice",
    lowestPriceRecommend: "LowestPriceRecommend",
  };
}
