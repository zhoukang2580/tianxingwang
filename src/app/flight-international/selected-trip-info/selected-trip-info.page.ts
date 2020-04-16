import { Component, OnInit, OnDestroy } from "@angular/core";
import { FlightRouteEntity } from "src/app/flight/models/flight/FlightRouteEntity";
import {
  IInternationalFlightSearchModel,
  InternationalFlightService,
  ITripInfo,
  IFilterCondition,
} from "../international-flight.service";
import { AppHelper } from "src/app/appHelper";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
  selector: "app-selected-trip-info",
  templateUrl: "./selected-trip-info.page.html",
  styleUrls: ["./selected-trip-info.page.scss"],
})
export class SelectedTripInfoPage implements OnInit, OnDestroy {
  searchModel: IInternationalFlightSearchModel;
  private subscriptions: Subscription[] = [];
  private subscription = Subscription.EMPTY;
  curTrip: ITripInfo;
  condition: IFilterCondition;
  constructor(
    private router: Router,
    private flightService: InternationalFlightService
  ) {}
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  getFlyTime(duration: number) {
    if (!duration) {
      return "";
    }
    return this.flightService.getFlyTime(duration);
  }
  ngOnInit() {
    this.subscriptions.push(this.subscription);
    this.subscriptions.push(
      this.flightService.getSearchModelSource().subscribe((s) => {
        this.searchModel = s;
        if (s && s.trips) {
          this.curTrip = s.trips.find((it) => !it.bookInfo);
          if (!this.curTrip) {
            this.curTrip = s.trips[s.trips.length - 1];
          }
        }
      })
    );
    this.subscriptions.push(
      this.flightService.getFilterConditionSource().subscribe((c) => {
        this.condition = c;
      })
    );
    console.log(this.searchModel, "this.searchModel");
  }
  onReserve() {
    this.router.navigate(["flight-ticket-reserve"]);
  }
  onSelectSeat() {
    this.router.navigate(["choose-flight-seat"]);
  }
}
