import { TrainService, SearchTrainModel } from './../train.service';
import { TrafficlineEntity } from './../../tmc/models/TrafficlineEntity';
import { IdentityService } from "../../services/identity/identity.service";
import { ApiService } from "src/app/services/api/api.service";
import { StaffEntity, StaffBookType } from "src/app/hr/staff.service";
import { StaffService } from "../../hr/staff.service";
import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { Component, OnInit, OnDestroy, AfterViewInit } from "@angular/core";
import * as moment from "moment";
import { Subscription, Observable } from "rxjs";
import { DayModel } from "../../tmc/models/DayModel";
import { ModalController, NavController } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { CredentialsEntity } from "src/app/tmc/models/CredentialsEntity";
import { TripType } from 'src/app/tmc/models/TripType';
import { TrainBookInfo } from '../train.service';
import { TrainEntity } from '../models/TrainEntity';
import { TrainDayService } from '../trainDay.service';
@Component({
  selector: "app-search-train",
  templateUrl: "./search-train.page.html",
  styleUrls: ["./search-train.page.scss"]
})
export class SearchTrainPage implements OnInit, OnDestroy, AfterViewInit {
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
  searchFlightModel: SearchTrainModel;
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
    private navCtrl: NavController,
    private storage: Storage,
    private staffService: StaffService,
    private identityService: IdentityService,
    private apiService: ApiService,
    private trainService:TrainService,
    private trainDayService:TrainDayService
  ) {
    route.queryParamMap.subscribe(async _ => {
      this.staff = await this.staffService.getStaff();
      if (await this.isStaffTypeSelf()) {
        this.disabled =
          this.searchFlightModel && this.searchFlightModel.isLocked;
        if (
          this.trainService.getBookInfos().length == 0 ||
          this.trainService.getBookInfos().length == 0
        ) {
          if (this.staff && !this.staff.Name) {
            const identity = await this.identityService.getIdentityAsync();
            this.staff.Name = identity && identity.Name;
          }
          const item: TrainBookInfo = {
            credential: new CredentialsEntity(),
            passenger: this.staff
          };
          this.trainService.addBookInfo(item);
          const searchModel = this.trainService.getSearchTrainModel();
          searchModel.tripType = TripType.departureTrip;
          this.trainService.setSearchTrainModel(searchModel);
          this.trainService.addBookInfo(item);
        }
      }
      this.showReturnTrip = await this.isStaffTypeSelf();
      this.selectedPassengers = trainService.getBookInfos().length;
      if (this.searchConditionSubscription) {
        this.searchConditionSubscription.unsubscribe();
      }
      this.searchConditionSubscription = this.trainService
        .getSearchTrainModelSource()
        .subscribe(async s => {
          console.log("search-flights", s);
          const staff = await this.staffService.getStaff();
          this.showReturnTrip = staff.BookType == StaffBookType.Self;
          if (s) {
            this.disabled = s.isLocked;
            this.fromCity = this.vmFromCity = s.fromCity || this.fromCity;
            this.toCity = this.vmToCity = s.toCity || this.toCity;
            this.flyDate = this.trainDayService.generateDayModelByDate(s.Date);
            this.backDate = this.trainDayService.generateDayModelByDate(
              s.BackDate
            );
            this.isSingle = !s.isRoundTrip;
          }
        });
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
    return +this.trainDayService.getMonth(d);
  }
  ngAfterViewInit(): void {
    console.log("ngAfterViewInit");
  }
  segmentChanged(evt: CustomEvent) {
    // console.log("evt.detail.value", evt.detail.value);
    this.onRoundTrip(evt.detail.value == "single");
  }
  async isStaffTypeSelf() {
    return await this.staffService.isStaffTypeSelf();
  }
  async ngOnInit() {
    this.selectDaySubscription = this.trainDayService
      .getSelectedFlyDays()
      .subscribe(days => {
        if (days && days.length) {
          if (days.length == 1) {
            if (this.disabled) {
              this.backDate = days[0];
            } else {
              this.flyDate = days[0];
              this.flyDate = days[0];
              this.backDate = this.trainDayService.generateDayModel(
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
            this.flyDate = this.trainDayService.generateDayModel(moment());
          }
        }
      });
    this.apiService.showLoadingView();
    const s = await this.staffService.getStaff();
    this.showReturnTrip = s.BookType == StaffBookType.Self;
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
    this.flyDate = this.trainDayService.generateDayModel(
      moment()
      // 默认第二天
      // .add(1, "days")
    );
    this.flyDate.hasToolTip = false;
    this.flyDate.enabled = true;
    this.flyDate.desc = "去程";
    this.flyDate.descPos = "top";
    this.backDate = this.trainDayService.generateDayModel(moment().add(4, "days"));
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
      const stations = await this.trainService.getStationsAsync();
      if (stations && stations.length) {
        const vmFromCity = (this.fromCity = stations.find(
          c => c.Code.toUpperCase() == this.fromCity.Code
        ));
        const vmToCity = (this.toCity = stations.find(
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
    const s = new SearchTrainModel();
    s.tripType = TripType.departureTrip;
    const staff = await this.staffService.getStaff();
    if (staff.BookType == StaffBookType.Self) {
      const exists = this.trainService
        .getBookInfos()
        .filter(
          item => item.passenger && item.passenger.AccountId == staff.AccountId
        );
      let goTrain: TrainEntity;
      const info = exists.find(
        it =>
          it.trainInfo &&
          it.trainInfo.tripType == TripType.departureTrip
      );
      if (info) {
        s.tripType = TripType.returnTrip;
        goTrain =
          info.trainInfo && info.trainInfo.trainEntity;
      } else {
        s.tripType = TripType.departureTrip;
      }
      if (s.tripType == TripType.returnTrip && goTrain) {
        const arrivalDate = moment(goTrain.ArrivalTime);
        if (
          +moment(this.backDate.date) <
          +moment(arrivalDate.format("YYYY-MM-DD"))
        ) {
          this.backDate = this.trainDayService.generateDayModel(arrivalDate);
        }
      }
    }
    s.Date = this.flyDate.date;
    s.FromStation = this.fromCity.Code;
    s.ToStation = this.toCity.Code;
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
    console.log("search-train", s);
    this.trainService.setSearchTrainModel(s);
    this.router.navigate([AppHelper.getRoutePath("train-list")]);
  }
  getDayDesc(d: DayModel) {
    return this.trainDayService.getDescOfDay(d);
  }
  onSelecFlyDate(flyTo: boolean, backDate: boolean) {
    if (this.disabled && !backDate) {
      return;
    }
    this.isSelectFlyDate = flyTo;
    this.trainDayService.setFlyDayMulti(!this.isSingle && !this.disabled);
    this.trainDayService.showSelectFlyDatePage(true);
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
