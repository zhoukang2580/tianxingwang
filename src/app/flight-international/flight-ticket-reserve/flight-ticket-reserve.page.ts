import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  IInternationalFlightSearchModel,
  ITripInfo,
  IFilterCondition,
  InternationalFlightService,
  IInterFlightCombindInfo as ICombindInfo,
} from "../international-flight.service";
import { Subscription, Subject, BehaviorSubject } from "rxjs";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-flight-ticket-reserve",
  templateUrl: "./flight-ticket-reserve.page.html",
  styleUrls: ["./flight-ticket-reserve.page.scss"],
})
export class FlightTicketReservePage implements OnInit, OnDestroy {
  searchModel: IInternationalFlightSearchModel;
  private subscriptions: Subscription[] = [];
  private subscription = Subscription.EMPTY;
  curTrip: ITripInfo;
  condition: IFilterCondition;
  error: any;
  isCheckingPay = false;
  totalPriceSource: Subject<number>;
  vmCombindInfos: ICombindInfo[];
  constructor(
    private flightService: InternationalFlightService,
    private route: ActivatedRoute
  ) {
    this.totalPriceSource = new BehaviorSubject(0);
  }
  ngOnDestroy() {
    this.subscriptions.push(
      this.route.queryParamMap.subscribe(() => {
        this.error = "";
      })
    );
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
}
