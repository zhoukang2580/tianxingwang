import { Component, OnInit, OnDestroy } from "@angular/core";
import { StaffService } from "src/app/hr/staff.service";
import {
  InternationalFlightService,
  IInternationalFlightSegmentInfo,
  IInternationalFlightSearchModel,
  FlightVoyageType,
  ITripInfo,
  FlightCabinInternationalType,
} from "../international-flight.service";
import { Subscription } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import {
  PassengerBookInfo,
  FlightHotelTrainType,
} from "src/app/tmc/tmc.service";
import { PopoverController } from "@ionic/angular";
import { ShowStandardDetailsComponent } from "src/app/tmc/components/show-standard-details/show-standard-details.component";
import { Router, ActivatedRoute } from "@angular/router";
import { CanComponentDeactivate } from "src/app/guards/candeactivate.guard";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { FlightCabinType } from "src/app/flight/models/flight/FlightCabinType";
import { SearchInternationalFlightPage } from '../search-international-flight/search-international-flight.page';

@Component({
  selector: "app-search-international-flight",
  templateUrl: "./search-international-flight_en.page.html",
  styleUrls: ["./search-international-flight_en.page.scss"],
})
export class SearchInternationalFlightEnPage extends SearchInternationalFlightPage{
  onSelectPassenger() {
    this.isCanleave = true;
    this.router.navigate([AppHelper.getRoutePath("select-passenger_en")], {
      queryParams: { forType: FlightHotelTrainType.InternationalFlight },
    });
  }
}
