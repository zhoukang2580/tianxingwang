import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppHelper } from 'src/app/appHelper';
import { ApiService } from 'src/app/services/api/api.service';
import { FlightDynamicService, SearchDynamicModule } from '../flight-dynamic.service';
import { FlightDynamicDetailsPage } from '../model/FlightDynamicDetailsModel';

@Component({
  selector: 'app-flight-dynamic-info',
  templateUrl: './flight-dynamic-info.page.html',
  styleUrls: ['./flight-dynamic-info.page.scss'],
})
export class FlightDynamicInfoPage implements OnInit {

  private subscriptions: Subscription[] = [];
  searchDynamicModel: SearchDynamicModule;
  flightDynamicDetailsModel: FlightDynamicDetailsPage[];
  flightDynamicPro: any;
  flightNo: string;
  dateTime: string;
  PlanArrivalTime: string;
  PlanTakeoffTime: string;
  detailList: {
    Date: string,
    FlightNumber: string,
    distinguish: string
  }
  hour: string
  isShow = false;
  constructor(
    private flightDynamicService: FlightDynamicService,
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {

  }

  async ngOnInit() {
    try {
      this.route.queryParamMap.subscribe((q) => {
        this.flightNo = q.get("flightNo")
        this.initSearchModelParams();
        this.dateTime = this.searchDynamicModel.Date;
        this.detailList = {
          Date: this.dateTime,
          FlightNumber: this.flightNo,
          distinguish: this.searchDynamicModel.fromCity.CityName + ',' + this.searchDynamicModel.toCity.CityName,
        }
        this.loadDetails();
      })
    } catch (error) {
      console.error(error)
    }
  }

  private loadDetails() {
    if (this.flightNo) {
      this.flightDynamicService.getFlightDynamicDetail(this.detailList).then(d => {
        d.forEach(it => {
          this.PlanArrivalTime = it.PlanArrivalTime.substring(0, 10);
          this.PlanTakeoffTime = it.PlanTakeoffTime.substring(0, 10);
          it.PlanArrivalTime = it.PlanArrivalTime.substring(11, 16).replace("00:00", "");
          it.PlanTakeoffTime = it.PlanTakeoffTime.substring(11, 16).replace("00:00", "");
          it.EstimateTakeoffTime = it.EstimateTakeoffTime.substring(11, 16).replace("00:00", "");
          it.EstimateArrivalTime = it.EstimateArrivalTime.substring(11, 16).replace("00:00", "");

          const fliNo = it.PreviousFlightNumber;
          this.hour = it.Minute;
          this.isShow = false;
          if (fliNo && fliNo.length) {
            this.isShow = true;
          }
        });
        this.flightDynamicDetailsModel = d;
        const len = this.flightDynamicDetailsModel.length;
        var pro;
        if (len > 1) {
          pro = this.flightDynamicDetailsModel.pop();
          this.flightDynamicPro = pro;
        } else {
          this.flightDynamicPro = d;
          this.flightDynamicPro = { ...this.flightDynamicPro }[0];
        }
        console.log(this.flightDynamicPro, "flight");
      })
    }
  }

  private async initSearchModelParams() {
    this.subscriptions.push(
      this.flightDynamicService.getSearchDynamicModelSource().subscribe((m) => {
        this.searchDynamicModel = m;
      })
    );
  }

  async onPreorder(previous: any) {
    this.router.navigate([AppHelper.getRoutePath("flight-dynamic-preorder")], {
      queryParams: {
        PreviousFlightDate: previous.PreviousFlightDate.substring(0, 10),
        PreviousFlightNumber: previous.PreviousFlightNumber,
        FlightDateTime: this.searchDynamicModel.Date,
        FlightNumber: previous.FlightNumber
      }
    });
  }
}
