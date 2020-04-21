import { Component, OnInit, OnDestroy } from "@angular/core";
import { FlightRouteEntity } from "src/app/flight/models/flight/FlightRouteEntity";
import {
  IInternationalFlightSearchModel,
  InternationalFlightService,
  ITripInfo,
  IFilterCondition,
  IInternationalFlightSegmentInfo,
} from "../international-flight.service";
import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { PassengerBookInfo } from "src/app/tmc/tmc.service";
import { StaffService } from "src/app/hr/staff.service";

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
  isSelf = true;
  passengers: PassengerBookInfo<IInternationalFlightSegmentInfo>[];
  constructor(
    private router: Router,
    private flightService: InternationalFlightService,
    private staffService: StaffService,
    private route: ActivatedRoute
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
    this.subscriptions.push(
      this.route.queryParamMap.subscribe(() => {
        this.staffService.isSelfBookType().then((is) => {
          this.isSelf = is;
        });
      })
    );
    this.subscriptions.push(this.subscription);
    this.subscriptions.push(
      this.flightService.getBookInfoSource().subscribe((infos) => {
        this.passengers = infos;
      })
    );
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
