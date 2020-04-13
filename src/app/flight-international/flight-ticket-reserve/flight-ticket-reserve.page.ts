import { Component, OnInit } from '@angular/core';
import { IInternationalFlightSearchModel, ITripInfo, IFilterCondition, InternationalFlightService } from '../international-flight.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-flight-ticket-reserve',
  templateUrl: './flight-ticket-reserve.page.html',
  styleUrls: ['./flight-ticket-reserve.page.scss'],
})
export class FlightTicketReservePage implements OnInit {
  searchModel: IInternationalFlightSearchModel;
  private subscriptions: Subscription[] = [];
  private subscription = Subscription.EMPTY;
  curTrip: ITripInfo;
  condition: IFilterCondition;

  constructor(
    private flightService: InternationalFlightService,
  ) { }

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
    console.log(this.searchModel,"this.searchModel");
  }

}
