import { Component, OnInit } from '@angular/core';
import { FlightRouteEntity } from 'src/app/flight/models/flight/FlightRouteEntity';
import { IInternationalFlightSearchModel, InternationalFlightService, ITripInfo, IFilterCondition } from '../international-flight.service';
import { AppHelper } from 'src/app/appHelper';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-selected-trip-info',
  templateUrl: './selected-trip-info.page.html',
  styleUrls: ['./selected-trip-info.page.scss'],
})
export class SelectedTripInfoPage implements OnInit {
  searchModel: IInternationalFlightSearchModel;
  private subscriptions: Subscription[] = [];
  private subscription = Subscription.EMPTY;
  curTrip: ITripInfo;
  condition: IFilterCondition;
  constructor(
    private router: Router,
    private flightService: InternationalFlightService,
  ) { }

  onSelectTrip(flightRoute: FlightRouteEntity) {
    console.log(this.searchModel,"this.searchModel");
    if (this.searchModel && this.searchModel.trips) {
      let trip = this.searchModel.trips.find((it) => !it.bookInfo);
      if (!trip) {
        trip = this.searchModel.trips[this.searchModel.trips.length - 1];

      }
      trip.bookInfo = {
        flightPolicy: null,
        fromSegment: flightRoute.fromSegment,
        toSegment: flightRoute.toSegment,
        flightRoute: flightRoute,
        id: AppHelper.uuid(),
      };
      this.flightService.setSearchModelSource(this.searchModel);
      trip = this.searchModel.trips.find((it) => !it.bookInfo);
      if(!trip){
        this.router.navigate(["selected-trip-info"]);
        return
      }
    }
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
  }

}
