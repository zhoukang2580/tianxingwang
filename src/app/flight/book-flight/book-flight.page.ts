import { FlightService } from "src/app/flight/flight.service";
import { TrafficlineModel } from "./../components/select-city/models/TrafficlineModel";
import { FlydayService } from "../flyday.service";
import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { Component, OnInit, OnDestroy, AfterViewInit } from "@angular/core";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { DayModel } from "../models/DayModel";
import { SelectDateService } from "../select-date/select-date.service";
import { SearchFlightModel } from "../models/flight/SearchFlightModel";
import { ModalController, NavController } from "@ionic/angular";
import { Storage } from "@ionic/storage";
@Component({
  selector: "app-book-flight",
  templateUrl: "./book-flight.page.html",
  styleUrls: ["./book-flight.page.scss"]
})
export class BookFlightPage implements OnInit, OnDestroy, AfterViewInit {
  toggleCities = false; // 没有切换城市顺序
  rotateIcon = false;
  isSingle = true;
  isLoading = false;
  isSelectFlyDate: boolean;
  flyDate: DayModel;
  backDate: DayModel;
  totalFlyDays: number;
  selectDaySubscription = Subscription.EMPTY;
  selectCitySubscription = Subscription.EMPTY;
  isMoving: boolean;
  vmFromCity: TrafficlineModel; // 界面上显示的城市
  vmToCity: TrafficlineModel; // 界面上显示的城市
  fromCity: TrafficlineModel; // 城市切换后，真实的出发城市
  toCity: TrafficlineModel; // 切换后，真实的目的城市
  constructor(
    private router: Router,
    private dayService: SelectDateService,
    route: ActivatedRoute,
    private navCtrl: NavController,
    private flydayService: FlydayService,
    private flightService: FlightService,
    private storage: Storage
  ) {
    route.queryParamMap.subscribe(async p => {
      this.isLoading = true;
      await this.initFlightCities();
      this.isLoading = false;
    });
  }
  goBack() {
    this.navCtrl.back();
  }
  private onRoundTrip(single: boolean) {
    // console.log("onRoundTrip isSingle", single);
    this.isSingle = single;
  }
  getMonth(d: DayModel) {
    return +this.dayService.getMonth(d);
  }
  ngAfterViewInit(): void {
    console.log("ngAfterViewInit");
  }
  segmentChanged(evt: CustomEvent) {
    // console.log("evt.detail.value", evt.detail.value);
    this.onRoundTrip(evt.detail.value == "single");
  }
  ngOnInit() {
    setTimeout(() => {
      this.initFlightDays();
    }, 300);
    this.selectDaySubscription = this.flydayService
      .getSelectedFlyDays()
      .subscribe(days => {
        if (days && days.length) {
          if (this.isSingle) {
            if (this.isSelectFlyDate) {
              this.flyDate = days[0];
            } else {
              this.backDate = days[0];
            }
          } else {
            this.flyDate = days[0];
            this.backDate = days[1];
          }
        }
      });
  }
  ngOnDestroy(): void {
    console.log("on destroyed");
    this.selectDaySubscription.unsubscribe();
  }
  initFlightDays() {
    this.flyDate = this.dayService.generateDayModel(
      moment()
      // 默认第二天
      // .add(1, "days")
    );
    this.flyDate.hasToolTip = false;
    this.flyDate.enabled = true;
    this.flyDate.desc = "去程";
    this.flyDate.descPos = "top";
    this.backDate = this.dayService.generateDayModel(moment().add(4, "days"));
    this.backDate.hasToolTip = false;
    this.backDate.enabled = true;
    this.backDate.desc = "返程";
    this.backDate.descPos = "bottom";
    this.totalFlyDays = 4;
  }
  async initFlightCities() {
    this.fromCity = this.vmFromCity = {} as any;
    this.fromCity.Nickname = this.fromCity.CityName = this.vmFromCity.CityName =
      "北京";
    this.vmFromCity.Code = this.fromCity.Code = "BJS";
    this.toCity = this.vmToCity = {} as any;
    this.toCity.Nickname = this.toCity.CityName = this.vmToCity.CityName =
      "上海";
    this.vmToCity.Code = this.toCity.Code = "SHA";
    this.fromCity.Tag = this.toCity.Tag = "AirportCity"; // 出发城市，不是出发城市的那个机场
    const lastFromCity = await this.storage.get("fromCity");
    const lastToCity = await this.storage.get("toCity");
    if (!lastFromCity || !lastToCity) {
      const cities = await this.flightService.getAllLocalAirports();
      if (cities && cities.length) {
        this.vmFromCity = this.fromCity = cities.find(
          c => c.Code.toUpperCase() == "BJS"
        );
        this.vmToCity = this.toCity = cities.find(
          c => c.Code.toUpperCase() == "SHA"
        );
      }
    } else {
      this.fromCity = this.vmFromCity = lastFromCity;
      this.toCity = this.vmToCity = lastToCity;
    }
  }
  searchFlight() {
    console.log(
      `出发城市" + 【${this.fromCity && this.fromCity.CityName}】`,
      `目的城市【${this.toCity && this.toCity.CityName}】`
    );
    console.log(`启程日期${this.flyDate.date},返程日期：${this.backDate.date}`);
    this.storage.set("fromCity", this.fromCity);
    this.storage.set("toCity", this.toCity);
    const s: SearchFlightModel = new SearchFlightModel();
    s.Date = this.flyDate.date;
    s.FromCode = this.fromCity.Code;
    s.ToCode = this.toCity.Code;
    s.ToAsAirport = this.toCity.Tag === "Airport"; // 以到达 机场 查询
    s.FromAsAirport = this.fromCity.Tag === "Airport"; // 以出发 机场 查询
    s.IsRoundTrip = !this.isSingle;
    this.router.navigate([AppHelper.getRoutePath("flight-list")], {
      queryParams: {
        searchFlightModel: JSON.stringify(s),
        fromCity: JSON.stringify(this.fromCity),
        toCity: JSON.stringify(this.toCity)
      }
    });
  }
  getDayDesc(d: DayModel) {
    return this.dayService.getDescOfDay(d);
  }
  onSelecFlyDate(flyTo: boolean) {
    this.isSelectFlyDate = flyTo;
    this.flydayService.setFlyDayMulti(!this.isSingle);
    this.flydayService.showFlyDayPage(true);
  }
  onFromCitySelected(city: TrafficlineModel) {
    if (city) {
      this.fromCity = city;
    }
  }
  onToCitySelected(city: TrafficlineModel) {
    if (city) {
      this.toCity = city;
    }
  }
}
