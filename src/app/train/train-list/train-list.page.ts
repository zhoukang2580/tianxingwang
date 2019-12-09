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
import {
  TmcService,
  PassengerBookInfo,
  FlightHotelTrainType
} from "src/app/tmc/tmc.service";
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  AfterViewInit,
  QueryList,
  ViewChildren,
  AfterContentInit
} from "@angular/core";
import {
  IonRefresher,
  IonContent,
  DomController,
  PopoverController,
  NavController,
  ModalController,
  IonInfiniteScroll
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
import { map, tap } from "rxjs/operators";
import { Storage } from "@ionic/storage";
import { SelectTrainStationModalComponent } from 'src/app/tmc/components/select-stations/select-station.component';
@Component({
  selector: "app-train-list",
  templateUrl: "./train-list.page.html",
  styleUrls: ["./train-list.page.scss"]
})
export class TrainListPage implements OnInit, OnDestroy {
  @ViewChild(DaysCalendarComponent) private daysCalendarComp: DaysCalendarComponent;
  @ViewChild(IonRefresher) private ionRefresher: IonRefresher;
  @ViewChild(IonInfiniteScroll) private scroller: IonInfiniteScroll;
  @ViewChild(IonContent) private cnt: IonContent;
  private pageSize = 15;
  private lastSelectedPassengerIds: string[];
  private currentSelectedPassengerIds: string[];
  private trains: TrainEntity[] = [];
  private trainsForRender: TrainEntity[] = [];
  progressName = "";
  trainsCount = 0;
  vmTrains: TrainEntity[] = [];
  isLoading = false;
  get isFiltered() {
    return this.filterCondition && (this.filterCondition.arrivalStations && this.filterCondition.arrivalStations.length || this.filterCondition.departureStations && this.filterCondition.departureStations.length || this.filterCondition.trainTypes && this.filterCondition.trainTypes.length || this.filterCondition.departureTimeSpan && (this.filterCondition.departureTimeSpan.lower > 0 || this.filterCondition.departureTimeSpan.upper < 24))
  };
  vmFromCity: TrafficlineEntity;
  vmToCity: TrafficlineEntity;
  searchTrainModel: SearchTrainModel;
  timeoutid: any;
  isSortingTrains = false;
  isShowAddPassenger$ = of(false);
  isShowRoundtripTip = false;
  // passengersPolicies: TrainPassengerModel[];
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
    private storage: Storage,
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
    this.route.queryParamMap.subscribe(async _ => {
      this.isShowRoundtripTip = await this.staffService.isSelfBookType();
      let isDoRefresh = false;
      this.currentSelectedPassengerIds = this.trainService
        .getBookInfos().map(it => it.passenger && it.passenger.AccountId);
      if (this.currentSelectedPassengerIds && this.lastSelectedPassengerIds) {
        if (this.currentSelectedPassengerIds.length != this.lastSelectedPassengerIds.length ||
          !this.currentSelectedPassengerIds.some(it => !!this.lastSelectedPassengerIds.find(id => id == it)) ||
          !this.lastSelectedPassengerIds.some(it => !!this.currentSelectedPassengerIds.find(id => id == it))) {
          isDoRefresh = true;
        }
      }
      if (_ && _.get("doRefresh")) {
        isDoRefresh = true;
      }
      if (isDoRefresh) {
        this.doRefresh(true, false);
      }
    });
    this.curFilteredBookInfo$ = this.trainService
      .getBookInfoSource()
      .pipe(map(infos => infos.find(info => info.isFilterPolicy)));
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
    this.searchModalSubscription = this.trainService
      .getSearchTrainModelSource()
      .subscribe(modal => {
        this.searchTrainModel = modal;
        console.log(
          "getSearchTrainModelSource",
          modal,
          this.isLoading
        );
        if (this.searchTrainModel) {
          this.vmFromCity = modal.fromCity;
          this.vmToCity = modal.toCity;
        }
      });
    this.selectedPassengersNumbers$ = this.trainService
      .getBookInfoSource()
      .pipe(map(infos => infos.length));
    this.doRefresh(true, false);
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
  trackBy(idx: number, train: TrainEntity) {
    return train && train.TrainCode;
  }
  async onSelectStation(isFrom: boolean) {
    if (this.searchTrainModel) {
      const m = await this.modalCtrl.create({
        component: SelectTrainStationModalComponent
      });
      m.backdropDismiss = false;
      m.present();
      const result = await m.onDidDismiss();
      if (result && result.data) {
        const data = result.data as TrafficlineEntity;
        if (isFrom) {
          this.searchTrainModel.fromCity = data;
        } else {
          this.searchTrainModel.toCity = data;
        }
        this.searchTrainModel.FromStation = this.searchTrainModel.fromCity.Code;
        this.searchTrainModel.ToStation = this.searchTrainModel.toCity.Code;
        this.trainService.setSearchTrainModel(this.searchTrainModel);
      }
    }

  }
  private async loadPolicyedTrainsAsync(): Promise<TrainEntity[]> {
    // 先获取最新的数据
    this.vmTrains = [];
    this.trains = await this.trainService.loadPolicyedTrainsAsync((status) => {
      this.progressName = status;
    });
    return JSON.parse(JSON.stringify(this.trains));
  }
  private closeScroller(trains: any[] = []) {
    if (this.scroller) {
      this.scroller.complete();
      if (this.scroller) {
        this.scroller.disabled = trains.length == 0 || trains.length < this.pageSize;
      }
    }
  }
  loadMore() {
    const trains = this.trainsForRender.splice(0, this.pageSize);
    this.closeScroller(trains);
    requestAnimationFrame(() => {
      if (trains.length) {
        this.vmTrains = this.vmTrains.concat(trains);
      }
    })
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
    if (!d.data) {
      return;
    }
    let data;
    if (d.data == 'isUnFilterPolicy') {
      data = this.filterPassengerPolicyTrains(null);
    } else {
      data = this.filterPassengerPolicyTrains(d.data);
    }
    data = this.filterTrains(data);
    this.vmTrains = data;
    this.isLoading = false;
  }
  goToSelectPassengerPage() {
    this.lastSelectedPassengerIds = this.trainService.getBookInfos().map(it => it.passenger && it.passenger.AccountId);
    this.router.navigate([AppHelper.getRoutePath("select-passenger")], {
      queryParams: {
        forType: FlightHotelTrainType.Train
      }
    });
  }
  async onFilter() {
    this.activeTab = "filter";
    const m = await this.modalCtrl.create({
      component: TrainFilterComponent,
      componentProps: {
        trains: JSON.parse(JSON.stringify(this.trains))
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
  async doRefresh(loadDataFromServer: boolean, keepSearchCondition: boolean) {
    this.trainsForRender = [];
    this.trainsCount = 0;
    if (this.scroller) {
      this.scroller.disabled = false;
    }
    if (this.ionRefresher) {
      this.ionRefresher.disabled = true;
      this.ionRefresher.complete();
      setTimeout(() => {
        this.ionRefresher.disabled = false;
      }, 100);
    }
    if (this.isLoading) {
      return;
    }
    // this.moveDayToSearchDate();
    if (this.timeoutid) {
      clearTimeout(this.timeoutid);
    }
    try {
      if (this.isLoading) {
        return;
      }
      // this.moveDayToSearchDate();
      if (this.searchTrainModel) {
        this.calendarService.setSelectedDaysSource([this.calendarService.generateDayModelByDate(this.searchTrainModel.Date)]);
      }

      this.apiService.showLoadingView();
      if (!keepSearchCondition) {
        this.filterCondition = FilterTrainCondition.init();
        setTimeout(() => {
          this.activeTab = "none";
        }, 0);
      }
      this.isLoading = true;
      let data: TrainEntity[] = JSON.parse(JSON.stringify(this.trains));
      if (loadDataFromServer) {
        this.progressName = '正在获取火车票列表';
        // 强制从服务器端返回新数据
        data = await this.loadPolicyedTrainsAsync();
      }
      data = this.filterTrains(data);
      {
        const b = this.trainService.getBookInfos().find(it => it.isFilterPolicy);
        data = this.trainService.filterPassengerPolicyTrains(b, data);
      }
      // 根据筛选条件过滤航班信息：
      this.trainsForRender = data;
      this.trainsCount = data.length;
      const trains = this.trainsForRender.splice(0, this.pageSize);
      requestAnimationFrame(_ => {
        this.closeScroller(trains);
      });
      this.vmTrains = trains;
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
        train: train
      };
      const isSelf = await this.staffService.isSelfBookType();

      if (isSelf) {
        const bookInfos = this.trainService.getBookInfos();
        const bookInfo = this.trainService.getTrainInfo(currentViewtTainItem, { ...bookInfos[0] });
        if (
          bookInfo &&
          bookInfo.trainPolicy &&
          !bookInfo.trainPolicy.IsAllowBook
        ) {
          let rules = (bookInfo.trainPolicy.Rules || []);
          AppHelper.alert(
            `${rules.join("; ") + rules.length ? "," : ""}不可预订`,
            true,
            LanguageHelper.getConfirmTip()
          );
          return;
        }
      }
      await this.trainService.addOrReselectBookInfo(currentViewtTainItem);
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
    let result: TrainEntity[] = JSON.parse(JSON.stringify(this.trains));
    result = this.trainService.filterPassengerPolicyTrains(bookInfo, result);
    return result;
  }
  onSwapStation() {
    const s = this.trainService.getSearchTrainModel();
    this.trainService.setSearchTrainModel({
      ...s,
      fromCity: s.toCity,
      toCity: s.fromCity
    });
    this.doRefresh(true, false);
  }
  onSelectPassenger() {
    this.goToSelectPassengerPage();
  }
  private scrollToTop() {
    setTimeout(() => {
      if (this.cnt) {
        if (!this.isStillOnCurrentPage()) {
          return;
        }
        this.cnt.scrollToTop(50);
      }
    }, 100);
  }
  private isStillOnCurrentPage() {
    return this.router.routerState.snapshot.url.includes("train-list");
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
        const h = +t[0];
        const m = +t[1];
        return (
          this.filterCondition.departureTimeSpan.lower <= h &&
          (h < this.filterCondition.departureTimeSpan.upper || h == this.filterCondition.departureTimeSpan.upper && m <= 0)
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
      !byUser
    ) {
      return;
    }
    if (!this.filterCondition) {
      this.filterCondition = FilterTrainCondition.init();
    }
    this.filterCondition.priceFromL2H = "initial";
    this.filterCondition.timeFromM2N = "initial";
    this.activeTab = "none";
    const identity = await this.identityService.getIdentityAsync().catch(_ => null);
    if (this.searchTrainModel) {
      if (this.searchTrainModel.tripType == TripType.departureTrip) {
        this.searchTrainModel.Date = day.date;
        if (identity) {
          await this.storage.set(`last_selected_train_goDate_${identity.Id}`, day.date);
        }
      } else {
        this.searchTrainModel.BackDate = day.date;
      }
    }
    this.trainService.setSearchTrainModel(this.searchTrainModel);
    this.doRefresh(true, true);
  }
  async onCalenderClick() {
    const days = await this.trainService.openCalendar(false);
    if (days && days.length) {
      this.searchTrainModel.Date = days[0].date;
      // if (
      //   this.searchTrainModel.isRoundTrip &&
      //   this.searchTrainModel.tripType == TripType.returnTrip
      // ) {
      //   this.searchTrainModel.BackDate = days[0].date;
      // }
      this.trainService.setSearchTrainModel({
        ...this.searchTrainModel,
        Date: days[0].date
      });
      this.calendarService.setSelectedDaysSource(days);
      this.onChangedDay(this.calendarService.generateDayModelByDate(this.searchTrainModel.Date), true);
    }
  }

  back() {
    this.navCtrl.pop();
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
    let data = this.filterTrains(this.trains);
    const b = this.trainService.getBookInfos().find(it => it.isFilterPolicy);
    data = this.trainService.filterPassengerPolicyTrains(b, data);
    // 根据筛选条件过滤航班信息：
    this.trainsForRender = data;
    this.trainsCount = data.length;
    const trains = this.trainsForRender.splice(0, this.pageSize);
    requestAnimationFrame(_ => {
      this.closeScroller(trains);
    });
    this.vmTrains = trains;
    this.isSortingTrains = false;
    this.isLoading = false;
  }
  private sortByPrice(priceOrderL2H: boolean) {
    console.time("sortByPrice");
    if (this.trains) {
      this.trains.sort((a, b) => {
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
    if (this.trains) {
      this.trains.sort((a, b) => {
        const sub = a && b && a.StartTimeStamp - b.StartTimeStamp;
        return timeOrdM2N ? sub : -sub;
      });
    }
  }
}
