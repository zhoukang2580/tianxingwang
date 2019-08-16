import { TrainscheduleComponent } from "./../components/trainschedule/trainschedule.component";
import { TrainSeatEntity } from "./../models/TrainSeatEntity";
import { TrainPassengerModel } from "./../train.service";
import { StaffService, StaffEntity } from "./../../hr/staff.service";
import { ApiService } from "./../../services/api/api.service";
import { CalendarService } from "./../../tmc/calendar.service";
import { TrafficlineEntity } from "./../../tmc/models/TrafficlineEntity";
import { TrainEntity } from "./../models/TrainEntity";
import {
  TrainService,
  SearchTrainModel,
  TrainPolicyModel
} from "src/app/train/train.service";
import { TmcService } from "src/app/tmc/tmc.service";
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy
} from "@angular/core";
import {
  IonRefresher,
  IonContent,
  DomController,
  PopoverController,
  NavController,
  ModalController
} from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { DayModel } from "src/app/tmc/models/DayModel";
import { DaysCalendarComponent } from "src/app/tmc/components/days-calendar/days-calendar.component";
// tslint:disable-next-line: max-line-length
import { FilterPassengersPolicyComponent } from "src/app/tmc/components/filter-passengers-popover/filter-passengers-policy-popover.component";
import { Observable, of, Subscription } from "rxjs";
import { SelectedTrainSegmentInfoComponent } from "../components/selected-train-segment-info/selected-train-segment-info.component";
import { FilterTrainCondition } from "../models/FilterCondition";
import { NOT_WHITE_LIST } from "src/app/tmc/select-passenger/select-passenger.page";
import { TripType } from "src/app/tmc/models/TripType";
import * as moment from "moment";
import { LanguageHelper } from "src/app/languageHelper";
@Component({
  selector: "app-train-list",
  templateUrl: "./train-list.page.html",
  styleUrls: ["./train-list.page.scss"]
})
export class TrainListPage implements OnInit, OnDestroy {
  @ViewChild(IonRefresher) ionRefresher: IonRefresher;
  @ViewChild(IonContent) cnt: IonContent;
  @ViewChild(DaysCalendarComponent) daysCalendarComp: DaysCalendarComponent;
  @ViewChild("list") list: ElementRef<HTMLElement>;
  private refMap = new WeakMap<TrainEntity, any>();
  trains: TrainEntity[] = [];
  isLoading = false;
  isFiltered = false;
  vmFromCity: TrafficlineEntity;
  vmToCity: TrafficlineEntity;
  searchTrainModel: SearchTrainModel;
  timeoutid: any;
  isLeavePage = false;
  isShowAddPassengerButton = false;
  isShowRoundtripTip = false;
  policyTrains: TrainPassengerModel[];
  activeTab: "filter" | "time" | "price" | "none"; // 当前激活的tab
  selectedPassengersNumbers$: Observable<number> = of(0);
  goRoundTripDateTime$: Observable<{
    goArrivalDateTime: string;
    backDateTime: string;
  }>;
  priceOrderL2H: boolean; // 价格从低到高
  timeOrdM2N: boolean; // 时间从早到晚
  filterCondition: FilterTrainCondition;
  searchModalSubscription = Subscription.EMPTY;
  constructor(
    private tmcService: TmcService,
    private trainService: TrainService,
    private router: Router,
    private domCtrl: DomController,
    private calendarService: CalendarService,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private staffService: StaffService,
    private popoverController: PopoverController,
    private navCtrl: NavController,
    private modalCtrl: ModalController
  ) {}
  ngOnDestroy() {
    this.searchModalSubscription.unsubscribe();
  }
  ngOnInit() {
    this.route.queryParamMap.subscribe(_ => {
      this.onSearchCondition();
      this.isShowAddPassengerButton = !this.staffService.isSelfBookType;
      this.isShowRoundtripTip = this.staffService.isSelfBookType;
      this.isLeavePage = false;
    });
    this.doRefresh(true, true);
    this.searchModalSubscription = this.trainService
      .getSearchTrainModelSource()
      .subscribe(modal => {
        this.searchTrainModel = modal;
        if (this.searchTrainModel) {
          this.vmFromCity = this.searchTrainModel.fromCity;
          this.vmToCity = this.searchTrainModel.toCity;
          this.moveDayToSearchDate(
            this.calendarService.generateDayModelByDate(
              this.searchTrainModel.Date
            )
          );
        }
      });
  }
  async schedules(train: TrainEntity) {
    const trains = await this.trainService.scheduleAsync({
      Date: moment(train.StartTime).format("YYYY-MM-DD"),
      FromStation: train.FromStationCode,
      ToStation: train.ToStationCode,
      TrainNo: train.TrainNo,
      TrainCode: train.TrainCode
    });
    if (trains && trains.length) {
      train.Schedules = trains[0].Schedules;
    }
    const m = await this.modalCtrl.create({
      component: TrainscheduleComponent,
      componentProps: {
        schedules: train.Schedules
      }
    });
    m.present();
  }
  private onSearchCondition() {
    this.searchTrainModel = this.trainService.getSearchTrainModel();
    this.vmFromCity = this.searchTrainModel.fromCity;
    this.vmToCity = this.searchTrainModel.toCity;
  }
  private async loadPolicyedTrainsAsync(
    passengerId?: string
  ): Promise<TrainEntity[]> {
    // 先获取最新的数据
    this.trains = [];
    let trains = await this.trainService.searchAsync(this.searchTrainModel);
    if (trains.length == 0) {
      return [];
    }
    let passengers = this.getUnSelectPassengers();
    if (passengers.length == 0) {
      passengers = this.trainService.getBookInfos().map(info => info.passenger);
    }
    const hasreselect = this.trainService
      .getBookInfos()
      .find(item => item.isReplace);
    if (hasreselect) {
      if (
        !passengers.find(p => p.AccountId == hasreselect.passenger.AccountId)
      ) {
        passengers.push(hasreselect.passenger);
      }
    }
    const hasNotWhitelist = passengers.find(p => p.isNotWhiteList);
    const whitelist = passengers.map(p => p.AccountId);
    if (hasNotWhitelist) {
      let policyTrains: TrainPassengerModel[];
      // 白名单的乘客
      const ps = passengers.filter(p => !p.isNotWhiteList);
      if (ps.length > 0) {
        policyTrains = await this.trainService.policyAsync(
          trains,
          passengerId ? [passengerId] : ps.map(p => p.AccountId)
        );
      }
      // 非白名单可以预订所有的仓位

      const notWhitelistTrains = this.getNotWhitelistPolicyTrains(
        hasNotWhitelist.AccountId,
        trains
      );
      this.policyTrains = policyTrains.concat(notWhitelistTrains);
      console.log(this.policyTrains);
    } else {
      if (whitelist.length) {
        this.policyTrains = await this.trainService.policyAsync(
          trains,
          passengerId ? [passengerId] : whitelist
        );
      }
    }
    if (
      this.policyTrains &&
      this.policyTrains.length === 0 &&
      whitelist.length
    ) {
      trains = [];
      this.policyTrains = [];
      return [];
    }
    return (this.trains = trains);
  }

  private getNotWhitelistPolicyTrains(
    passengerKey: string,
    trains: TrainEntity[]
  ): {
    PassengerKey: string;
    TrainPolicies: TrainPolicyModel[];
  } {
    const TrainPolicies: TrainPolicyModel[] = [];
    trains.forEach(it => {
      if (it.Seats) {
        it.Seats.forEach(s => {
          const m = new TrainPolicyModel();
          m.IsAllowBook = true;
          m.Rules = [];
          m.TrainNo = it.TrainNo;
          m.SeatType = s.SeatType;
          TrainPolicies.push(m);
        });
      }
    });
    return {
      PassengerKey: passengerKey, // 非白名单的账号id 统一为一个，tmc的accountid
      TrainPolicies
    };
  }
  private getUnSelectPassengers() {
    return this.trainService
      .getBookInfos()
      .filter(
        item =>
          !item.trainInfo ||
          !item.trainInfo.trainEntity ||
          !item.trainInfo.trainPolicy
      )
      .map(item => item.passenger)
      .reduce(
        (arr, item) => {
          if (!arr.find(i => i.AccountId == item.AccountId)) {
            arr.push(item);
          }
          return arr;
        },
        [] as StaffEntity[]
      );
  }

  async filterPolicyTrains() {
    const popover = await this.popoverController.create({
      component: FilterPassengersPolicyComponent,
      componentProps: {
        bookInfos$: this.trainService.getBookInfoSource()
      },
      translucent: true
    });
    await popover.present();
    const d = await popover.onDidDismiss();
    if (d && d.data) {
      this.doRefresh(true, false, d.data, true);
    } else {
      this.doRefresh(true, false);
    }
  }
  goToSelectPassengerPage() {
    this.isLeavePage = true;
    this.router.navigate([AppHelper.getRoutePath("select-passenger")]);
  }
  onFilter() {
    this.activeTab = "filter";
    // this.trainService.setFilterPanelShow(true);
  }
  async onTimeOrder() {
    console.time("time");
    this.isLoading = true;
    this.activeTab = "time";
    this.timeOrdM2N = !this.timeOrdM2N;
    this.sortTrains("time");
    this.isLoading = false;
    console.timeEnd("time");
  }
  async onPriceOrder() {
    console.time("price");
    this.isLoading = true;
    this.activeTab = "price";
    this.priceOrderL2H = !this.priceOrderL2H;
    this.sortTrains("price");
    this.isLoading = false;
    console.timeEnd("price");
  }
  async showSelectedBookInfos() {
    const modal = await this.modalCtrl.create({
      component: SelectedTrainSegmentInfoComponent
    });
    await this.trainService.dismissAllTopOverlays();
    await modal.present();
    await modal.onDidDismiss();
  }
  private moveDayToSearchDate(d?: DayModel) {
    this.domCtrl.write(_ => {
      if (this.daysCalendarComp) {
        const day =
          d ||
          this.calendarService.generateDayModelByDate(
            this.searchTrainModel.Date
          );
        setTimeout(() => {
          if (this.daysCalendarComp) {
            this.daysCalendarComp.onDaySelected(day);
          }
        }, 1000);
      }
    });
  }
  async doRefresh(
    loadDataFromServer: boolean,
    keepSearchCondition: boolean,
    toBeFilteredPassengerId?: string,
    filterPolicy?: boolean
  ) {
    if (this.ionRefresher) {
      this.ionRefresher.disabled = true;
      this.ionRefresher.complete();
    }
    this.moveDayToSearchDate();
    if (this.timeoutid) {
      clearTimeout(this.timeoutid);
    }
    try {
      if (this.isLeavePage || this.isLoading) {
        return;
      }
      this.moveDayToSearchDate();

      this.apiService.showLoadingView();
      if (!keepSearchCondition) {
        setTimeout(() => {
          this.activeTab = "none";
        }, 0);
      }
      this.isLoading = true;
      let data: TrainEntity[] = JSON.parse(JSON.stringify(this.trains));
      if (loadDataFromServer) {
        // 强制从服务器端返回新数据
        data = await this.loadPolicyedTrainsAsync(toBeFilteredPassengerId);
      }
      // 根据筛选条件过滤航班信息：
      data = this.filterTrains(data);
      if (filterPolicy) {
      }
      this.apiService.hideLoadingView();
      this.isLoading = false;
      if (this.ionRefresher) {
        this.ionRefresher.disabled = true;
        setTimeout(() => {
          this.ionRefresher.disabled = false;
        }, 100);
      }
    } catch (e) {
      console.error(e);
      this.isLoading = false;
    }
  }
  onSelectPassenger() {
    this.router.navigate([AppHelper.getRoutePath("select-passenger")]);
  }
  private scrollToTop() {
    setTimeout(() => {
      if (this.cnt) {
        this.cnt.scrollToTop(100);
      }
    }, 100);
  }
  private filterTrains(trains: TrainEntity[]) {
    let result = trains;
    return result;
  }
  async onChangedDay(day: DayModel, byUser: boolean) {
    if (
      byUser &&
      !this.isLeavePage &&
      (!day || this.searchTrainModel.Date == day.date || this.isLoading)
    ) {
      return;
    }
    if (this.searchTrainModel.tripType == TripType.returnTrip) {
      const bookInfos = this.trainService.getBookInfos();
      const info = bookInfos.find(
        item =>
          item &&
          item.flightSegmentInfo &&
          item.flightSegmentInfo.tripType == TripType.departureTrip
      );
      const goTrain = info && info.trainInfo && info.trainInfo.trainEntity;
      if (goTrain) {
        let goDay = moment(goTrain.ArrivalTime);
        goDay = moment(goDay.format("YYYY-MM-DD"));
        const backDate = day;
        if (+moment(backDate.date) < +goDay) {
          await AppHelper.toast(
            LanguageHelper.Flight.getBackDateCannotBeforeGoDateTip(),
            1000,
            "middle"
          );
          return;
        }
      }
    } else {
      if (this.searchTrainModel.isRoundTrip) {
        if (+moment(day.date) > +moment(this.searchTrainModel.BackDate)) {
          this.searchTrainModel.BackDate = moment(day.date)
            .add(1, "days")
            .format("YYYY-MM-DD");
        }
      }
    }
    if (!this.filterCondition) {
      this.filterCondition = FilterTrainCondition.init();
    }
    this.filterCondition.priceFromL2H = "initial";
    this.filterCondition.timeFromM2N = "initial";
    this.activeTab = "none";
    this.searchTrainModel.Date = day.date;
    this.trainService.setSearchTrainModel(this.searchTrainModel);
    this.doRefresh(true, true);
  }
  onCalenderClick() {
    this.trainService.openCalendar(false);
  }

  back() {
    this.isLeavePage = true;
    this.navCtrl.back();
  }
  private sortTrains(key: "price" | "time") {
    if (!this.filterCondition) {
      this.filterCondition = FilterTrainCondition.init();
    }
    if (key === "price") {
      this.filterCondition.priceFromL2H = this.priceOrderL2H
        ? "low2Height"
        : "height2Low";
      this.filterCondition.timeFromM2N = "initial";
      const segments = this.sortByPrice(this.priceOrderL2H);
    }
    if (key === "time") {
      this.filterCondition.timeFromM2N = this.timeOrdM2N ? "am2pm" : "pm2am";
      this.filterCondition.priceFromL2H = "initial";
      this.sortByTime(this.timeOrdM2N);
    }
    this.scrollToTop();
  }
  private sortByPrice(priceOrderL2H: boolean) {}
  private sortByTime(timeOrdM2N: Boolean) {
    if (this.trains) {
      this.trains.sort((a, b) => {
        const sub = a && b && a.StartTimeStamp - b.StartTimeStamp;
        return timeOrdM2N ? sub : -sub;
      });
    }
  }
}
