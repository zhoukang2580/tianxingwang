import { CalendarService } from "src/app/tmc/calendar.service";
import { FlightHotelTrainType } from "./../../tmc/tmc.service";
import { TmcService } from "src/app/tmc/tmc.service";
import { HotelService } from "./../hotel.service";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { Observable, Subscription, from, of } from "rxjs";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { NavController } from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
import { StaffService } from "src/app/hr/staff.service";
import { map } from "rxjs/operators";

@Component({
  selector: "app-search-hotel",
  templateUrl: "./search-hotel.page.html",
  styleUrls: ["./search-hotel.page.scss"]
})
export class SearchHotelPage implements OnInit, OnDestroy {
  isShowSelectedInfos$: Observable<boolean>;
  canAddPassengers$: Observable<boolean>;
  selectedPassengers$ = of(0);
  totalFlyDays: number;
  disabled: boolean;
  private subscriptions: Subscription[] = [];
  private isLeavePage = false;
  constructor(
    private router: Router,
    private hotelService: HotelService,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private tmcSerivce: TmcService,
    private staffService: StaffService,
    private calendarService: CalendarService
  ) {
    const sub = route.queryParamMap.subscribe(_ => {
      tmcSerivce.setFlightHotelTrainType(FlightHotelTrainType.Hotel);
      this.isLeavePage = false;
    });
    this.subscriptions.push(sub);
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      if (sub) {
        sub.unsubscribe();
      }
    });
    this.subscriptions = [];
  }
  ngOnInit() {
    this.canAddPassengers$ = from(this.staffService.isSelfBookType()).pipe(
      map(isSelf => {
        return !isSelf;
      })
    );
  }
  onShowSelectedBookInfos() {}
  onSelectPassenger() {
    this.isLeavePage = true;
    this.router.navigate([AppHelper.getRoutePath("select-passenger")]);
  }
  onSelecDate() {}
  onSearchHotel() {}
  back() {
    this.navCtrl.back();
  }
}
