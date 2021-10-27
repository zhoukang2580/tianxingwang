import { LangService } from "../../services/lang.service";
import { RefresherComponent } from "../../components/refresher/refresher.component";
import { flyInOut } from "../../animations/flyInOut";
import { IdentityService } from "src/app/services/identity/identity.service";
import { TrainFilterComponent } from "../components/train-filter/train-filter.component";
import { TrainscheduleComponent } from "../components/trainschedule/trainschedule.component";
import { TrainSeatEntity } from "../models/TrainSeatEntity";
import { ICurrentViewtTainItem, ITrainInfo } from "../train.service";
import { HrService } from "../../hr/hr.service";
import { ApiService } from "../../services/api/api.service";
import { CalendarService } from "../../tmc/calendar.service";
import { TrafficlineEntity } from "../../tmc/models/TrafficlineEntity";
import { TrainEntity } from "../models/TrainEntity";
import { TrainService, SearchTrainModel } from "src/app/train/train.service";
import {
  PassengerBookInfo,
  FlightHotelTrainType,
} from "src/app/tmc/tmc.service";
import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewInit,
  IterableDiffers,
  Directive,
} from "@angular/core";
import {
  IonRefresher,
  IonContent,
  PopoverController,
  NavController,
  ModalController,
  IonInfiniteScroll,
} from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { DayModel } from "src/app/tmc/models/DayModel";
import { DaysCalendarComponent } from "src/app/tmc/components/days-calendar/days-calendar.component";
// tslint:disable-next-line: max-line-length
import { FilterPassengersPolicyComponent } from "src/app/tmc/components/filter-passengers-popover/filter-passengers-policy-popover.component";
import { Observable, of, Subscription, from, fromEvent } from "rxjs";
import { SelectedTrainSegmentInfoComponent } from "../components/selected-train-segment-info/selected-train-segment-info.component";
import { FilterTrainCondition } from "../models/FilterCondition";
import { TripType } from "src/app/tmc/models/TripType";
import * as moment from "moment";
import { LanguageHelper } from "src/app/languageHelper";
import { map, tap, switchMap, delay } from "rxjs/operators";
import { trigger, transition, style, animate } from "@angular/animations";
import { SelectedTrainSegmentInfoEnComponent } from "../components/selected-train-segment-info_en/selected-train-segment-info_en.component";
import { SelectedTrainSegmentInfoDfComponent } from "../components/selected-train-segment-info-df/selected-train-segment-info-df.component";
import { OrderTrainTicketEntity } from "src/app/order/models/OrderTrainTicketEntity";
import { StorageService } from "src/app/services/storage-service.service";
@Directive()
export class TrainListBasePage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DaysCalendarComponent) daysCalendarComp: DaysCalendarComponent;
  @ViewChild(RefresherComponent) refresher: RefresherComponent;
  @ViewChild(IonInfiniteScroll,{static:true}) scroller: IonInfiniteScroll;
  @ViewChild(IonContent) cnt: IonContent;
  private pageSize = 15;
  private lastSelectedPassengerIds: string[];
  private currentSelectedPassengerIds: string[];
  private trains: TrainEntity[] = [];
  private trainsForRender: TrainEntity[] = [];
  private subscriptions: Subscription[] = [];
  private trainCodes: any[];
  private lastSelectFromStation: TrafficlineEntity;
  private lastSelectToStation: TrafficlineEntity;
  private pageUrl;
  progressName = "";
  trainsCount = 0;
  vmTrains: TrainEntity[] = [];
  isLoading = false;
  isOpenFilter = false;
  get isFiltered() {
    return (
      this.filterCondition &&
      (this.filterCondition.isOnlyHasSeat ||
        (this.filterCondition.arrivalStations &&
          this.filterCondition.arrivalStations.length) ||
        (this.filterCondition.departureStations &&
          this.filterCondition.departureStations.length) ||
        (this.filterCondition.trainTypes &&
          this.filterCondition.trainTypes.length) ||
        (this.filterCondition.departureTimeSpan &&
          (this.filterCondition.departureTimeSpan.lower > 0 ||
            this.filterCondition.departureTimeSpan.upper < 24)))
    );
  }
  vmFromCity: TrafficlineEntity;
  vmToCity: TrafficlineEntity;
  searchTrainModel: SearchTrainModel;
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
  tripDate: string;
  searchModalSubscription = Subscription.EMPTY;
  pageTimeoutSubscription = Subscription.EMPTY;
  disabledChangeDate = false;
  curFilteredBookInfo$: Observable<PassengerBookInfo<ITrainInfo>>;
  constructor(
    private trainService: TrainService,
    private router: Router,
    private storage: StorageService,
    private calendarService: CalendarService,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private staffService: HrService,
    private popoverController: PopoverController,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private identityService: IdentityService,
    private langService: LangService
  ) {
    this.filterCondition = FilterTrainCondition.init();
  }
  ngOnDestroy() {
    this.searchModalSubscription.unsubscribe();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  ngAfterViewInit() {}
  private checkExchangeDateDisabled() {
    const bk = this.trainService.getBookInfos()[0];
    const ticket =
      bk &&
      bk.exchangeInfo &&
      (bk.exchangeInfo.ticket as OrderTrainTicketEntity);
    const trip = ticket && ticket.OrderTrainTrips && ticket.OrderTrainTrips[0];
    const endDate = this.searchTrainModel.IsRangeExchange
      ? (trip && trip.StartTime.substr(0, 10)) || ""
      : "";
    if (this.searchTrainModel.IsRangeExchange) {
      if (
        trip &&
        trip.StartTime.substr(0, 10) ==
          this.calendarService.getMoment(0).format("YYYY-MM-DD")
      ) {
        this.disabledChangeDate = true;
        return true;
      }
    }
    return false;
  }
  private initExchangeDate() {
    if (
      this.trainService.getBookInfos()[0] &&
      this.trainService.getBookInfos()[0].exchangeInfo
    ) {
      const t =
        this.trainService.getBookInfos()[0].exchangeInfo.ticket &&
        (this.trainService.getBookInfos()[0].exchangeInfo
          .ticket as OrderTrainTicketEntity);
      this.tripDate =
        t &&
        t.OrderTrainTrips &&
        t.OrderTrainTrips[0] &&
        t.OrderTrainTrips[0].StartTime;
    }
  }
  private isDiffPage() {
    return !AppHelper.getNormalizedPath(this.router.url).includes(this.pageUrl);
  }
  ngOnInit() {
    this.subscriptions.push(this.pageTimeoutSubscription);
    this.route.queryParamMap.subscribe(async (_) => {
      this.pageTimeoutSubscription.unsubscribe();
      this.pageUrl = AppHelper.getNormalizedPath(this.router.url);
      console.log("this.pageUrl", this.pageUrl);
      this.isShowRoundtripTip = await this.staffService.isSelfBookType();
      let isDoRefresh = this.checkStationChanged();
      this.checkExchangeDateDisabled();
      this.initExchangeDate();
      this.currentSelectedPassengerIds = this.trainService
        .getBookInfos()
        .map((it) => it.passenger && it.passenger.AccountId);
      if (this.currentSelectedPassengerIds && this.lastSelectedPassengerIds) {
        if (
          this.currentSelectedPassengerIds.length !=
            this.lastSelectedPassengerIds.length ||
          !this.currentSelectedPassengerIds.some(
            (it) => !!this.lastSelectedPassengerIds.find((id) => id == it)
          ) ||
          !this.lastSelectedPassengerIds.some(
            (it) => !!this.currentSelectedPassengerIds.find((id) => id == it)
          )
        ) {
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
      .pipe(map((infos) => infos.find((info) => info.isFilterPolicy)));
    this.goRoundTripDateTime$ = this.trainService.getBookInfoSource().pipe(
      map((infos) => {
        const go = infos.find(
          (it) => it.bookInfo && it.bookInfo.tripType == TripType.departureTrip
        );
        let goArrivalDateTime = "";
        let backDateTime = "";
        if (go && go.bookInfo.trainEntity) {
          const d = moment(go.bookInfo.trainEntity.ArrivalTime);
          goArrivalDateTime = d.format("YYYY-MM-DD HH:mm");
        }
        const back = infos.find(
          (it) => it.bookInfo && it.bookInfo.tripType == TripType.returnTrip
        );
        if (back && back.bookInfo.trainEntity) {
          const d = moment(back.bookInfo.trainEntity.StartTime);
          backDateTime = d.format("YYYY-MM-DD HH:mm");
        }
        return {
          goArrivalDateTime,
          backDateTime,
        };
      })
    );
    this.isShowAddPassenger$ = from(this.staffService.isSelfBookType()).pipe(
      map((isSelf) => !isSelf)
    );
    this.searchModalSubscription = this.trainService
      .getSearchTrainModelSource()
      .subscribe((modal) => {
        this.searchTrainModel = modal;
        console.log("getSearchTrainModelSource", modal, this.isLoading);
        if (this.searchTrainModel) {
          this.vmFromCity = modal.fromCity;
          this.vmToCity = modal.toCity;
        }
      });
    this.selectedPassengersNumbers$ = this.trainService
      .getBookInfoSource()
      .pipe(map((infos) => infos.length));
    this.doRefresh(true, false);
  }
  async schedules(train: TrainEntity) {
    if (!train.Schedules) {
      const trains = await this.trainService.scheduleAsync({
        Date: moment(train.StartTime).format("YYYY-MM-DD"),
        FromStation: train.FromStationCode,
        ToStation: train.ToStationCode,
        TrainNo: train.TrainNo,
        TrainCode: train.TrainCode,
      });
      if (trains && trains.length) {
        train.Schedules = trains[0].Schedules;
      }
    }
    const m = await this.modalCtrl.create({
      component: TrainscheduleComponent,
      componentProps: {
        schedules: train.Schedules,
        train,
        vmFromCity: this.vmFromCity,
        vmToCity: this.vmToCity,
      },
    });
    m.present();
  }
  trackBy(idx: number, train: TrainEntity) {
    return train && train.TrainCode;
  }
  private checkStationChanged() {
    return (
      this.lastSelectToStation &&
      this.lastSelectFromStation &&
      this.vmFromCity &&
      this.vmToCity &&
      (this.lastSelectFromStation.Code != this.vmFromCity.Code ||
        this.lastSelectToStation.Code != this.vmToCity.Code)
    );
  }
  async onSelectStation(isFrom: boolean) {
    this.scrollToTop();
    if (this.searchTrainModel) {
      if (
        this.searchTrainModel.isExchange &&
        this.searchTrainModel.IsRangeExchange
      ) {
        return;
      }
      if (
        isFrom &&
        !this.searchTrainModel.isExchange &&
        !this.searchTrainModel.isLocked
      ) {
        this.trainService.onSelectCity(isFrom);
      }
      if (
        !isFrom &&
        (this.searchTrainModel.isExchange || !this.searchTrainModel.isLocked)
      ) {
        this.trainService.onSelectCity(isFrom);
      }
      return;
    }
    return;
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
        this.scroller.disabled = !trains||trains.length < this.pageSize;
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
    });
  }
  async filterPolicyTrains() {
    try {
      this.trainCodes = [];
      const popover = await this.popoverController.create({
        component: FilterPassengersPolicyComponent,
        componentProps: {
          bookInfos$: this.trainService.getBookInfoSource(),
        },
        translucent: true,
      });
      await popover.present();
      const d = await popover.onDidDismiss();
      // this.doRefresh(false,d.data);
      this.isLoading = true;
      if (!d.data) {
        return;
      }
      let data: TrainEntity[] = [];
      if (d.data == "isUnFilterPolicy") {
        data = this.filterPassengerPolicyTrains(null);
      } else {
        data = this.filterPassengerPolicyTrains(d.data);
      }
      data = this.filterTrains(data);
      console.log(data, "data");

      this.vmTrains.forEach((element) => {
        if (element.isShowSeats) {
          this.trainCodes.push(element.TrainCode);
        }
      });
      console.log("TrainCodes ", this.trainCodes);
      data.forEach((t) => {
        t.isShowSeats = this.trainCodes.find((it) => it == t.TrainCode);
      });
      this.vmTrains = data;

      this.isLoading = false;
    } catch (e) {
      console.error(e);
    }
  }
  goToSelectPassengerPage() {
    this.lastSelectedPassengerIds = this.trainService
      .getBookInfos()
      .map((it) => it.passenger && it.passenger.AccountId);
    this.router.navigate([AppHelper.getRoutePath("select-passenger-df")], {
      queryParams: {
        forType: FlightHotelTrainType.Train,
      },
    });
  }
  onCloseFilter() {
    this.isOpenFilter = false;
    this.modalCtrl.getTop().then((t) => {
      if (t) {
        t.dismiss();
      }
    });
  }
  async onFilter() {
    this.activeTab = "filter";
    const m = await this.modalCtrl.create({
      component: TrainFilterComponent,
      componentProps: {
        filterCondition: this.filterCondition,
        trains: JSON.parse(JSON.stringify(this.trains)),
      },
      cssClass: "offset-top-29 top-radius-8",
      showBackdrop: false,
      swipeToClose: true,
    });
    m.present();
    this.isOpenFilter = true;
    m.onWillDismiss().then(() => {
      this.isOpenFilter = false;
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
    let c = SelectedTrainSegmentInfoDfComponent;
    const modal = await this.modalCtrl.create({
      component: c,
    });
    await this.trainService.dismissAllTopOverlays();
    await modal.present();
    await modal.onDidDismiss();
  }
  private completeRefresher() {
    if (this.refresher) {
      this.refresher.complete();
    }
  }
  async doRefresh(loadDataFromServer: boolean, keepSearchCondition: boolean) {
    keepSearchCondition = true;
    this.trainsForRender = [];
    this.trainCodes = [];
    this.trainsCount = 0;
    if (this.scroller) {
      this.scroller.disabled = false;
    }
    if (this.isLoading) {
      return;
    }
    try {
      if (this.isLoading) {
        return;
      }
      if (this.searchTrainModel) {
        setTimeout(() => {
          this.calendarService.setSelectedDaysSource([
            this.calendarService.generateDayModelByDate(
              this.searchTrainModel.Date
            ),
          ]);
        }, 100);
      }
      if (!keepSearchCondition) {
        this.filterCondition = FilterTrainCondition.init();
        setTimeout(() => {
          this.activeTab = "none";
        }, 0);
      }
      if (this.isFiltered) {
        setTimeout(() => {
          this.activeTab = "filter";
        }, 0);
      }
      this.isLoading = true;
      let data: TrainEntity[] = JSON.parse(JSON.stringify(this.trains));
      if (loadDataFromServer) {
        this.progressName = "正在获取火车票列表";
        // 强制从服务器端返回新数据
        this.lastSelectToStation = this.vmToCity;
        this.lastSelectFromStation = this.vmFromCity;
        data = await this.loadPolicyedTrainsAsync();
      }
      this.apiService.showLoadingView({ msg: this.progressName });
      data = this.filterTrains(data);
      {
        const b = this.trainService
          .getBookInfos()
          .find((it) => it.isFilterPolicy);
        data = this.trainService.filterPassengerPolicyTrains(b, data);
      }
      // 根据筛选条件过滤航班信息：
      this.trainsForRender = data;
      this.trainsCount = data.length;
      this.completeRefresher();
      const trains = this.trainsForRender.splice(0, this.pageSize);
      requestAnimationFrame((_) => {
        this.closeScroller(trains);
      });
      this.vmTrains = trains;
      this.apiService.hideLoadingView();
      this.isLoading = false;
    } catch (e) {
      console.error(e);
    } finally {
      if (this.refresher) {
        this.refresher.disabled = true;
        setTimeout(() => {
          this.refresher.disabled = false;
        }, 100);
      }
      this.isLoading = false;
      this.scrollToTop();
      this.closeScroller();
    }
  }
  async onBookTicket(train: TrainEntity, seat: TrainSeatEntity) {
    const isAdd = await this.trainService.checkIfShouldAddPassenger();
    if (isAdd) {
      await AppHelper.alert("请添加旅客");
      this.onSelectPassenger();
      return;
    }
    const currentViewtTainItem: ICurrentViewtTainItem = {
      selectedSeat: seat,
      train,
    };
    if (this.trainService.checkIfExchangeDiffStation(currentViewtTainItem)) {
      return;
    }
    let showResult = true;
    if (await this.trainService.checkCanAdd()) {
      showResult = await this.trainService.addOrReselectBookInfo(
        currentViewtTainItem
      );
    }
    if (showResult) {
      await this.showSelectedInfos();
    }
  }
  private async showSelectedInfos() {
    this.pageTimeoutSubscription.unsubscribe();
    let c = SelectedTrainSegmentInfoDfComponent;
    const m = await this.modalCtrl.create({
      component: c,
    });
    m.present();
    await m.onDidDismiss();
  }
  private filterPassengerPolicyTrains(
    bookInfo: PassengerBookInfo<ITrainInfo>
  ): TrainEntity[] {
    let result: TrainEntity[] = JSON.parse(JSON.stringify(this.trains));
    result = this.trainService.filterPassengerPolicyTrains(bookInfo, result);
    return result;
  }
  onSwapStation() {
    // debugger
    if (
      !this.searchTrainModel?.isExchange &&
      !this.searchTrainModel?.isLocked
    ) {
      const s = this.trainService.getSearchTrainModel();
      this.trainService.setSearchTrainModelSource({
        ...s,
        fromCity: s.toCity,
        toCity: s.fromCity,
      });
      this.doRefresh(true, false);
    }
    return;
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
    // result = [];
    // trains.forEach((t) => {
    //   if (!result.find((it) => it.TrainNo == t.TrainNo)) {
    //     result.push(t);
    //   }
    // });
    result = this.filterByTrainType(result);
    result = this.filterByDepartureTimespan(result);
    result = this.filterByDepartureStations(result);
    result = this.filterByArrivalStations(result);
    result = this.filterByIsOnlyHasSeat(result);
    return result;
  }
  onScrollToTop() {
    this.scrollToTop();
  }
  private filterByDepartureTimespan(trains: TrainEntity[]) {
    if (
      trains &&
      this.filterCondition &&
      this.filterCondition.departureTimeSpan
    ) {
      return trains.filter((train) => {
        const t = train.StartShortTime.split(":");
        const h = +t[0];
        const m = +t[1];
        return (
          this.filterCondition.departureTimeSpan.lower <= h &&
          (h < this.filterCondition.departureTimeSpan.upper ||
            (h == this.filterCondition.departureTimeSpan.upper && m <= 0))
        );
      });
    }
    return trains;
  }
  private filterByIsOnlyHasSeat(trains: TrainEntity[]) {
    if (trains && this.filterCondition && this.filterCondition.isOnlyHasSeat) {
      return trains.filter((train) => {
        return train.Seats && train.Seats.some((s) => +s.Count > 0);
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
      return trains.filter((train) =>
        this.filterCondition.trainTypes.some(
          (it) => it.id == `${train.TrainType}`
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
      return trains.filter((train) =>
        this.filterCondition.departureStations.some(
          (it) => it.id == train.FromStationCode
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
      return trains.filter((train) =>
        this.filterCondition.arrivalStations.some(
          (it) => it.id == train.ToStationCode
        )
      );
    }
    return trains;
  }
  async onChangedDay(day: DayModel, byUser: boolean) {
    if (!byUser) {
      return;
    }
    if (this.searchTrainModel) {
      if (this.searchTrainModel.IsRangeExchange) {
        if (this.checkExchangeDateDisabled()) {
          return;
        }
      }
    }
    if (!this.filterCondition) {
      this.filterCondition = FilterTrainCondition.init();
    }
    this.filterCondition.priceFromL2H = "initial";
    this.filterCondition.timeFromM2N = "initial";
    this.activeTab = "none";
    const identity = await this.identityService
      .getIdentityAsync()
      .catch((_) => null);
    if (this.searchTrainModel) {
      if (this.searchTrainModel.tripType == TripType.departureTrip) {
        this.searchTrainModel.Date = day.date;
        if (identity) {
          await this.storage.set(
            `last_selected_train_goDate_${identity.Id}`,
            day.date
          );
        }
      }
    }
    this.trainService.setSearchTrainModelSource(this.searchTrainModel);
    this.doRefresh(true, true);
  }
  async onCalenderClick() {
    if (!this.searchTrainModel) {
      return;
    }
    const bk = this.trainService.getBookInfos()[0];
    const ticket =
      bk &&
      bk.exchangeInfo &&
      (bk.exchangeInfo.ticket as OrderTrainTicketEntity);
    const trip = ticket && ticket.OrderTrainTrips && ticket.OrderTrainTrips[0];
    const endDate = this.searchTrainModel.IsRangeExchange
      ? (trip && trip.StartTime.substr(0, 10)) || ""
      : "";
    if (this.searchTrainModel.IsRangeExchange) {
      if (
        trip &&
        trip.StartTime.substr(0, 10) ==
          this.calendarService.getMoment(0).format("YYYY-MM-DD")
      ) {
        return;
      }
    }
    const days = await this.trainService.openCalendar(false, endDate);
    if (days && days.length) {
      this.searchTrainModel.Date = days[0].date;
      this.trainService.setSearchTrainModelSource({
        ...this.searchTrainModel,
        Date: days[0].date,
      });
      this.calendarService.setSelectedDaysSource(days);
      this.onChangedDay(
        this.calendarService.generateDayModelByDate(this.searchTrainModel.Date),
        true
      );
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
    const b = this.trainService.getBookInfos().find((it) => it.isFilterPolicy);
    data = this.trainService.filterPassengerPolicyTrains(b, data);
    // 根据筛选条件过滤航班信息：
    this.trainsForRender = data;
    this.trainsCount = data.length;
    const trains = this.trainsForRender.splice(0, this.pageSize);
    requestAnimationFrame((_) => {
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
