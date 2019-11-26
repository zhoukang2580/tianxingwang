import { SelectFlightPassengerComponent } from "./../components/select-flight-passenger/select-flight-passenger.component";
import { IFlightSegmentInfo } from "./../models/PassengerFlightInfo";
import { PassengerBookInfo, FlightHotelTrainType } from "./../../tmc/tmc.service";
import { environment } from "src/environments/environment";
import { ApiService } from "src/app/services/api/api.service";
import { FlyFilterComponent } from "./../components/fly-filter/fly-filter.component";
import { SearchFlightModel } from "./../flight.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import {
  StaffService,
  StaffBookType,
  StaffEntity
} from "../../hr/staff.service";
import { AppHelper } from "src/app/appHelper";
import { animate } from "@angular/animations";
import { trigger, state, style, transition } from "@angular/animations";
import {
  IonContent,
  IonRefresher,
  ModalController,
  PopoverController,
  DomController,
  Platform,
  NavController
} from "@ionic/angular";
import {
  Observable,
  Subscription,
  fromEvent,
  Subject,
  BehaviorSubject
} from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  NgZone,
  ElementRef,
  QueryList,
  ViewChildren,
  EventEmitter
} from "@angular/core";
import {
  tap,
  takeUntil,
  switchMap,
  delay,
  map,
  filter,
  reduce,
  finalize
} from "rxjs/operators";
import * as moment from "moment";
import { CalendarService } from "../../tmc/calendar.service";
import { DayModel } from "../../tmc/models/DayModel";
import { FlightService } from "../flight.service";
import { FlightSegmentEntity } from "../models/flight/FlightSegmentEntity";
import { FlightJourneyEntity } from "../models/flight/FlightJourneyEntity";
import { FlightCabinType } from "../models/flight/FlightCabinType";
import { LanguageHelper } from "src/app/languageHelper";
import { FilterConditionModel } from "../models/flight/advanced-search-cond/FilterConditionModel";

import { Storage } from "@ionic/storage";
import { SelectedFlightsegmentInfoComponent } from "../components/selected-flightsegment-info/selected-flightsegment-info.component";
import { TripType } from "src/app/tmc/models/TripType";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { FilterPassengersPolicyComponent } from "../../tmc/components/filter-passengers-popover/filter-passengers-policy-popover.component";
import {
  PassengerPolicyFlights,
  FlightPolicy
} from "../models/PassengerFlightInfo";
import { DaysCalendarComponent } from "src/app/tmc/components/days-calendar/days-calendar.component";
import { SelectCityComponent } from '../components/select-city/select-city.component';
@Component({
  selector: "app-flight-list",
  templateUrl: "./flight-list.page.html",
  styleUrls: ["./flight-list.page.scss"],
  animations: [
    trigger("showFooterAnimate", [
      state("true", style({ height: "*" })),
      state("false", style({ height: 0 })),
      transition("false<=>true", animate("100ms ease-in-out"))
    ]),
    trigger("showAdvSearchPage", [
      state("true", style({ transform: "scale(1)" })),
      state("false", style({ transform: "scale(0)" })),
      transition("false<=>true", animate("200ms ease-in-out"))
    ]),
    trigger("openClose", [
      state("true", style({ height: "*" })),
      state("false", style({ height: "0px" })),
      transition("false <=> true", animate(500))
    ]),
    trigger("rotateIcon", [
      state(
        "*",
        style({
          display: "inline-block",
          transform: "rotateZ(-8deg) scale(1)",
          opacity: 1
        })
      ),
      transition(
        "false <=> true",
        animate(
          "200ms ease-in",
          style({
            transform: "rotateZ(360deg) scale(1.1)",
            opacity: 0.7
          })
        )
      )
    ])
  ]
})
export class FlightListPage implements OnInit, AfterViewInit, OnDestroy {
  private refMap = new WeakMap<FlightSegmentEntity, any>();
  private filterConditionSubscription = Subscription.EMPTY;
  private searchConditionSubscription = Subscription.EMPTY;
  private selectPassengerSubscription = Subscription.EMPTY;
  private selectDaySubscription = Subscription.EMPTY;
  private isRotatingIcon = false;
  searchFlightModel: SearchFlightModel;
  filterCondition: FilterConditionModel;
  showAddPassenger = false;
  isRotateIcon = false;
  @ViewChild("cnt") cnt: IonContent;
  @ViewChild("list") list: ElementRef<HTMLElement>;
  @ViewChildren("fli") liEles: QueryList<ElementRef<HTMLElement>>;
  vmFlights: FlightSegmentEntity[]; // 用于视图展示
  vmToCity: TrafficlineEntity;
  vmFromCity: TrafficlineEntity;
  vmFlightJourneyList: FlightJourneyEntity[];
  get flightJourneyList() {
    return this.flightService.flightJourneyList;
  };
  totalFilteredSegments: FlightSegmentEntity[];
  priceOrderL2H: boolean; // 价格从低到高
  timeOrdM2N: boolean; // 时间从早到晚
  isLoading = false;
  isSelfBookType = true;
  currentProcessStatus = "正在获取航班列表";
  st = 0;
  selectedPassengersNumbers$: Observable<number>;
  goAndBackFlightDateTime$: Observable<{
    goArrivalDateTime: string;
    backTakeOffDateTime: string;
  }>;
  @ViewChild(FlyFilterComponent) filterComp: FlyFilterComponent;
  @ViewChild(DaysCalendarComponent) daysCalendarComp: DaysCalendarComponent;
  @ViewChild(IonRefresher) refresher: IonRefresher;
  activeTab: "filter" | "time" | "price" | "none"; // 当前激活的tab
  hasDataSource: Subject<boolean>;
  showAdvSearchPage$: Observable<boolean>;
  showSelectFlyDayPage$: Observable<boolean>;
  filteredPolicyPassenger$: Observable<PassengerBookInfo<IFlightSegmentInfo>>;
  get isHasFiltered() {
    return this.filterComp &&
      Object.keys(this.filterComp.userOps).some(
        k => this.filterComp.userOps[k]
      );
  }
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private flightService: FlightService,
    private ngZone: NgZone,
    private navCtrl: NavController,
    private flyDayService: CalendarService,
    private staffService: StaffService,
    private apiService: ApiService,
    private identityService: IdentityService,
    private domCtrl: DomController,
    private modalCtrl: ModalController,
    private popoverController: PopoverController,
    private storage: Storage
  ) {
    this.selectedPassengersNumbers$ = flightService
      .getPassengerBookInfoSource()
      .pipe(map(item => item.length));
    this.hasDataSource = new BehaviorSubject(false);
    this.vmFlights = [];
    // this.flightJourneyList = [];
    this.searchFlightModel = new SearchFlightModel();
    this.goAndBackFlightDateTime$ = flightService
      .getPassengerBookInfoSource()
      .pipe(
        map(infos => {
          const goInfo = infos.find(
            item =>
              item.bookInfo && item.bookInfo.tripType == TripType.departureTrip
          );
          const backInfo = infos.find(
            item =>
              item.bookInfo && item.bookInfo.tripType == TripType.returnTrip
          );
          return {
            goArrivalDateTime:
              goInfo && goInfo.bookInfo && goInfo.bookInfo.flightSegment
                ? moment(goInfo.bookInfo.flightSegment.TakeoffTime).format(
                  "YYYY-MM-DD HH:mm"
                )
                : "",
            backTakeOffDateTime:
              backInfo &&
                backInfo.bookInfo &&
                backInfo.bookInfo.flightSegment &&
                backInfo.bookInfo.tripType == TripType.returnTrip
                ? moment(backInfo.bookInfo.flightSegment.TakeoffTime).format(
                  "YYYY-MM-DD HH:mm"
                )
                : ""
          };
        })
      );
    this.route.queryParamMap.subscribe(async (d) => {
      this.isSelfBookType = await this.staffService.isSelfBookType();
      this.showAddPassenger = await this.canShowAddPassenger();
      this.flightService.setFilterPanelShow(false);
      console.log("this.route.queryParamMap", this.searchFlightModel, d);
      if (d && d.get("doRefresh")) {
        this.doRefresh(true, false);
      }
      const filteredBookInfo = this.flightService.getPassengerBookInfos().find(it => it.isFilterPolicy);
      if (filteredBookInfo) {
        this.doRefresh(false, true);
      }
    });
    this.showAdvSearchPage$ = this.flightService.getFilterPanelShow();
  }
  trackById(idx: number, item: FlightSegmentEntity) {
    return item.Id;
  }
  async canShowAddPassenger() {
    const identity = await this.identityService
      .getIdentityAsync()
      .catch(_ => null);
    this.showAddPassenger =
      (identity && identity.Numbers && identity.Numbers.AgentId) ||
      !(await this.staffService.isSelfBookType());
    return this.showAddPassenger;
  }
  async onCalenderClick() {
    const d = await this.flightService.openCalendar(false);
    if (d && d.length) {
      const go = d[0];
      this.flyDayService.setSelectedDaysSource([this.flyDayService.generateDayModelByDate(this.searchFlightModel.Date)]);
      this.onChangedDay(go, true);
    }
  }

  back() {
    this.router.navigate([AppHelper.getRoutePath("search-flight")]);
  }
  async onChangedDay(day: DayModel, byUser: boolean) {
    if (
      byUser &&
      (!day || this.searchFlightModel.Date == day.date || this.isLoading)
    ) {
      return;
    }
    const identity = await this.identityService.getIdentityAsync();
    const s = this.flightService.getSearchFlightModel();
    if (s.isRoundTrip) {
      if (s.tripType == TripType.departureTrip) {
        if (identity) {
          await this.storage.set(`last_selected_flight_goDate_${identity.Id}`, day.date);
        }
      }
    } else {
      if (identity) {
        await this.storage.set(`last_selected_flight_goDate_${identity.Id}`, day.date);
      }
    }
    if (!this.filterCondition) {
      this.filterCondition = FilterConditionModel.init();
    }
    this.filterCondition.priceFromL2H = "initial";
    this.filterCondition.timeFromM2N = "initial";
    this.activeTab =
      this.filterComp &&
        Object.keys(this.filterComp.userOps).some(k => this.filterComp.userOps[k])
        ? "filter"
        : "none";
    this.searchFlightModel.Date = day.date;
    this.flightService.setSearchFlightModel(this.searchFlightModel);
    this.doRefresh(true, true);
  }
  onSwapCity() {
    const s = this.flightService.getSearchFlightModel();
    if (s.isLocked || this.isRotatingIcon) {
      return;
    }
    this.isRotatingIcon = true;
    this.flightService.setSearchFlightModel({
      ...s,
      fromCity: s.toCity,
      toCity: s.fromCity
    });
    this.isRotateIcon = !this.isRotateIcon; // 控制图标旋转
    this.doRefresh(true, false);
  }
  onRotateIconDone(evt) {
    this.isRotatingIcon = false;
    console.log("onRotateIconDone");
  }
  async doRefresh(loadDataFromServer: boolean, keepSearchCondition: boolean) {
    console.log(`doRefresh:loadDataFromServer=${loadDataFromServer},keepSearchCondition=${keepSearchCondition}`);
    try {
      if (loadDataFromServer) {
        this.scrollToTop();
      }
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;
      this.flyDayService.setSelectedDaysSource([this.flyDayService.generateDayModelByDate(this.searchFlightModel.Date)]);
      // this.moveDayToSearchDate();
      if (this.refresher) {
        this.refresher.complete();
        setTimeout(() => {
          this.refresher.disabled = true;
        }, 100);
        setTimeout(() => {
          this.refresher.disabled = false;
        }, 140);
      }
      if (this.list) {
        this.list.nativeElement.innerHTML = "";
      }
      this.apiService.showLoadingView();
      if (!keepSearchCondition) {
        if (this.filterComp) {
          this.filterComp.onReset();
        }
        this.filterCondition = FilterConditionModel.init();
        this.flightService.setFilterConditionSource(this.filterCondition);
        setTimeout(() => {
          this.activeTab = "none";
        }, 0);
      }
      this.vmFlights = [];
      this.isLoading = true;
      this.currentProcessStatus = "正在获取航班列表";
      const flightJourneyList = await this.flightService.getFlightJourneyDetailListAsync(loadDataFromServer);
      if (loadDataFromServer) {
        this.currentProcessStatus = "正在计算差标";
        await this.flightService.loadPolicyedFlightsAsync(flightJourneyList);
      }
      this.renderFlightList(
        this.flightService.getTotalFlySegments()
      );
      this.hasDataSource.next(false);
      const segments = this.filterFlightSegments(this.flightService.getTotalFlySegments());
      this.st = Date.now();
      this.vmFlights = segments;
      await this.renderFlightList(segments);
      this.hasDataSource.next(!!this.vmFlights.length && !this.isLoading);
      this.apiService.hideLoadingView();
      this.isLoading = false;
    } catch (e) {
      if (!environment.production) {
        console.error(e);
      }
      this.isLoading = false;
    }
  }
  private scrollToTop() {
    setTimeout(() => {
      if (this.cnt) {
        if (!this.isStillOnCurrentPage()) {
          return;
        }
        this.cnt.scrollToTop(100);
      }
    }, 100);
  }


  async onSelectPassenger() {
    const removeitem = new EventEmitter<PassengerBookInfo<IFlightSegmentInfo>>();
    const sub = removeitem.subscribe(async info => {
      const ok = await AppHelper.alert(LanguageHelper.getConfirmDeleteTip(), true, LanguageHelper.getConfirmTip(), LanguageHelper.getCancelTip());
      if (ok) {
        this.flightService.removePassengerBookInfo(info, true);
      }
    })
    const m = await this.modalCtrl.create({
      component: SelectFlightPassengerComponent,
      componentProps: {
        isOpenPageAsModal: true,
        removeitem,
        forType: FlightHotelTrainType.Flight,
        bookInfos$: this.flightService.getPassengerBookInfoSource(),
      }
    });
    const oldBookInfos = this.flightService
      .getPassengerBookInfos()
      .map(it => it.id);
    await m.present();
    await m.onDidDismiss();
    if (sub) {
      sub.unsubscribe();
    }
    const newBookInfos = this.flightService
      .getPassengerBookInfos()
      .map(it => it.id);
    console.log("old ", oldBookInfos.map(it => it), "new ", newBookInfos.map(it => it));
    const isChange =
      oldBookInfos.length !== newBookInfos.length ||
      oldBookInfos.some(it => !newBookInfos.find(n => n == it)) ||
      newBookInfos.some(n => !oldBookInfos.find(it => it == n));
    if (isChange) {
      this.doRefresh(true, false);
    }
  }


  async goToFlightCabinsDetails(fs: FlightSegmentEntity) {
    await this.flightService.addOneBookInfoToSelfBookType();
    const isSelf = await this.staffService.isSelfBookType();
    if (
      !isSelf &&
      this.flightService.getPassengerBookInfos().map(item => item.passenger)
        .length == 0
    ) {
      await AppHelper.alert(
        LanguageHelper.Flight.getMustAddOnePassengerTip(),
        true,
        LanguageHelper.getConfirmTip()
      );
      await this.onSelectPassenger();
      return;
    }
    const canbookMore = await this.flightService.canBookMoreFlightSegment(fs);
    if (!canbookMore) {
      await AppHelper.alert(
        LanguageHelper.Flight.getCannotBookMoreFlightSegmentTip(),
        true,
        LanguageHelper.getConfirmTip()
      );
      await this.showSelectedInfos();
      return;
    }
    const validate = await this.flightService.canBookReturnTripFlightSegment(
      fs
    );
    if (!validate) {
      AppHelper.alert(
        LanguageHelper.Flight.getBackDateCannotBeforeGoDateTip(),
        true,
        LanguageHelper.getConfirmTip()
      );
      return;
    }
    // this.flightService.setCurrentViewtFlightSegment(
    //   fs,
    //   this.flightService.getTotalFlySegments(this.flightJourneyList),
    //   this.policyflights
    // );
    this.router.navigate([AppHelper.getRoutePath("flight-item-cabins")], { queryParams: { "flightNo": fs.Number } });

  }
  async showSelectedInfos() {
    const modal = await this.modalCtrl.create({
      component: SelectedFlightsegmentInfoComponent
    });
    await this.flightService.dismissAllTopOverlays();
    await modal.present();
    await modal.onDidDismiss();
    return "ok";
  }

  async selectFilterPolicyPasseger() {
    const popover = await this.popoverController.create({
      component: FilterPassengersPolicyComponent,
      componentProps: {
        bookInfos$: this.flightService.getPassengerBookInfoSource()
      },
      translucent: true
    });
    await popover.present();
    const d = await popover.onDidDismiss();
    const data = d.data as PassengerBookInfo<IFlightSegmentInfo>;
    if (!data) {
      return;
    }
    this.flightService.setPassengerBookInfosSource(this.flightService.getPassengerBookInfos().map(it => {
      it.isFilterPolicy = data.id == it.id && data.isFilterPolicy;
      return it;
    }))
    this.doRefresh(false, true);
  }
  async onSelectCity(isFrom: boolean) {
    if (this.searchFlightModel && this.searchFlightModel.isLocked) {
      return;
    }
    const m = await this.modalCtrl.create({ component: SelectCityComponent });
    m.present();
    const res = await m.onDidDismiss();
    if (res && res.data) {
      const s = this.flightService.getSearchFlightModel();
      if (isFrom) {
        s.fromCity = res.data;
      } else {
        s.toCity = res.data;
      }
      this.flightService.setSearchFlightModel(s);
    }
  }
  private async initSearchModelParams() {
    this.searchConditionSubscription = this.flightService.getSearchFlightModelSource().subscribe(m => {
      this.searchFlightModel = m;
      if (this.searchFlightModel) {
        this.vmFromCity = this.searchFlightModel.fromCity;
        this.vmToCity = this.searchFlightModel.toCity;
      }
    });
  }
  async ngOnInit() {
    this.filteredPolicyPassenger$ = this.flightService
      .getPassengerBookInfoSource()
      .pipe(map(infos => infos.find(it => it.isFilterPolicy)), delay(0));
    this.activeTab = "filter";
    this.initSearchModelParams();
    this.doRefresh(true, false);
    this.filterConditionSubscription = this.flightService
      .getFilterConditionSource()
      .subscribe(filterCondition => {
        console.log("高阶查询", filterCondition);
        this.filterCondition = filterCondition;
        if (this.filterCondition && !this.isLoading) {
          // this.filterFlightJourneyList();
          this.doRefresh(false, true);
        }
      });
  }
  private isStillOnCurrentPage() {
    return this.router.routerState.snapshot.url.includes("flight-list");
  }
  ngOnDestroy() {
    console.log("ngOnDestroy");
    this.vmFlights = [];
    this.selectDaySubscription.unsubscribe();
    this.filterConditionSubscription.unsubscribe();
    this.selectPassengerSubscription.unsubscribe();
    this.searchConditionSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.flyDayService.setSelectedDaysSource([this.flyDayService.generateDayModelByDate(this.searchFlightModel.Date)]);
    }, 10);
    this.liEles.changes.subscribe(_ => {
      console.timeEnd("renderFlightList");
    })
  }

  onFilter() {
    this.activeTab = "filter";
    this.flightService.setFilterPanelShow(true);
  }
  async onTimeOrder() {
    console.time("time");
    this.isLoading = true;
    this.activeTab = "time";
    this.timeOrdM2N = !this.timeOrdM2N;
    await this.sortFlights("time");
    this.isLoading = false;
    console.timeEnd("time");
  }
  async onPriceOrder() {
    console.time("price");
    this.isLoading = true;
    this.activeTab = "price";
    this.priceOrderL2H = !this.priceOrderL2H;
    await this.sortFlights("price");
    this.isLoading = false;
    console.timeEnd("price");
  }
  private async sortFlights(key: "price" | "time") {
    if (!this.filterCondition) {
      this.filterCondition = FilterConditionModel.init();
    }
    this.st = Date.now();
    if (key === "price") {
      this.filterCondition.priceFromL2H = this.priceOrderL2H
        ? "low2Height"
        : "height2Low";
      this.filterCondition.timeFromM2N = "initial";
      const segments = this.flightService.sortByPrice(
        this.vmFlights,
        this.priceOrderL2H
      );
      let isRerender = false;
      for (let i = 0; i < segments.length; i++) {
        const s = segments[i];
        const li = this.refMap.get(s);
        if (!li) {
          isRerender = true;
          break;
        }
        if (this.list) {
          const old = this.list.nativeElement.childNodes[i];
          this.list.nativeElement.insertBefore(li, old);
        }
      }
      if (isRerender) {
        console.log(`重新渲染整个列表`);
        this.renderFlightList(segments);
      }
      // this.renderFlightList2(segments);
    }
    if (key === "time") {
      this.filterCondition.timeFromM2N = this.timeOrdM2N ? "am2pm" : "pm2am";
      this.filterCondition.priceFromL2H = "initial";
      const segments = this.flightService.sortByTime(
        this.vmFlights,
        this.timeOrdM2N
      );
      let isRerender = false;
      for (let i = 0; i < segments.length; i++) {
        const s = segments[i];
        const li = this.refMap.get(s);
        if (!li) {
          isRerender = true;
          break;
        }
        if (this.list) {
          const old = this.list.nativeElement.childNodes[i];
          this.list.nativeElement.insertBefore(li, old);
        }
      }
      if (isRerender) {
        console.log(`重新渲染整个列表`);
        await this.renderFlightList(segments);
      }
    }
    this.scrollToTop();
  }

  private renderFlightList(fs: FlightSegmentEntity[] = []) {
    fs.forEach(s => {
      let lowestFare = +s.LowestFare;
      if (s.Cabins && s.Cabins.length) {
        const cbs = s.Cabins.slice(0);
        cbs.sort((a, b) => +a.SalesPrice - +b.SalesPrice);
        lowestFare = +cbs[0].SalesPrice;
      }
      s.LowestFare = `${lowestFare}`;
    })
    console.time("renderFlightList");
    this.vmFlights = fs;
    return;
  }
  private filterFlightSegments(segs: FlightSegmentEntity[]) {
    let result = segs;
    // 根据筛选条件过滤航班信息：
    const bookInfo = this.flightService.getPassengerBookInfos().find(it => it.isFilterPolicy);
    // result = this.flightService.filterPassengerPolicyFlights(
    //   bookInfo,
    //   result
    // );
    result = this.filterFlightSegmentsByConditions(result);
    return result;
  }
  private filterFlightSegmentsByConditions(segs: FlightSegmentEntity[]) {
    console.log(
      "filterFlightJourneyList",
      this.filterCondition,
      "flights",
      segs
    );
    let result = segs;
    if (!this.filterCondition) {
      return result;
    }
    result = this.flightService.filterByFlightDirect(result);
    result = this.flightService.filterByFromAirports(result);
    result = this.flightService.filterByToAirports(result);
    result = this.flightService.filterByAirportCompanies(result);
    result = this.flightService.filterByAirTypes(result);
    result = this.flightService.filterByCabins(result);
    result = this.flightService.filterByTakeOffTimeSpan(result);
    return result;
  }
}
