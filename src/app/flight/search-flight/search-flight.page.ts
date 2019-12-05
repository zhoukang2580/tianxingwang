import { CanComponentDeactivate } from 'src/app/guards/candeactivate.guard';
import { LanguageHelper } from 'src/app/languageHelper';
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
import { Subscription, of, from } from "rxjs";
import { DayModel } from "../../tmc/models/DayModel";
import { NavController, ModalController } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { TripType } from "src/app/tmc/models/TripType";
import { map } from "rxjs/operators";
import { SelectedFlightsegmentInfoComponent } from "../components/selected-flightsegment-info/selected-flightsegment-info.component";
@Component({
  selector: "app-search-flight",
  templateUrl: "./search-flight.page.html",
  styleUrls: ["./search-flight.page.scss"]
})
export class SearchFlightPage implements OnInit, OnDestroy, AfterViewInit, CanComponentDeactivate {
  isSelf = false;
  toggleCities = false; // 没有切换城市顺序
  rotateIcon = false;
  isSingle = true;
  goDate: DayModel;
  backDate: DayModel;
  searchConditionSubscription = Subscription.EMPTY;
  searchFlightModel: SearchFlightModel;
  isMoving: boolean;
  vmFromCity: TrafficlineEntity; // 界面上显示的城市
  vmToCity: TrafficlineEntity; // 界面上显示的城市
  showReturnTrip: boolean;
  disabled = false;
  totalFlyDays: number;
  staff: StaffEntity;
  isShowBookInfos$ = of(0);
  isCanleave = true;
  isleave = true;
  get selectedPassengers() {
    return this.flightService.getPassengerBookInfos().length;
  }
  constructor(
    private router: Router,
    route: ActivatedRoute,
    private identityService: IdentityService,
    private calendarService: CalendarService,
    private navCtrl: NavController,
    private flightService: FlightService,
    private storage: Storage,
    private staffService: StaffService,
    private apiService: ApiService,
    private tmcService: TmcService,
    private modalCtrl: ModalController
  ) {
    route.queryParamMap.subscribe(async _ => {
      this.isSelf = await this.staffService.isSelfBookType();
      this.isleave = false;
      this.isCanleave = false;
      const identity = await this.identityService.getIdentityAsync();
      this.disabled = this.searchFlightModel && this.searchFlightModel.isLocked;
      const lastSelectedGoDate = await this.storage.get(`last_selected_flight_goDate_${identity && identity.Id}`)
        || moment().add(1, 'days').format("YYYY-MM-DD");
      const lastSelectedBackDate = moment(lastSelectedGoDate).add(1, 'days').format("YYYY-MM-DD");
      const s = this.flightService.getSearchFlightModel();
      this.vmFromCity = s.fromCity;
      this.vmToCity = s.toCity;
      s.Date = lastSelectedGoDate;
      s.BackDate = lastSelectedBackDate;
      if(!s.isLocked){
        this.flightService.setSearchFlightModel(s);
      }
      // this.calendarService.setSelectedDaysSource([this.goDate, this.backDate]);
      this.showReturnTrip = await this.isStaffTypeSelf();
    });
  }
  private checkBackDateIsAfterflyDate() {
    if (this.goDate && this.backDate) {
      console.log(this.router.url.includes("search-flight"));
      if (this.searchFlightModel && this.searchFlightModel.isRoundTrip && !this.isleave && this.goDate.timeStamp > this.backDate.timeStamp) {
        if (this.router.url.includes("search-flight")) {
          AppHelper.alert("您选择的去程日期在返程日期之后，返程日期自动更新为去程日期后一天");
        }
      }
      this.backDate = this.goDate.timeStamp > this.backDate.timeStamp ?
        this.calendarService.generateDayModel(moment(this.goDate.date).add(1, 'days')) : this.backDate;
    }
  }
  async canDeactivate() {
    if (this.isCanleave) {
      return true;
    }
    const bookInfos = this.flightService.getPassengerBookInfos().filter(it => !!it.bookInfo);
    if (bookInfos.length) {
      return AppHelper.alert("是否放弃所选航班信息？", true, LanguageHelper.getConfirmTip(), LanguageHelper.getCancelTip());
    }
    return true;
  }
  private calcTotalFlyDays() {
    if (this.backDate && this.goDate) {
      const nums =
        Math.abs(moment(this.backDate.date).diff(
          moment(this.goDate.date), 'days'));
      return nums <= 0 ? 1 : nums;
    }
    return `1`;
  }
  back() {
    this.isleave = true;
    this.flightService.removeAllBookInfos();
    this.router.navigate([""]);
  }
  private onRoundTrip(single: boolean) {
    // console.log("onRoundTrip isSingle", single);
    this.isSingle = single;
    this.flightService.setSearchFlightModel({
      ...this.flightService.getSearchFlightModel(),
      isRoundTrip: !this.isSingle
    });
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
    return this.staffService.isSelfBookType();
  }
  async ngOnInit() {
    await this.initFlightCities();
    this.searchConditionSubscription = this.flightService
      .getSearchFlightModelSource()
      .subscribe(async s => {
        console.log("search-flights", s);
        this.showReturnTrip = await this.staffService.isSelfBookType();
        this.searchFlightModel = s;
        if (s) {
          this.disabled = s.isLocked;
          this.vmFromCity = s.fromCity;
          this.vmToCity = s.toCity;
          this.isSingle = !s.isRoundTrip;
          this.goDate = this.calendarService.generateDayModelByDate(s.Date);
          this.backDate = this.calendarService.generateDayModelByDate(s.BackDate);
          this.checkBackDateIsAfterflyDate();
        }
      });
    this.isShowBookInfos$ = this.flightService
      .getPassengerBookInfoSource()
      .pipe(map(infos => infos.filter(it => !!it.bookInfo).length));
    this.apiService.showLoadingView();
    this.showReturnTrip = await this.staffService
      .isSelfBookType()
      .catch(_ => false);
    this.apiService.hideLoadingView();
  }
  onSelectPassenger() {
    this.isCanleave = true;
    this.isleave = true;
    this.router.navigate([AppHelper.getRoutePath("select-passenger")], { queryParams: { forType: FlightHotelTrainType.Flight } });
  }
  async showSelectedInfos() {
    const modal = await this.modalCtrl.create({
      component: SelectedFlightsegmentInfoComponent
    });
    await this.flightService.dismissAllTopOverlays();
    await modal.present();
    await modal.onDidDismiss();
  }
  ngOnDestroy(): void {
    console.log("on destroyed");
    this.searchConditionSubscription.unsubscribe();
  }

  async initFlightCities() {
    const vmFromCity: TrafficlineEntity = {
      AirportCityCode: "BJS",
      CityCode: "1101",
      CityName: "北京",
      Code: "BJS",
      CountryCode: "CN",
      Description: "",
      EnglishName: "Beijing",
      Id: "9278",
      Initial: "bj",
      IsHot: true,
      Name: "北京",
      Nickname: "北京",
      Pinyin: "Beijing",
      Sequence: 2,
      Tag: "AirportCity",
    } as TrafficlineEntity;
    const vmToCity = {
      AirportCityCode: "SHA",
      CityCode: "3101",
      CityName: "上海",
      Code: "SHA",
      CountryCode: "CN",
      Description: "",
      EnglishName: "Shanghai",
      Id: "9260",
      Initial: "",
      IsHot: true,
      Name: "上海",
      Nickname: "上海",
      Pinyin: "Shanghai",
      Sequence: 1,
      // 出发城市，不是出发城市的那个机场
      Tag: "AirportCity"
    } as TrafficlineEntity;
    const lastFromCity = await this.storage.get("fromCity").catch(_ => null) || vmFromCity;
    const lastToCity = await this.storage.get("toCity").catch(_ => null) || vmToCity;
    this.flightService.setSearchFlightModel({
      ...this.flightService.getSearchFlightModel(),
      fromCity: lastFromCity,
      toCity: lastToCity
    })
  }
  async searchFlight() {
    this.isCanleave = true;
    this.isleave = true;
    console.log(
      `出发城市" + 【${this.vmFromCity && this.vmFromCity.CityName}】`,
      `目的城市【${this.vmToCity && this.vmToCity.CityName}】`
    );
    console.log(`启程日期${this.goDate.date},返程日期：${this.backDate.date}`);
    this.storage.set("fromCity", this.vmFromCity);
    this.storage.set("toCity", this.vmToCity);

    const s: SearchFlightModel = this.searchFlightModel || new SearchFlightModel();
    // s.tripType = TripType.departureTrip;
    const staff = await this.staffService.getStaff().catch(_ => null);
    if (staff && staff.BookType == StaffBookType.Self) {
      const exists = this.flightService
        .getPassengerBookInfos();
      const go = exists.find(
        it => it.bookInfo && it.bookInfo.tripType == TripType.departureTrip
      );
      const back = exists.find(
        it => it.bookInfo && it.bookInfo.tripType == TripType.returnTrip
      );
      // if (go && back && !exists.some(it => it.isReplace)) {
      //   s.tripType = TripType.departureTrip;
      // }
      if (go) {
        const arrivalDate = moment(go.bookInfo && go.bookInfo.flightSegment && go.bookInfo.flightSegment.ArrivalTime);
        if (
          +moment(this.backDate.date) <
          +moment(arrivalDate.format("YYYY-MM-DD"))
        ) {
          AppHelper.alert("返程时间不能在去程时间之前");
          return;
          // this.backDate = this.calendarService.generateDayModel(arrivalDate);
        }
      } else {
        s.tripType = TripType.departureTrip;
      }
    } else {
      s.tripType = TripType.departureTrip;
    }
    s.Date = this.goDate.date;
    s.FromCode = this.vmFromCity.Code;
    s.ToCode = this.vmToCity.Code;
    s.ToAsAirport = this.vmToCity.Tag === "Airport"; // Airport 以到达 机场 查询;AirportCity 以城市查询
    s.FromAsAirport = this.vmFromCity.Tag === "Airport"; // Airport 以出发 机场 查询
    s.isRoundTrip = !this.isSingle;
    s.fromCity = this.vmFromCity;
    s.toCity = this.vmToCity;
    s.BackDate = this.backDate.date;
    if (this.disabled) {
      s.Date = s.BackDate;
    }
    // s.tripType = s.isRoundTrip ? goFlight ? s.tripType : TripType.departureTrip : TripType.departureTrip;
    console.log("search-flight", s);
    // this.calendarService.setSelectedDaysSource([this.calendarService.generateDayModelByDate(s.Date)]);
    this.flightService.setSearchFlightModel(s);
    this.router.navigate([AppHelper.getRoutePath("flight-list")]);
    const identity = await this.identityService.getIdentityAsync();
    if (identity) {
      await this.storage.set(`last_selected_flight_goDate_${identity.Id}`, s.Date);
    }
  }
  getDayDesc(d: DayModel) {
    return this.calendarService.getDescOfDay(d);
  }
  async onSelecFlyDate(flyTo: boolean, backDate: boolean) {
    if (this.disabled) {
      return;
    }
    const dates = await this.flightService.openCalendar(false, flyTo ? TripType.departureTrip : backDate ? TripType.returnTrip : null);
    if (dates && dates.length) {
      if (dates.length && this.searchFlightModel) {
        if (flyTo) {
          this.searchFlightModel.Date = dates[0].date;
        }
        if (backDate) {
          this.searchFlightModel.BackDate = dates[0].date;
        }
      }
    }
    this.flightService.setSearchFlightModel(this.searchFlightModel);
  }
}
