import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppHelper } from 'src/app/appHelper';
import { ApiService } from 'src/app/services/api/api.service';
import { CalendarService } from 'src/app/tmc/calendar.service';
import { FlightDynamicService, SearchDynamicModule } from '../flight-dynamic.service';
import { FlightDynamicDetailPage } from '../model/FlightDynamicDetailsModel';

@Component({
  selector: 'app-flight-dynamic-details',
  templateUrl: './flight-dynamic-details.page.html',
  styleUrls: ['./flight-dynamic-details.page.scss'],
})
export class FlightDynamicDetailsPage implements OnInit {
  private subscriptions: Subscription[] = [];
  searchDynamicModel: SearchDynamicModule;
  flightDynamicListModel: FlightDynamicDetailPage[];
  flightNo: string;
  dateTime: string;
  detailList: {
    Date: string,
    FlightNumber: string,
    distinguish: string
  }
  constructor(
    private flightService: FlightDynamicService,
    private calendarService: CalendarService,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.searchDynamicModel = new SearchDynamicModule();
  }

  async ngOnInit() {
    try {
      this.route.queryParamMap.subscribe((q) => {
        this.flightNo = q.get("flightNo")
        this.flightNo = this.flightNo.toUpperCase();
        this.initSearchModelParams();
        this.dateTime = this.searchDynamicModel.Date;
        // this.detailList = {
        //   Date: this.dateTime,
        //   FlightNumber: this.flightNo,
        //   distinguish: this.searchDynamicModel.fromCity.CityName + ',' + this.searchDynamicModel.toCity.CityName,
        // }

        this.loadDetails();
      })
    } catch (error) {
      console.error(error)
    }
  }

  private async loadDetails() {
    try {
      if (this.flightNo) {
        this.flightService.getFlightDynamicDetails(this.dateTime, this.flightNo).then(d => {
          d.filter(it => {
            it.PlanArrivalTime = it.PlanArrivalTime.substring(11, 16).replace("00:00", "");
            it.PlanTakeoffTime = it.PlanTakeoffTime.substring(11, 16).replace("00:00", "");
          });
          this.flightDynamicListModel = d;
        })
      }
    } catch (error) {
      console.log(error);
    }
  }

  private async initSearchModelParams() {
    this.subscriptions.push(
      this.flightService.getSearchDynamicModelSource().subscribe((m) => {
        this.searchDynamicModel = m;
      })
    );
  }

  async onSelectFlight(data: any) {
    this.router.navigate([AppHelper.getRoutePath("flight-dynamic-info")], {
      queryParams: { flightNum: this.flightNo, startTime: data.PlanTakeoffTime, endTime: data.PlanArrivalTime }
    })
  }

}
