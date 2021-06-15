import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonInfiniteScroll, IonRefresher } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AppHelper } from 'src/app/appHelper';
import { FilterConditionModel } from 'src/app/flight/models/flight/advanced-search-cond/FilterConditionModel';
import { ApiService } from 'src/app/services/api/api.service';
import { CalendarService } from 'src/app/tmc/calendar.service';
import {  FlightDynamicService, SearchDynamicModule as SearchDynamicModel } from '../flight-dynamic.service';
import { FlightdynamicListModel } from '../model/FlightDynamicListModel';

@Component({
  selector: 'app-flight-dynamic-list',
  templateUrl: './flight-dynamic-list.page.html',
  styleUrls: ['./flight-dynamic-list.page.scss'],
})
export class FlightDynamicListPage implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  searchDynamicModel: SearchDynamicModel;
  flightDynamicListModel: FlightdynamicListModel[];
  filterCondition: FilterConditionModel;
  currentProcessStatus = "正在获取航班列表";
  @ViewChild(IonInfiniteScroll, { static: true }) scroller: IonInfiniteScroll;
  @ViewChild("cnt", { static: true }) public cnt: IonContent;
  @ViewChild(IonRefresher) refresher: IonRefresher;
  isLoading = false;
  isNoData = false;
  airportTime: string;
  arriveTime: string;

  get flightResult() {
    return this.flightDynamicService.flightResult;
  }

  searchDynamicList: {
    Date: string;
    FromAirport: string;
    ToAirport: string;
    FlightNumber: string;
  }
  constructor(
    private calendarService: CalendarService,
    private apiService: ApiService,
    private router: Router,
    private flightDynamicService:FlightDynamicService
  ) {
    this.searchDynamicModel = new SearchDynamicModel();
  }


  private async initSearchModelParams() {
    this.subscriptions.push(
      this.flightDynamicService.getSearchDynamicModelSource().subscribe((m) => {
        this.searchDynamicModel = m;
      })
    );
  }
  async ngOnInit() {
    try {
      this.initSearchModelParams();
      this.searchDynamicList = {
        Date: this.searchDynamicModel.Date,
        FromAirport: this.searchDynamicModel.fromCity.Code,
        ToAirport: this.searchDynamicModel.toCity.Code,
        FlightNumber: this.searchDynamicModel.FlightNumber
      }
      this.doRefresh(true);

    } catch (error) {
      console.error(error);
    }
  }

  getWeekName(date: string) {
    if (date) {
      const d = AppHelper.getDate(date);
      return this.calendarService.getDayOfWeekNames(d.getDay());
    }
  }

  async doRefresh(loadDataFromServer: boolean) {
    try {
      console.log(this.searchDynamicModel, 'flight');
      if (loadDataFromServer) {
        this.scrollToTop();
      }
      this.flightDynamicListModel = [];
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;
      if (this.refresher) {
        this.refresher.complete();
        this.refresher.disabled = true;
        setTimeout(() => {
          this.refresher.disabled = false;
        }, 100);
      }
      // this.currentProcessStatus = "正在获取航班列表";
      // this.apiService.showLoadingView({ msg: this.currentProcessStatus });
      this.isNoData = false;
     
      this.flightDynamicListModel = await this.flightDynamicService.getFlightDynamicList(this.searchDynamicList).then((r) => {
        if (r && r.length) {
          console.log(r);
        }
        return r;
      })
      setTimeout(() => {
        if (!this.flightDynamicListModel.length) {
          this.isNoData = true;
        }
      }, 1000);
      if(this.flightDynamicListModel){
        this.flightDynamicListModel.forEach(it=>{
          it.PlanArrivalTime = it.PlanArrivalTime.replace("T", " ").substring(11, 16);
          it.PlanTakeoffTime = it.PlanTakeoffTime.replace("T", " ").substring(11, 16);
          it.RealArrivalTime = it.RealArrivalTime.replace("T", " ").substring(11, 16);
          it.RealTakeoffTime = it.RealTakeoffTime.replace("T", " ").substring(11, 16);
        })
      }
     
      this.apiService.hideLoadingView();
      this.isLoading = false;
    } catch (error) {
      console.error(error);
      this.isNoData = true;
      this.apiService.hideLoadingView();
      this.isLoading = false;
    }
  }

  private isStillOnCurrentPage() {
    return this.router.routerState.snapshot.url.includes("flight-dynamic-list");
  }

  ngOnDestroy() {
    console.log("ngOnDestroy");
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private scrollToTop() {
    setTimeout(() => {
      if (this.cnt) {
        if (!this.isStillOnCurrentPage()) {
          return;
        }
        if (this.cnt && typeof this.cnt.scrollToTop == "function") {
          this.cnt.scrollToTop(100);
        }
      }
    }, 200);
  }

  async onFlightDetails(flightNo: string) {
    this.router.navigate([AppHelper.getRoutePath("flight-dynamic-info")], {
      queryParams: { flightNo: flightNo }
    })
  }

}
