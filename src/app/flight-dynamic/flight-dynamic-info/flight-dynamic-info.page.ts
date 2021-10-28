import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppHelper } from 'src/app/appHelper';
import { ApiService } from 'src/app/services/api/api.service';
import { ThemeService } from 'src/app/services/theme/theme.service';
import { FlightDynamicService, SearchDynamicModule } from '../flight-dynamic.service';
import { FlightDynamicDetailPage } from '../model/FlightDynamicDetailsModel';

@Component({
  selector: 'app-flight-dynamic-info',
  templateUrl: './flight-dynamic-info.page.html',
  styleUrls: ['./flight-dynamic-info.page.scss'],
})
export class FlightDynamicInfoPage implements OnInit {

  private subscriptions: Subscription[] = [];
  searchDynamicModel: SearchDynamicModule;
  flightDynamicDetailsModel: FlightDynamicDetailPage[];
  flightDynamicPro: any;
  flightNo: string;
  flightNum: string;
  flightNoN: string;
  flyNum: string;
  FlightName: string
  dateTime: string;
  PlanArrivalTime: string;
  PlanTakeoffTime: string;
  detailList: {
    Date: string,
    FlightNumber: string,
    distinguish: string
  }
  detailsList: {
    Date: string,
    FlightNumber: string,
    startDate: string,
    enDate: string,
  }
  detailsLists: {
    Date: string,
    FlightNumber: string,
    startDate: string,
    enDate: string,
  }

  hour: string;
  type: string;
  isShow = false;
  constructor(
    private flightDynamicService: FlightDynamicService,
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private refEle:ElementRef<HTMLElement>,
    private themeService:ThemeService,
    ) {
    this.themeService.getModeSource().subscribe(m=>{
         if(m=='dark'){
           this.refEle.nativeElement.classList.add("dark")
         }else{
           this.refEle.nativeElement.classList.remove("dark")
         }
       })
  }

  async ngOnInit() {
    try {
      this.route.queryParamMap.subscribe((q) => {
        this.flightNo = q.get("flightNo")
        this.flightNum = q.get("flightNum");
        this.flightNoN = q.get("flightNoN");
        this.flyNum = q.get("FlightNumber");
        let start = q.get("startTime");
        let end = q.get("endTime");
        let flyDate = q.get("Date");
        let disting = q.get("distinguish");
        if (flyDate && this.flyNum && disting) {
          this.detailList = {
            Date: flyDate,
            FlightNumber: this.flyNum,
            distinguish: disting,
          }
        } else {
          this.initSearchModelParams();
          this.dateTime = this.searchDynamicModel.Date;

          this.detailList = {
            Date: this.dateTime,
            FlightNumber: this.flightNo,
            distinguish: this.searchDynamicModel.fromCity.CityName + ',' + this.searchDynamicModel.toCity.CityName,
          }
          this.detailsList = {
            Date: this.dateTime,
            FlightNumber: this.flightNum || this.flightNoN,
            startDate: start,
            enDate: end,
          }
        }

        console.log(this.detailList, "detailList")


        this.loadDetails();
      })
    } catch (error) {
      console.error(error)
    }
  }

  planeNo() {
    return this.flightNo || this.flightNum || this.flightNoN || this.flyNum
  }

  async customPopoverOptions() {
    AppHelper.alert('未开通此功能');
  };

  private ReductCode(data) {
    this.PlanArrivalTime = data.PlanArrivalTime.substring(0, 10);
    this.PlanTakeoffTime = data.PlanTakeoffTime.substring(0, 10);
    data.PlanArrivalTime = data.PlanArrivalTime.substring(11, 16).replace("00:00", "");
    data.PlanTakeoffTime = data.PlanTakeoffTime.substring(11, 16).replace("00:00", "");
    data.EstimateTakeoffTime = data.EstimateTakeoffTime.substring(11, 16).replace("00:00", "");
    data.EstimateArrivalTime = data.EstimateArrivalTime.substring(11, 16).replace("00:00", "");
    this.hour = data.Minute;
    this.type = data.StatusName;
    const fliNo = data.PreviousFlightNumber;
    this.FlightName = data.AirlineName;
    this.hour = data.Minute;
    this.isShow = false;
    if (fliNo && fliNo.length) {
      this.isShow = true;
    }
  }

  private async loadDetails() {
    try {
      if (this.flightNo || this.detailList) {
        this.flightDynamicService.getFlightDynamicDetail(this.detailList).then(d => {
          if (d && d.length) {
            d.forEach(it => {
              this.ReductCode(it)
            });
            this.flightDynamicDetailsModel = d;
            const len = this.flightDynamicDetailsModel.length;
            var pro;
            if (len > 1) {
              pro = this.flightDynamicDetailsModel.pop();
              this.flightDynamicPro = pro;
            } else {
              this.flightDynamicPro = {...d}[0];
            }
          }
          console.log(this.flightDynamicPro, "flight");
        })
      }


      if (this.flightNum || this.flightNoN) {
        this.flightDynamicService.getFlightDynamicDetailes(this.detailsList).then(d => {
          if (d && d.length) {
            d.filter(it => {
              this.ReductCode(it)
            });
            this.flightDynamicDetailsModel = d;

            this.flightDynamicPro = this.flightDynamicDetailsModel;
            this.flightDynamicPro = { ...this.flightDynamicPro }[0];

            console.log(this.flightDynamicPro, "flight");
          }
        })
      }

    } catch (error) {
      AppHelper.alert(error)
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
        FlightDateTime: previous.Date.substring(0, 10),
        FlightNumber: previous.FlightNumber,
        preDepCity: previous.PreviousFromAirport,
        preArrCity: previous.PreviousToAirport
      }
    });
  }
}
