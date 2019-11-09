import { LanguageHelper } from 'src/app/languageHelper';
import { CanComponentDeactivate } from 'src/app/guards/candeactivate.guard';
import { FlightHotelTrainType } from "./../../tmc/tmc.service";
import { TrainService, SearchTrainModel } from "./../train.service";
import { TrafficlineEntity } from "./../../tmc/models/TrafficlineEntity";
import { IdentityService } from "../../services/identity/identity.service";
import { ApiService } from "src/app/services/api/api.service";
import { StaffEntity, StaffBookType } from "src/app/hr/staff.service";
import { StaffService } from "../../hr/staff.service";
import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { Component, OnInit, OnDestroy, AfterViewInit } from "@angular/core";
import * as moment from "moment";
import { Subscription, Observable, of, from } from "rxjs";
import { DayModel } from "../../tmc/models/DayModel";
import { ModalController, NavController } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { CredentialsEntity } from "src/app/tmc/models/CredentialsEntity";
import { TripType } from "src/app/tmc/models/TripType";
import { TrainEntity } from "../models/TrainEntity";
import { CalendarService } from "src/app/tmc/calendar.service";
import { PassengerBookInfo, TmcService } from "src/app/tmc/tmc.service";
import { map } from "rxjs/operators";
import { SelectedTrainSegmentInfoComponent } from "../components/selected-train-segment-info/selected-train-segment-info.component";
@Component({
  selector: "app-search-train",
  templateUrl: "./search-train.page.html",
  styleUrls: ["./search-train.page.scss"]
})
export class SearchTrainPage implements OnInit, OnDestroy, AfterViewInit, CanComponentDeactivate {
  private isCanLeave = true;
  toggleCities = false; // 没有切换城市顺序
  rotateIcon = false;
  isSingle = true;
  goDate: DayModel;
  backDate: DayModel;
  isShowSelectedInfos$ = of(false);
  canAddPassengers = false;
  // selectDaySubscription = Subscription.EMPTY;
  searchConditionSubscription = Subscription.EMPTY;
  searchTrainModel: SearchTrainModel = new SearchTrainModel();
  isMoving: boolean;
  vmFromCity: TrafficlineEntity; // 界面上显示的城市
  vmToCity: TrafficlineEntity; // 界面上显示的城市
  fromCity: TrafficlineEntity; // 城市切换后，真实的出发城市
  toCity: TrafficlineEntity; // 切换后，真实的目的城市
  showReturnTrip = false;
  isDisabled = false;
  selectedPassengers: number;
  selectedBookInfos: number;
  staff: StaffEntity;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private storage: Storage,
    private staffService: StaffService,
    private identityService: IdentityService,
    private apiService: ApiService,
    private trainService: TrainService,
    private calendarService: CalendarService,
    private tmcService: TmcService,
    private modalCtrl: ModalController
  ) {

  }
  private checkBackDateIsAfterGoDate() {
    if (!this.goDate || (this.goDate.timeStamp < Math.floor(new Date().getTime() / 1000))) {
      this.goDate = this.calendarService.generateDayModel(moment());
    }
    if (this.goDate && this.backDate) {
      this.backDate = this.goDate.timeStamp > this.backDate.timeStamp ?
        this.calendarService.generateDayModel(moment(this.goDate.date).add(1, 'days')) : this.backDate;
    }
  }
  back() {
    this.router.navigate(['']);
  }
  async onShowSelectedBookInfos() {
    const m = await this.modalCtrl.create({
      component: SelectedTrainSegmentInfoComponent
    });
    m.present();
  }
  private onRoundTrip(single: boolean) {
    // console.log("onRoundTrip isSingle", single);
    this.isSingle = single;
    this.trainService.setSearchTrainModel({
      ...this.trainService.getSearchTrainModel(),
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
    return await this.staffService.isSelfBookType();
  }
  async ngOnInit() {
    this.isShowSelectedInfos$ = this.trainService
      .getBookInfoSource()
      .pipe(
        map(infos => infos && infos.filter(it => !!it.bookInfo).length > 0)
      );
    this.apiService.showLoadingView();
    this.apiService.hideLoadingView();
    this.searchConditionSubscription = this.trainService
      .getSearchTrainModelSource()
      .subscribe(async s => {
        console.log("search-train", s);
        this.searchTrainModel = s;
        if (this.searchTrainModel) {
          this.searchTrainModel.isExchange = s.isExchange;
          this.isDisabled = s.isLocked;
          this.fromCity = this.vmFromCity = s.fromCity || this.fromCity;
          this.toCity = this.vmToCity = s.toCity || this.toCity;
          this.goDate = this.calendarService.generateDayModelByDate(s.Date);
          this.backDate = this.calendarService.generateDayModelByDate(
            s.BackDate
          );
          this.checkBackDateIsAfterGoDate();
          this.isSingle = !s.isRoundTrip;
        }
      });
    this.canAddPassengers = !(await this.staffService.isSelfBookType());
    await this.initTrainCities();
    this.route.queryParamMap.subscribe(async _ => {
      await this.initTrainDays();
      this.staff = await this.staffService.getStaff();
      this.canAddPassengers = await this.staffService.isAllBookType() || await this.staffService.isSecretaryBookType();
      if (await this.isStaffTypeSelf()) {
        this.isDisabled =
          this.searchTrainModel && this.searchTrainModel.isLocked;
      }
      const searchTrainModel = this.trainService.getSearchTrainModel();
      this.searchTrainModel.isExchange = searchTrainModel.isExchange
        || !!this.trainService.getBookInfos().find(it => it.bookInfo && it.bookInfo.isExchange);
      this.isCanLeave = this.searchTrainModel.isExchange ? false : true;
      this.selectedPassengers = this.trainService.getBookInfos().length;
      this.selectedBookInfos = this.trainService
        .getBookInfos()
        .filter(it => it.bookInfo).length;
    });
  }
  calcTotalFlyDays(): number {
    if (this.backDate && this.goDate) {
      const nums = Math.abs(moment(this.backDate.date).diff(moment(this.goDate.date), 'days'));
      return nums <= 0 ? 1 : nums;
    }
    return 1;
  }

  onSelectPassenger() {
    this.router.navigate([AppHelper.getRoutePath("select-passenger")], { queryParams: { forType: FlightHotelTrainType.Train } });
  }

  ngOnDestroy(): void {
    console.log("on destroyed");
    this.searchConditionSubscription.unsubscribe();
  }
  async initTrainDays() {
    const identity = await this.identityService.getIdentityAsync();
    const lastSelectedGoDate = await this.storage.get(`last_selected_train_goDate_${identity && identity.Id}`) || moment().format("YYYY-MM-DD");
    this.trainService.setSearchTrainModel({
      ...this.trainService.getSearchTrainModel(),
      Date: lastSelectedGoDate
    });
  }
  async initTrainCities() {
    if (this.fromCity && this.fromCity.Code && this.toCity && this.toCity.Code) {
      return;
    }
    this.fromCity = this.vmFromCity = {} as any;
    this.toCity = this.vmToCity = {} as any;
    this.fromCity.Nickname = this.fromCity.CityName = this.vmFromCity.CityName =
      "北京";
    this.toCity.Nickname = this.toCity.CityName = this.vmToCity.CityName =
      "上海";
    this.vmFromCity.Code = this.fromCity.Code = "BJP";
    this.vmToCity.Code = this.toCity.Code = "SHH";
    const lastFromCity = await this.storage.get("fromTrainStation");
    const lastToCity = await this.storage.get("toTrainStation");
    if (!lastFromCity || !lastToCity) {
      const stations = await this.trainService.getStationsAsync();
      if (stations && stations.length) {
        const vmFromCity = stations.find(
          c => c.Code.toUpperCase() == this.fromCity.Code
        );
        const vmToCity = stations.find(
          c => c.Code.toUpperCase() == this.toCity.Code
        );
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
  async searchTrain() {
    console.log(
      `出发城市" + 【${this.fromCity && this.fromCity.Nickname}】`,
      `目的城市【${this.toCity && this.toCity.Nickname}】`
    );
    console.log(`启程日期${this.goDate.date},返程日期：${this.backDate.date}`);
    this.storage.set("fromTrainStation", this.fromCity);
    this.storage.set("toTrainStation", this.toCity);
    const s = this.searchTrainModel || new SearchTrainModel();
    s.tripType = this.searchTrainModel.tripType || TripType.departureTrip;
    s.Date = this.goDate.date;
    s.FromStation = this.fromCity.Code;
    s.ToStation = this.toCity.Code;
    s.isRoundTrip = !this.isSingle;
    s.fromCity = this.fromCity;
    s.toCity = this.toCity;
    s.BackDate = this.backDate.date;
    if (this.isDisabled) {
      s.Date = s.BackDate;
    }
    if (!s.isRoundTrip) {
      s.tripType = TripType.departureTrip;
    }
    console.log("search-train", s);
    this.isCanLeave = true;
    this.trainService.setSearchTrainModel(s);
    this.router.navigate([AppHelper.getRoutePath("train-list")]).then(_ => {
    });
    const identity = await this.identityService.getIdentityAsync();
    if (identity) {
      await this.storage.set(`last_selected_train_goDate_${identity && identity.Id}`, s.Date);
    }
  }
  getDayDesc(d: DayModel) {
    return this.calendarService.getDescOfDay(d);
  }
  async onSelecDate(isGo: boolean, isBack: boolean) {
    if (this.isDisabled && !this.searchTrainModel.isExchange && !isBack) {
      return;
    }
    const days = await this.trainService.openCalendar(false);
    // console.log("train openCalendar", days);
    if (days && days.length) {
      if (this.searchTrainModel) {
        if (isGo) {
          this.searchTrainModel.Date = days[0].date;
        }
        if (isBack) {
          this.searchTrainModel.BackDate = days[0].date;
        }
        this.trainService.setSearchTrainModel(this.searchTrainModel);
      }
    }
  }
  onCitiesSelected(c: { vmTo: TrafficlineEntity; vmFrom: TrafficlineEntity }) {
    if (c) {
      this.trainService.setSearchTrainModel({
        ...this.trainService.getSearchTrainModel(),
        fromCity: c.vmFrom,
        toCity: c.vmTo
      })
    }
  }
  async canDeactivate() {
    if (this.isCanLeave) {
      return true;
    }
    if (this.trainService.exchangedTrainTicketInfo) {
      const ok = await AppHelper.alert("是否放弃改签？", true, LanguageHelper.getConfirmTip(), LanguageHelper.getCancelTip());
      if (ok) {
        this.trainService.exchangedTrainTicketInfo = null;
        this.trainService.setSearchTrainModel({
          ...this.trainService.getSearchTrainModel(),
          isExchange: false,
          isLocked: false
        });
        this.trainService.removeAllBookInfos();
        return true;
      }
    }
    return false;
  }
}
