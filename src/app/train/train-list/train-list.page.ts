import { StaffBookType } from "src/app/hr/staff.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { TrainFilterComponent } from "./../components/train-filter/train-filter.component";
import { TrainscheduleComponent } from "./../components/trainschedule/trainschedule.component";
import { TrainSeatEntity } from "./../models/TrainSeatEntity";
import {
  TrainPassengerModel,
  ICurrentViewtTainItem,
  ITrainInfo
} from "./../train.service";
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
import { TmcService, PassengerBookInfo } from "src/app/tmc/tmc.service";
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
import { Observable, of, Subscription, combineLatest, from } from "rxjs";
import { SelectedTrainSegmentInfoComponent } from "../components/selected-train-segment-info/selected-train-segment-info.component";
import { FilterTrainCondition } from "../models/FilterCondition";
import { TripType } from "src/app/tmc/models/TripType";
import * as moment from "moment";
import { LanguageHelper } from "src/app/languageHelper";
import { map } from "rxjs/operators";
@Component({
  selector: "app-train-list",
  templateUrl: "./train-list.page.html",
  styleUrls: ["./train-list.page.scss"]
})
export class TrainListPage implements OnInit, OnDestroy {
  @ViewChild(IonRefresher) private ionRefresher: IonRefresher;
  @ViewChild(IonContent) private cnt: IonContent;
  @ViewChild(DaysCalendarComponent)
  private daysCalendarComp: DaysCalendarComponent;
  @ViewChild("list") private list: ElementRef<HTMLElement>;
  vmTrains: TrainEntity[] = [];
  private trains: TrainEntity[] = [];
  isLoading = false;
  isFiltered = false;
  vmFromCity: TrafficlineEntity;
  vmToCity: TrafficlineEntity;
  searchTrainModel: SearchTrainModel;
  timeoutid: any;
  isLeavePage = false;
  isSortingTrains = false;
  isShowAddPassenger$ = of(false);
  isShowRoundtripTip = false;
  passengersPolicies: TrainPassengerModel[];
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
  curFilteredBookInfo$: Observable<PassengerBookInfo<ITrainInfo>>;
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
    private modalCtrl: ModalController,
    private identityService: IdentityService
  ) {
    this.filterCondition = FilterTrainCondition.init();
  }
  ngOnDestroy() {
    this.searchModalSubscription.unsubscribe();
  }
  ngOnInit() {
    this.curFilteredBookInfo$ = this.trainService
      .getBookInfoSource()
      .pipe(map(infos => infos.find(info => info.isFilteredPolicy)));
    this.goRoundTripDateTime$ = this.trainService.getBookInfoSource().pipe(
      map(infos => {
        const go = infos.find(
          it => it.bookInfo && it.bookInfo.tripType == TripType.departureTrip
        );
        let goArrivalDateTime = "";
        let backDateTime = "";
        if (go && go.bookInfo.trainEntity) {
          const d = moment(go.bookInfo.trainEntity.ArrivalTime);
          goArrivalDateTime = d.format("YYYY-MM-DD HH:mm");
        }
        const back = infos.find(
          it => it.bookInfo && it.bookInfo.tripType == TripType.returnTrip
        );
        if (back && back.bookInfo.trainEntity) {
          const d = moment(back.bookInfo.trainEntity.StartTime);
          backDateTime = d.format("YYYY-MM-DD HH:mm");
        }
        return {
          goArrivalDateTime,
          backDateTime
        };
      })
    );
    this.isShowAddPassenger$ = from(this.staffService.isSelfBookType()).pipe(
      map(isSelf => !isSelf)
    );
    this.route.queryParamMap.subscribe(async _ => {
      this.isShowRoundtripTip = await this.staffService.isSelfBookType();
      this.isLeavePage = false;
      // if (!this.isLoading) {
      //   this.doRefresh(true, false);
      // }
    });
    this.searchModalSubscription = this.trainService
      .getSearchTrainModelSource()
      .subscribe(modal => {
        this.searchTrainModel = modal;
        console.log(
          "getSearchTrainModelSource",
          modal,
          this.isLeavePage,
          this.isLoading
        );
        if (this.searchTrainModel) {
          this.vmFromCity = modal.fromCity;
          this.vmToCity = modal.toCity;
          this.moveDayToSearchDate(
            this.calendarService.generateDayModelByDate(
              this.searchTrainModel.Date
            )
          );
          if (
            modal &&
            !this.isLeavePage &&
            !this.isLoading &&
            modal.isRefreshData
          ) {
            this.trainService.setSearchTrainModel({
              ...modal,
              isRefreshData: false
            });
            this.doRefresh(true, false);
          }
        }
      });
    this.selectedPassengersNumbers$ = this.trainService
      .getBookInfoSource()
      .pipe(map(infos => infos.length));
  }
  async schedules(train: TrainEntity) {
    if (!train.Schedules) {
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
    }
    const m = await this.modalCtrl.create({
      component: TrainscheduleComponent,
      componentProps: {
        schedules: train.Schedules,
        vmFromCity: this.vmFromCity,
        vmToCity: this.vmToCity
      }
    });
    m.present();
  }
  private async loadPolicyedTrainsAsync(): Promise<TrainEntity[]> {
    // 先获取最新的数据
    this.vmTrains = [];
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
    const notWhitelistPs = passengers.filter(p => p.isNotWhiteList); // 非白名单乘客
    const whitelistPs = passengers.filter(p => !p.isNotWhiteList); // 白名单的乘客，需要计算差标
    const whitelistAccountId = whitelistPs
      .map(p => p.AccountId)
      .reduce((acc, item) => {
        if (!acc.find(it => it == item)) {
          acc.push(item);
        }
        return acc;
      }, []);
    if (notWhitelistPs.length) {
      const policyTrains = await this.getWhitelistPolicyTrains(
        passengers,
        trains
      );

      // 非白名单可以预订所有的仓位
      const tmc = await this.tmcService.getTmc();
      const notWhitelistTrains = this.getNotWhitelistPolicyTrains(
        tmc && tmc.Account.Id,
        trains
      );
      this.passengersPolicies = policyTrains.concat([notWhitelistTrains]);
    } else {
      if (whitelistAccountId.length) {
        this.passengersPolicies = await this.trainService.policyAsync(
          trains,
          whitelistAccountId
        );
      }
    }
    if (
      this.passengersPolicies &&
      this.passengersPolicies.length === 0 &&
      passengers.length
    ) {
      trains = [];
      this.passengersPolicies = [];
      return [];
    }
    console.log(`所有人的差标：`, this.passengersPolicies);
    return (this.vmTrains = this.trains = trains);
  }
  private async getWhitelistPolicyTrains(
    passengers: StaffEntity[],
    trains: TrainEntity[]
  ) {
    trains = JSON.parse(JSON.stringify(trains || []));
    let policyTrains: TrainPassengerModel[] = [];
    const identity = await this.identityService.getIdentityAsync();
    // 白名单的乘客
    const ps = passengers.filter(p => !p.isNotWhiteList);
    if (ps.length > 0) {
      policyTrains = await this.trainService
        .policyAsync(trains, ps.map(p => p.AccountId))
        .catch(_ => []);
    }
    return policyTrains;
  }
  private getNotWhitelistPolicyTrains(
    PassengerKey: string,
    trains: TrainEntity[]
  ): TrainPassengerModel {
    trains = JSON.parse(JSON.stringify(trains || []));
    const trainPolicie: TrainPassengerModel = new TrainPassengerModel();
    trainPolicie.TrainPolicies = [];
    trains.forEach(it => {
      if (it.Seats) {
        it.Seats.forEach(s => {
          const p = new TrainPolicyModel();
          p.IsAllowBook = true;
          p.Rules = [];
          p.TrainNo = it.TrainNo;
          p.IsForceBook = it.IsForceBook;
          p.SeatType = s.SeatType;
          p.IsAllowBook = true;
          p.Rules = null;
          p.IsForceBook = false;
          s.Policy = p;
          trainPolicie.TrainPolicies.push(p);
        });
      }
    });
    // 非白名单的账号id 统一为一个，tmc的accountid
    trainPolicie.PassengerKey = PassengerKey;
    return trainPolicie;
  }
  private getUnSelectPassengers() {
    return this.trainService
      .getBookInfos()
      .filter(
        item =>
          !item.bookInfo ||
          !item.bookInfo.trainEntity ||
          !item.bookInfo.trainPolicy
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
    // this.doRefresh(false, false, d.data);
    this.isLoading = true;
    let data = this.filterPassengerPolicyTrains(d.data);
    data = this.filterTrains(data);
    this.vmTrains = data;
    this.isLoading = false;
  }
  goToSelectPassengerPage() {
    this.isLeavePage = true;
    this.router.navigate([AppHelper.getRoutePath("select-passenger")]);
  }
  async onFilter() {
    this.activeTab = "filter";
    const m = await this.modalCtrl.create({
      component: TrainFilterComponent,
      componentProps: {
        trains: this.trains
      }
    });
    if (m) {
      m.present();
      const result = await m.onDidDismiss();
      if (result && result.data) {
        this.filterCondition = result.data;
        this.doRefresh(false, true);
      }
    }
  }
  async onTimeOrder() {
    if (this.isSortingTrains) {
      return;
    }
    console.time("time");
    this.activeTab = "time";
    this.timeOrdM2N = !this.timeOrdM2N;
    this.sortTrains("time");
    console.timeEnd("time");
  }
  async onPriceOrder() {
    if (this.isSortingTrains) {
      return;
    }
    console.time("price");
    this.activeTab = "price";
    this.priceOrderL2H = !this.priceOrderL2H;
    this.sortTrains("price");
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
  async doRefresh(loadDataFromServer: boolean, keepSearchCondition: boolean) {
    if (this.ionRefresher) {
      this.ionRefresher.disabled = true;
      this.ionRefresher.complete();
      setTimeout(() => {
        this.ionRefresher.disabled = false;
      }, 100);
    }
    if (this.isLoading || this.isLeavePage) {
      return;
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
        this.filterCondition = FilterTrainCondition.init();
        setTimeout(() => {
          this.activeTab = "none";
        }, 0);
      }
      this.isLoading = true;
      let data: TrainEntity[] = this.trains;
      if (loadDataFromServer) {
        // 强制从服务器端返回新数据
        data = await this.loadPolicyedTrainsAsync();
      }
      // 根据筛选条件过滤航班信息：
      data = this.trainService.filterPassengerPolicyTrains(
        null,
        data,
        this.passengersPolicies
      );
      data = this.filterTrains(data);
      this.vmTrains = data;
      this.apiService.hideLoadingView();
      this.isLoading = false;
      if (this.ionRefresher) {
        this.ionRefresher.disabled = true;
        setTimeout(() => {
          this.ionRefresher.disabled = false;
        }, 100);
      }
      this.scrollToTop();
    } catch (e) {
      console.error(e);
      this.isLoading = false;
    }
  }
  async onBookTicket(train: TrainEntity, seat: TrainSeatEntity) {
    if (await this.trainService.checkCanAdd()) {
      const currentViewtTainItem: ICurrentViewtTainItem = {
        selectedSeat: seat,
        totalPolicies: this.passengersPolicies,
        train: train
      };
      this.trainService.addOrReselectBookInfo(currentViewtTainItem);
    }
    await this.showSelectedInfos();
  }
  private async showSelectedInfos() {
    const m = await this.modalCtrl.create({
      component: SelectedTrainSegmentInfoComponent
    });
    m.present();
  }
  private filterPassengerPolicyTrains(
    bookInfo: PassengerBookInfo<ITrainInfo>
  ): TrainEntity[] {
    let result: TrainEntity[] = this.trains;
    result = this.trainService.filterPassengerPolicyTrains(
      bookInfo,
      result,
      this.passengersPolicies
    );
    return result;
  }
  onSelectPassenger() {
    this.router.navigate([AppHelper.getRoutePath("select-passenger")]);
  }
  private scrollToTop() {
    setTimeout(() => {
      if (this.cnt) {
        this.cnt.scrollToTop(50);
      }
    }, 100);
  }
  private filterTrains(trains: TrainEntity[]) {
    console.log("this.filterCondition", this.filterCondition, trains);
    let result = trains;
    result = [];
    trains.forEach(t => {
      if (!result.find(it => it.TrainNo == t.TrainNo)) {
        result.push(t);
      }
    });
    result = this.filterByTrainType(result);
    result = this.filterByDepartureTimespan(result);
    result = this.filterByDepartureStations(result);
    result = this.filterByArrivalStations(result);
    return result;
  }
  private filterByDepartureTimespan(trains: TrainEntity[]) {
    if (
      trains &&
      this.filterCondition &&
      this.filterCondition.departureTimeSpan
    ) {
      return trains.filter(train => {
        const t = train.StartShortTime.split(":");
        const time = t && t.length && +t[0];
        return (
          time &&
          this.filterCondition.departureTimeSpan.lower <= time &&
          time <= this.filterCondition.departureTimeSpan.upper
        );
      });
    }
    return trains;
  }
  private filterByTrainType(trains: TrainEntity[]) {
    if (
      trains &&
      this.filterCondition &&
      this.filterCondition.trainTypes &&
      this.filterCondition.trainTypes.length
    ) {
      return trains.filter(train =>
        this.filterCondition.trainTypes.some(
          it => it.id == `${train.TrainType}`
        )
      );
    }
    return trains;
  }
  private filterByDepartureStations(trains: TrainEntity[]) {
    if (
      trains &&
      this.filterCondition &&
      this.filterCondition.departureStations &&
      this.filterCondition.departureStations.length
    ) {
      return trains.filter(train =>
        this.filterCondition.departureStations.some(
          it => it.id == train.FromStationCode
        )
      );
    }
    return trains;
  }
  private filterByArrivalStations(trains: TrainEntity[]) {
    if (
      trains &&
      this.filterCondition &&
      this.filterCondition.arrivalStations &&
      this.filterCondition.arrivalStations.length
    ) {
      return trains.filter(train =>
        this.filterCondition.arrivalStations.some(
          it => it.id == train.ToStationCode
        )
      );
    }
    return trains;
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
          item.bookInfo &&
          item.bookInfo.tripType == TripType.departureTrip
      );
      const goTrain = info && info.bookInfo && info.bookInfo.trainEntity;
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
    if (this.isSortingTrains) {
      return;
    }
    this.isLoading = true;
    this.isSortingTrains = true;
    if (!this.filterCondition) {
      this.filterCondition = FilterTrainCondition.init();
    }
    if (key === "price") {
      this.filterCondition.priceFromL2H = this.priceOrderL2H
        ? "low2Height"
        : "height2Low";
      this.filterCondition.timeFromM2N = "initial";
      this.sortByPrice(this.priceOrderL2H);
    }
    if (key === "time") {
      this.filterCondition.timeFromM2N = this.timeOrdM2N ? "am2pm" : "pm2am";
      this.filterCondition.priceFromL2H = "initial";
      this.sortByTime(this.timeOrdM2N);
    }
    this.scrollToTop();
    this.isSortingTrains = false;
    this.isLoading = false;
  }
  private sortByPrice(priceOrderL2H: boolean) {
    console.time("sortByPrice");
    if (this.vmTrains) {
      this.vmTrains.sort((a, b) => {
        const sub =
          this.getTrainLowestSeatPrice(a) - this.getTrainLowestSeatPrice(b);
        return priceOrderL2H ? sub : -sub;
      });
    }
    console.timeEnd("sortByPrice");
  }
  private getTrainLowestSeatPrice(train: TrainEntity) {
    if (!train || !train.Seats || !train.Seats.length) {
      return 0;
    }
    train.Seats.sort((s1, s2) => {
      return +s1.SalesPrice - +s2.SalesPrice;
    });
    return +train.Seats[0].SalesPrice;
  }
  private sortByTime(timeOrdM2N: Boolean) {
    if (this.vmTrains) {
      this.vmTrains.sort((a, b) => {
        const sub = a && b && a.StartTimeStamp - b.StartTimeStamp;
        return timeOrdM2N ? sub : -sub;
      });
    }
  }
}
