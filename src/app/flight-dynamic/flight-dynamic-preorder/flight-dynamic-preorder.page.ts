import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppHelper } from 'src/app/appHelper';
import { ThemeService } from 'src/app/services/theme/theme.service';
import { FlightDynamicService } from '../flight-dynamic.service';
import { FlightDynamicDetailPage } from '../model/FlightDynamicDetailsModel';

@Component({
  selector: 'app-flight-dynamic-preorder',
  templateUrl: './flight-dynamic-preorder.page.html',
  styleUrls: ['./flight-dynamic-preorder.page.scss'],
})
export class FlightDynamicPreorderPage implements OnInit {
  dateTime:string;
  flightNo:string;
  theFlightNo:string;
  theDatetime:string;
  preDepcity:string;
  preArrCity:string;
  flightDynamicDetailsModel:FlightDynamicDetailPage[];
  thisFlightDynamicDetails:any;
  constructor(
    private route:ActivatedRoute,
    private flightDynamicService:FlightDynamicService,
    private router: Router,
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
        this.dateTime = q.get("PreviousFlightDate");
        this.flightNo = q.get("PreviousFlightNumber");
        this.theDatetime = q.get("FlightDateTime");
        this.theFlightNo = q.get("FlightNumber");
        this.preDepcity = q.get("preDepCity");
        this.preArrCity = q.get("preArrCity");
        this.doload();
      })
    } catch (error) {
      console.error(error);
    }
  }

  private doload(){
    if (this.flightNo) {
      this.flightDynamicService.getFlightDynamicDetails(this.dateTime, this.flightNo).then(d => {
        d.forEach(it => {
          it.PlanArrivalTime = it.PlanArrivalTime.substring(11, 16).replace("00:00", "");
          it.PlanTakeoffTime = it.PlanTakeoffTime.substring(11, 16).replace("00:00", "");
          it.EstimateArrivalTime = it.EstimateArrivalTime.substring(11, 16).replace("00:00", "");
          it.EstimateTakeoffTime = it.EstimateTakeoffTime.substring(11, 16).replace("00:00", "");
        });
        d.find(e => e.FromAirport == this.preDepcity && e.ToAirport == this.preArrCity)
        this.flightDynamicDetailsModel = d;
        this.flightDynamicDetailsModel = this.flightDynamicDetailsModel.filter((it)=>{
          return it.FromAirport == this.preDepcity && it.ToAirport == this.preArrCity;
        });
        console.log(this.flightDynamicDetailsModel, "flight");
      }) 
    }
    if (this.theFlightNo) {
      this.flightDynamicService.getFlightDynamicDetails(this.theDatetime, this.theFlightNo).then(d => {
        d.forEach(it => {
          it.PlanArrivalTime = it.PlanArrivalTime.substring(11, 16).replace("00:00", "");
          it.PlanTakeoffTime = it.PlanTakeoffTime.substring(11, 16).replace("00:00", "");
          it.EstimateArrivalTime = it.EstimateArrivalTime.substring(11, 16).replace("00:00", "");
          it.EstimateTakeoffTime = it.EstimateTakeoffTime.substring(11, 16).replace("00:00", "");
        });
        this.thisFlightDynamicDetails = d;
        this.thisFlightDynamicDetails = this.thisFlightDynamicDetails.pop();

        console.log(this.thisFlightDynamicDetails, "flight");
      })
    }
  }

  async onSelectFlight(data:any) {
    this.router.navigate([AppHelper.getRoutePath("flight-dynamic-info")], {
      queryParams: { flightNoN: data.FlightNumber,startTime: data.PlanTakeoffTime, endTime: data.PlanArrivalTime}
    })
  }

  async onSelectPresent(flightNo:string){
    this.router.navigate([AppHelper.getRoutePath("flight-dynamic-info")], {
      queryParams: { flightNo: flightNo }
    })
  }

}
