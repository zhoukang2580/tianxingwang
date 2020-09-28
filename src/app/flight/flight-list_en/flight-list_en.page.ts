import { SelectFlightPassengerComponent } from "./../components/select-flight-passenger/select-flight-passenger.component";
import { IFlightSegmentInfo } from "./../models/PassengerFlightInfo";
import {
  PassengerBookInfo,
  FlightHotelTrainType,
  TmcService,
} from "./../../tmc/tmc.service";
import { environment } from "src/environments/environment";
import { ApiService } from "src/app/services/api/api.service";
import { FlyFilterComponent } from "./../components/fly-filter/fly-filter.component";
import { SearchFlightModel } from "./../flight.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import {
  StaffService,
  StaffBookType,
  StaffEntity,
} from "../../hr/staff.service";
import { AppHelper } from "src/app/appHelper";
import { animate } from "@angular/animations";
import { trigger, state, style, transition } from "@angular/animations";
import {
  IonContent,
  IonRefresher,
  ModalController,
  PopoverController,
  DomController,
  Platform,
  NavController,
} from "@ionic/angular";
import {
  Observable,
  Subscription,
  fromEvent,
  Subject,
  BehaviorSubject,
} from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  NgZone,
  ElementRef,
  QueryList,
  ViewChildren,
  EventEmitter,
} from "@angular/core";
import {
  tap,
  takeUntil,
  switchMap,
  delay,
  map,
  filter,
  reduce,
  finalize,
} from "rxjs/operators";
import * as moment from "moment";
import { CalendarService } from "../../tmc/calendar.service";
import { DayModel } from "../../tmc/models/DayModel";
import { FlightService } from "../flight.service";
import { FlightSegmentEntity } from "../models/flight/FlightSegmentEntity";
import { FlightJourneyEntity } from "../models/flight/FlightJourneyEntity";
import { FlightCabinType } from "../models/flight/FlightCabinType";
import { LanguageHelper } from "src/app/languageHelper";
import { FilterConditionModel } from "../models/flight/advanced-search-cond/FilterConditionModel";

import { Storage } from "@ionic/storage";
import { TripType } from "src/app/tmc/models/TripType";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { FilterPassengersPolicyComponent } from "../../tmc/components/filter-passengers-popover/filter-passengers-policy-popover.component";
import { DaysCalendarComponent } from "src/app/tmc/components/days-calendar/days-calendar.component";
import {
  CandeactivateGuard,
  CanComponentDeactivate,
} from "src/app/guards/candeactivate.guard";
import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";
import { FlightCabinEntity } from "../models/flight/FlightCabinEntity";
import { FlightListPage } from '../flight-list/flight-list.page';
@Component({
  selector: "app-flight-list_en",
  templateUrl: "./flight-list_en.page.html",
  styleUrls: ["./flight-list_en.page.scss"],
  animations: [
    trigger("showFooterAnimate", [
      state("true", style({ height: "*" })),
      state("false", style({ height: 0 })),
      transition("false<=>true", animate("100ms ease-in-out")),
    ]),
    trigger("openClose", [
      state("true", style({ height: "*" })),
      state("false", style({ height: "0px" })),
      transition("false <=> true", animate(500)),
    ]),
    trigger("rotateIcon", [
      state(
        "*",
        style({
          display: "inline-block",
          transform: "rotateZ(-8deg) scale(1)",
          opacity: 1,
        })
      ),
      transition(
        "false <=> true",
        animate(
          "200ms ease-in",
          style({
            transform: "rotateZ(360deg) scale(1.1)",
            opacity: 0.7,
          })
        )
      ),
    ]),
  ],
})
export class FlightListEnPage extends FlightListPage{
  
}
