import { TmcService, FlightHotelTrainType } from "src/app/tmc/tmc.service";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { IdentityService } from "../../services/identity/identity.service";
import { ApiService } from "src/app/services/api/api.service";
import { StaffEntity, StaffBookType } from "src/app/hr/staff.service";
import { FlightSegmentEntity } from "../models/flight/FlightSegmentEntity";
import { StaffService } from "../../hr/staff.service";
import {
  FlightService,
  SearchFlightModel
} from "src/app/flight/flight.service";
import { CalendarService } from "../../tmc/calendar.service";
import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { Component, OnInit, OnDestroy, AfterViewInit } from "@angular/core";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { DayModel } from "../../tmc/models/DayModel";
import { NavController } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { TripType } from "src/app/tmc/models/TripType";
@Component({
  selector: "app-search-flight",
  templateUrl: "./search-flight.page.html",
  styleUrls: ["./search-flight.page.scss"]
})
export class SearchFlightPage implements OnInit, OnDestroy, AfterViewInit {
  toggleCities = false; // 没有切换城市顺序
  rotateIcon = false;
  isSingle = true;
  isSelectFlyDate: boolean;
  flyDate: DayModel;
  backDate: DayModel;
  get totalFlyDays() {
    if (this.backDate && this.flyDate) {
      const detal = Math.floor(
        this.backDate.timeStamp - this.flyDate.timeStamp
      );
      if (detal == 0) {
        return 1;
      }
      return (detal / 24 / 3600).toFixed(0);
    }
    return 1;
  }
  selectDaySubscription = Subscription.EMPTY;
  searchConditionSubscription = Subscription.EMPTY;
  searchFlightModel: SearchFlightModel;
  isMoving: boolean;
  vmFromCity: TrafficlineEntity; // 界面上显示的城市
  vmToCity: TrafficlineEntity; // 界面上显示的城市
  fromCity: TrafficlineEntity; // 城市切换后，真实的出发城市
  toCity: TrafficlineEntity; // 切换后，真实的目的城市
  showReturnTrip: boolean;
  disabled = false;
  selectedPassengers: number;
  staff: StaffEntity;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private calendarService: CalendarService,
    private navCtrl: NavController,
    private flydayService: CalendarService,
    private flightService: FlightService,
    private storage: Storage,
    private staffService: StaffService,
    private identityService: IdentityService,
    private apiService: ApiService,
    private tmcService: TmcService
  ) {
    route.queryParamMap.subscribe(async _ => {
      this.tmcService.setTravelType(FlightHotelTrainType.Flight);
      this.staff = await this.staffService.getStaff();
      this.disabled = this.searchFlightModel && this.searchFlightModel.isLocked;
      this.showReturnTrip = await this.isStaffTypeSelf();
      this.selectedPassengers = flightService.getPassengerBookInfos().length;
      if (this.searchConditionSubscription) {
        this.searchConditionSubscription.unsubscribe();
      }
      this.searchConditionSubscription = this.flightService
        .getSearchFlightModelSource()
        .subscribe(async s => {
          console.log("search-flights", s);
          this.showReturnTrip = this.staffService.isSelfBookType;
          if (s) {
            this.disabled = s.isLocked;
            this.fromCity = this.vmFromCity = s.fromCity || this.fromCity;
            this.toCity = this.vmToCity = s.toCity || this.toCity;
            this.flyDate = this.flydayService.generateDayModelByDate(s.Date);
            this.backDate = this.flydayService.generateDayModelByDate(
              s.BackDate
            );
            this.isSingle = !s.isRoundTrip;
          }
        });
    });
  }

  back() {
    this.navCtrl.back();
  }
  private onRoundTrip(single: boolean) {
    // console.log("onRoundTrip isSingle", single);
    this.isSingle = single;
  }
  getMonth(d: DayModel) {
    return +this.calendarService.getMonth(d);
  }
  ngAfterViewInit(): void {
    console.log("ngAfterViewInit");
  }
  segmentChanged(evt: CustomEvent) {
    // console.log("evt.detail.value", evt.detail.value);
    this.onRoundTrip(evt.detail.value == "single");
  }
  async isStaffTypeSelf() {
    return await this.staffService.checkStaffTypeSelf();
  }
  async ngOnInit() {
    this.selectDaySubscription = this.flydayService
      .getSelectedFlyDays()
      .subscribe(days => {
        if (days && days.length) {
          if (days.length == 1) {
            if (this.disabled) {
              this.backDate = days[0];
            } else {
              this.flyDate = days[0];
              this.flyDate = days[0];
              this.backDate = this.flydayService.generateDayModel(
                moment(this.flyDate.date).add(1, "days")
              );
            }
          } else {
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
          if (this.flyDate.timeStamp > this.backDate.timeStamp) {
            this.flyDate = this.flydayService.generateDayModel(moment());
          }
        }
      });
    this.apiService.showLoadingView();
    const s = await this.staffService.getStaff();
    this.showReturnTrip = s && s.BookType == StaffBookType.Self;
    this.initFlightDays();
    this.initFlightCities();
    this.apiService.hideLoadingView();
  }
  mustAddPassenger() {
    return this.staff && this.staff.BookType !== StaffBookType.Self;
  }
  onSelectPassenger() {
    this.router.navigate([AppHelper.getRoutePath("select-passenger")]);
  }

  ngOnDestroy(): void {
    console.log("on destroyed");
    this.selectDaySubscription.unsubscribe();
    this.searchConditionSubscription.unsubscribe();
  }
  initFlightDays() {
    this.flyDate = this.calendarService.generateDayModel(
      moment()
      // 默认第二天
      // .add(1, "days")
    );
    this.flyDate.hasToolTip = false;
    this.flyDate.enabled = true;
    this.flyDate.desc = "去程";
    this.flyDate.descPos = "top";
    this.backDate = this.calendarService.generateDayModel(
      moment().add(4, "days")
    );
    this.backDate.hasToolTip = false;
    this.backDate.enabled = true;
    this.backDate.desc = "返程";
    this.backDate.descPos = "bottom";
  }
  async initFlightCities() {
    this.fromCity = this.vmFromCity = {} as any;
    this.fromCity.Nickname = this.fromCity.CityName = this.vmFromCity.CityName =
      "北京";
    this.vmFromCity.Code = this.fromCity.Code = "SHA";
    this.toCity = this.vmToCity = {} as any;
    this.toCity.Nickname = this.toCity.CityName = this.vmToCity.CityName =
      "上海";
    this.vmToCity.Code = this.toCity.Code = "BJS";
    this.fromCity.Tag = this.toCity.Tag = "AirportCity"; // 出发城市，不是出发城市的那个机场
    const lastFromCity = await this.storage.get("fromCity");
    const lastToCity = await this.storage.get("toCity");
    if (!lastFromCity || !lastToCity) {
      const cities = await this.flightService.getAllLocalAirports();
      if (cities && cities.length) {
        const vmFromCity = (this.fromCity = cities.find(
          c => c.Code.toUpperCase() == this.fromCity.Code
        ));
        const vmToCity = (this.toCity = cities.find(
          c => c.Code.toUpperCase() == this.toCity.Code
        ));
        if (vmFromCity && vmToCity) {
          this.fromCity = this.vmFromCity = vmFromCity;
          this.toCity = this.vmToCity = vmToCity;
        }
      }
    } else {
      this.fromCity = this.vmFromCity = lastFromCity;
      this.toCity = this.vmToCity = lastToCity;
    }
  }
  async searchFlight() {
    console.log(
      `出发城市" + 【${this.fromCity && this.fromCity.CityName}】`,
      `目的城市【${this.toCity && this.toCity.CityName}】`
    );
    console.log(`启程日期${this.flyDate.date},返程日期：${this.backDate.date}`);
    this.storage.set("fromCity", this.fromCity);
    this.storage.set("toCity", this.toCity);
    const s: SearchFlightModel = new SearchFlightModel();
    s.tripType = TripType.departureTrip;
    const staff = await this.staffService.getStaff();
    if (staff.BookType == StaffBookType.Self) {
      const exists = this.flightService
        .getPassengerBookInfos()
        .filter(
          item => item.passenger && item.passenger.AccountId == staff.AccountId
        );
      let goFlight: FlightSegmentEntity;
      const info = exists.find(
        it =>
          it.flightSegmentInfo &&
          it.flightSegmentInfo.tripType == TripType.departureTrip
      );
      if (info) {
        s.tripType = TripType.returnTrip;
        goFlight =
          info.flightSegmentInfo && info.flightSegmentInfo.flightSegment;
      } else {
        s.tripType = TripType.departureTrip;
      }
      if (s.tripType == TripType.returnTrip && goFlight) {
        const arrivalDate = moment(goFlight.ArrivalTime);
        if (
          +moment(this.backDate.date) <
          +moment(arrivalDate.format("YYYY-MM-DD"))
        ) {
          this.backDate = this.flydayService.generateDayModel(arrivalDate);
        }
      }
    }
    s.Date = this.flyDate.date;
    s.FromCode = this.fromCity.Code;
    s.ToCode = this.toCity.Code;
    s.ToAsAirport = this.toCity.Tag === "Airport"; // Airport 以到达 机场 查询;AirportCity 以城市查询
    s.FromAsAirport = this.fromCity.Tag === "Airport"; // Airport 以出发 机场 查询
    s.isRoundTrip = !this.isSingle;
    s.fromCity = this.fromCity;
    s.toCity = this.toCity;
    s.BackDate = this.backDate.date;
    if (this.disabled) {
      s.Date = s.BackDate;
    }
    if (!s.isRoundTrip) {
      s.tripType = TripType.departureTrip;
    }
    console.log("search-flight", s);
    this.flightService.setSearchFlightModel(s);
    this.router.navigate([AppHelper.getRoutePath("flight-list")]);
  }
  getDayDesc(d: DayModel) {
    return this.calendarService.getDescOfDay(d);
  }
  onSelecFlyDate(flyTo: boolean, backDate: boolean) {
    if (this.disabled && !backDate) {
      return;
    }
    this.isSelectFlyDate = flyTo;
    this.flydayService.setFlyDayMulti(!this.isSingle && !this.disabled);
    this.flydayService.showSelectFlyDatePage(true);
  }
  onFromCitySelected(city: TrafficlineEntity) {
    if (city) {
      this.fromCity = city;
    }
  }
  onToCitySelected(city: TrafficlineEntity) {
    if (city) {
      this.toCity = city;
    }
  }
}
