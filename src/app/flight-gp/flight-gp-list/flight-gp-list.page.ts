import { IFlightSegmentInfo } from "../models/PassengerFlightInfo";
import { PassengerBookInfo, TmcService } from "../../tmc/tmc.service";
import { environment } from "src/environments/environment";
import { ApiService } from "src/app/services/api/api.service";
import { FlyFilterComponent } from "../components/fly-filter/fly-filter.component";
import { FlightGpService, SearchFlightModel } from "../flight-gp.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import { HrService } from "../../hr/hr.service";
import { AppHelper } from "src/app/appHelper";
import { animate } from "@angular/animations";
import { trigger, state, style, transition } from "@angular/animations";
import {
  IonContent,
  IonRefresher,
  ModalController,
  PopoverController,
} from "@ionic/angular";
import { Observable, Subscription, Subject, BehaviorSubject } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  QueryList,
  ViewChildren,
} from "@angular/core";
import { delay, map } from "rxjs/operators";
import * as moment from "moment";
import { CalendarService } from "../../tmc/calendar.service";
import { DayModel } from "../../tmc/models/DayModel";
import { FlightSegmentEntity } from "../models/flight/FlightSegmentEntity";
import { FlightJourneyEntity } from "../models/flight/FlightJourneyEntity";
import { FlightCabinType } from "../models/flight/FlightCabinType";
import { FilterConditionModel } from "../models/flight/advanced-search-cond/FilterConditionModel";

import { TripType } from "src/app/tmc/models/TripType";
import { CanComponentDeactivate } from "src/app/guards/candeactivate.guard";
import { FlightCityService } from "../flight-city.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { FlightService } from "src/app/flight/flight.service";
import { StorageService } from "src/app/services/storage-service.service";
import { ThemeService } from "src/app/services/theme/theme.service";
@Component({
  selector: "app-flight-gp-list",
  templateUrl: "./flight-gp-list.page.html",
  styleUrls: ["./flight-gp-list.page.scss"],
  animations: [
    trigger("showFooterAnimate", [
      state("true", style({ height: "*" })),
      state("false", style({ height: 0 })),
      transition("false<=>true", animate("100ms ease-in-out")),
    ]),
    trigger("openClose", [
      state("true", style({ height: "*" })),
      state("false", style({ height: "0px" })),
      transition("false <=> true", animate(500)),
    ]),
    trigger("rotateIcon", [
      state(
        "*",
        style({
          display: "inline-block",
          transform: "rotateZ(-8deg) scale(1)",
          opacity: 1,
        })
      ),
      transition(
        "false <=> true",
        animate(
          "200ms ease-in",
          style({
            transform: "rotateZ(360deg) scale(1.1)",
            opacity: 0.7,
          })
        )
      ),
    ]),
  ],
})
export class FlightGpListPage
  implements OnInit, AfterViewInit, OnDestroy, CanComponentDeactivate {
  private subscriptions: Subscription[] = [];
  private isRotatingIcon = false;
  private pageUrl;
  private lastFetchTime = 0;
  private oldSearchCities: {
    fromCityCode: string;
    toCityCode: string;
  } = {} as any;
  private pageTimeoutSubscription = Subscription.EMPTY;
  lowestPriceSegments: FlightSegmentEntity[];
  searchFlightModel: SearchFlightModel;
  filterCondition: FilterConditionModel;
  showAddPassenger = false;
  isRotateIcon = false;
  isOpenFilter = false;
  isAgent = false;
  identity: IdentityEntity;
  @ViewChild("cnt", { static: true }) public cnt: IonContent;
  @ViewChildren("fli") public liEles: QueryList<ElementRef<HTMLElement>>;
  vmFlights: FlightSegmentEntity[]; // 用于视图展示
  vmFlightJourneyList: FlightJourneyEntity[];
  identitySubscription = Subscription.EMPTY;
  get flightResult() {
    return this.flightGpService.flightResult;
  }
  totalFilteredSegments: FlightSegmentEntity[];
  priceOrderL2H: boolean; // 价格从低到高
  timeOrdM2N: boolean; // 时间从早到晚
  isLoading = false;
  isSelfBookType = true;
  day: string;
  phone = "400-66-88868";
  currentProcessStatus = "正在获取航班列表";
  st = 0;
  selectedPassengersNumbers: number;
  goAndBackFlightDateTime: {
    goArrivalDateTime: string;
    backTakeOffDateTime: string;
  };
  @ViewChild(IonRefresher) refresher: IonRefresher;
  activeTab: "filter" | "time" | "price" | "none"; // 当前激活的tab
  hasDataSource: Subject<boolean>;
  showSelectFlyDayPage$: Observable<boolean>;
  filteredPolicyPassenger: PassengerBookInfo<IFlightSegmentInfo>;
  isCanLeave = false;
  get filterConditionIsFiltered() {
    return (
      (this.filterCondition && this.filterCondition.onlyDirect) ||
      (this.filterCondition && this.filterCondition.isAgreement) ||
      (this.filterCondition.userOps &&
        Object.keys(this.filterCondition.userOps).some(
          (k) => this.filterCondition.userOps[k]
        ))
    );
  }
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private flightGpService: FlightGpService,
    private flyDayService: CalendarService,
    private staffService: HrService,
    private apiService: ApiService,
    private identityService: IdentityService,
    private modalCtrl: ModalController,
    private popoverController: PopoverController,
    private storage: StorageService,
    private tmcService: TmcService,
    private refEle: ElementRef<HTMLElement>,
    private themeService: ThemeService,
  ) {
    this.themeService.getModeSource().subscribe(m => {
      if (m == 'dark') {
        this.refEle.nativeElement.classList.add("dark")
      } else {
        this.refEle.nativeElement.classList.remove("dark")
      }
    })
    this.subscriptions.push(
      this.identityService.getIdentitySource().subscribe((id) => {
        this.identity = id;
      })
    );
    this.subscriptions.push(
      flightGpService
        .getPassengerBookInfoSource()
        .pipe(map((item) => item.length))
        .subscribe((n) => {
          this.selectedPassengersNumbers = n;
        })
    );
    this.hasDataSource = new BehaviorSubject(false);
    this.vmFlights = [];
    this.searchFlightModel = new SearchFlightModel();
    this.subscriptions.push(
      flightGpService.getPassengerBookInfoSource().subscribe((infos) => {
        const goInfo = infos.find(
          (item) =>
            item.bookInfo && item.bookInfo.tripType == TripType.departureTrip
        );
        const backInfo = infos.find(
          (item) =>
            item.bookInfo && item.bookInfo.tripType == TripType.returnTrip
        );
        this.goAndBackFlightDateTime = {
          goArrivalDateTime:
            goInfo && goInfo.bookInfo && goInfo.bookInfo.flightSegment
              ? moment(goInfo.bookInfo.flightSegment.ArrivalTime).format(
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
              : "",
        };
      })
    );
    this.route.queryParamMap.subscribe(async (d) => {
      this.isAgent = this.tmcService.isAgent;
      this.pageUrl = this.router.url;
      if (d.get("isClearBookInfos") == "true") {
        this.flightGpService.clearSelectedBookInfos([]);
      }
      this.isCanLeave = !this.flightGpService.getSearchFlightModel().isExchange;
      this.isSelfBookType = await this.staffService.isSelfBookType();
      this.startCheckPageTimeout();
      this.showAddPassenger = await this.canShowAddPassenger();
      const delta = Math.floor((Date.now() - this.lastFetchTime) / 1000);
      console.log("this.route.queryParamMap deltaTime=", delta);
      const isFetch = delta >= 60 * 2 || this.checkIfCityChanged();
      if (
        (d && d.get("doRefresh") == "true") ||
        !this.vmFlights ||
        !this.vmFlights.length ||
        isFetch
      ) {
        this.lastFetchTime = Date.now();
        this.doRefresh(true, false);
      }
      const filteredBookInfo = this.flightGpService
        .getPassengerBookInfos()
        .find((it) => it.isFilterPolicy);
      if (filteredBookInfo) {
        this.doRefresh(false, true);
      }
    });
  }
  trackById(item: FlightSegmentEntity) {
    return item.Id;
  }
  private checkIfCityChanged() {
    try {
      return (
        this.searchFlightModel.fromCity.Code !=
        this.oldSearchCities.fromCityCode ||
        this.searchFlightModel.toCity.Code != this.oldSearchCities.toCityCode
      );
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  private getCachcityKey() {
    if (this.identity) {
      return `last_selected_flight_gp_goDate_${this.identity.Id}`;
    }
    return "";
  }
  getNoMoreDataDesc() {
    const bookInfos = this.flightGpService.getPassengerBookInfos();
    const go = bookInfos.find(
      (it) => it.bookInfo && it.bookInfo.tripType == TripType.departureTrip
    );
    if (go) {
      if (!this.vmFlights || !this.vmFlights.length) {
        let arrival = go.bookInfo.flightSegment.ArrivalTime || "";
        arrival = moment(arrival).add(1, "hours").format("YYYY-MM-DD HH:mm");
        if (
          arrival.replace("T", " ").substring(0, 10) == this.day ||
          this.searchFlightModel.Date ==
          arrival.replace("T", " ").substring(0, 10)
        ) {
          return `${arrival.replace("T", " ")}之后已无航班`;
        }
        return `无航班信息`;
      }
    } else {
      return "未查到符合条件的航班信息<br/>请更改查询条件重新查询";
    }
  }

  private startCheckPageTimeout() {
    this.pageTimeoutSubscription.unsubscribe();
    this.pageTimeoutSubscription = this.flightGpService
      .getPagePopTimeoutSource()
      .subscribe(async (r) => {
        if (r) {
          const ok = await this.flightGpService.showTimeoutPop(
            true,
            this.pageUrl
          );
          if (ok) {
            this.doRefresh(true, false);
          }
        }
      });
  }

  async canShowAddPassenger() {
    const identity = await this.identityService
      .getIdentityAsync()
      .catch((_) => null);
    this.showAddPassenger =
      (identity && identity.Numbers && identity.Numbers.AgentId) ||
      (!(await this.staffService.isSelfBookType()) &&
        !this.flightGpService
          .getPassengerBookInfos()
          .every((it) => !!it.exchangeInfo));
    return this.showAddPassenger;
  }
  async onCalenderClick() {
    const d = await this.flightGpService.openCalendar(false);
    if (d && d.length) {
      const go = d[0];
      this.onChangedDay(go, true);
    }
  }
  async onChangedDay(day: DayModel, byUser: boolean) {
    if (day) {
      this.day = day.date;
    }
    if (
      byUser &&
      (!day || this.searchFlightModel.Date == day.date || this.isLoading)
    ) {
      return;
    }
    const identity = await this.identityService.getIdentityAsync();
    const s = this.flightGpService.getSearchFlightModel();
    if (s.isRoundTrip) {
      if (s.tripType == TripType.departureTrip) {
        if (identity && this.getCachcityKey()) {
          await this.storage.set(this.getCachcityKey(), day.date);
        }
      }
    } else {
      if (identity && this.getCachcityKey()) {
        await this.storage.set(this.getCachcityKey(), day.date);
      }
    }
    if (this.filterCondition) {
      this.filterCondition.priceFromL2H = "initial";
      this.filterCondition.timeFromM2N = "initial";
    }
    this.activeTab = this.filterConditionIsFiltered ? "filter" : "none";
    this.searchFlightModel.Date = day.date;
    this.flightGpService.setSearchFlightModelSource(this.searchFlightModel);
    this.doRefresh(true, true);
  }
  onSwapCity() {
    const s = this.flightGpService.getSearchFlightModel();
    if (s.isLocked || this.isRotatingIcon) {
      return;
    }
    this.isRotatingIcon = true;
    this.flightGpService.onSwapCity();
    this.isRotateIcon = !this.isRotateIcon; // 控制图标旋转
    this.doRefresh(true, false);
  }
  onRotateIconDone() {
    this.isRotatingIcon = false;
    console.log("onRotateIconDone");
  }

  async getIdentity() {
    this.identitySubscription = this.identityService
      .getIdentitySource()
      .subscribe((r) => {
        this.identity = r;
      });
  }

  // isShowIdentity(){
  //   return this.identity.IsShareTicket
  // }

  async doRefresh(loadDataFromServer: boolean, keepSearchCondition: boolean) {
    console.log(
      `doRefresh:loadDataFromServer=${loadDataFromServer},keepSearchCondition=${keepSearchCondition}`
    );
    try {
      this.lowestPriceSegments = [];
      if (loadDataFromServer) {
        this.lastFetchTime = Date.now();
        this.scrollToTop();
        setTimeout(() => {
          this.flyDayService.setSelectedDaysSource([
            this.flyDayService.generateDayModelByDate(
              this.searchFlightModel.Date
            ),
          ]);
        }, 200);
      }
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;
      this.flyDayService.setSelectedDaysSource([
        this.flyDayService.generateDayModelByDate(this.searchFlightModel.Date),
      ]);
      // const isSelf = await this.staffService.isSelfBookType();
      // this.moveDayToSearchDate();
      if (this.refresher) {
        this.refresher.complete();
        this.refresher.disabled = true;
        setTimeout(() => {
          this.refresher.disabled = false;
        }, 100);
      }
      if (!keepSearchCondition) {
        this.filterCondition = FilterConditionModel.init();
        this.flightGpService.setFilterConditionSource(this.filterCondition);
        setTimeout(() => {
          this.activeTab = "none";
        }, 0);
      }
      this.getIdentity();
      this.vmFlights = [];
      this.isLoading = true;
      this.currentProcessStatus = "正在获取航班列表";
      this.apiService.showLoadingView({ msg: this.currentProcessStatus });
      this.oldSearchCities.fromCityCode =
        this.searchFlightModel &&
        this.searchFlightModel.fromCity &&
        this.searchFlightModel.fromCity.Code;
      this.oldSearchCities.toCityCode = this.searchFlightModel.toCity.Code;
      const flightJourneyList =
        await this.flightGpService.getFlightJourneyDetailListAsync(
          loadDataFromServer
        );
      this.hasDataSource.next(false);
      let segments = this.filterFlightSegments(
        this.flightGpService.getTotalFlySegments()
      );
      this.st = Date.now();
      this.renderFlightList(segments);
      this.hasDataSource.next(!!this.vmFlights.length && !this.isLoading);
      this.apiService.hideLoadingView();
      this.isLoading = false;
      if (this.activeTab != "none" && this.activeTab != "filter") {
        this.sortFlights(this.activeTab);
      }
      if (loadDataFromServer || !keepSearchCondition) {
        this.initFilterConditionInfo();
      }
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
        if (this.cnt && typeof this.cnt.scrollToTop == "function") {
          this.cnt.scrollToTop(100);
        }
      }
    }, 200);
  }

  // async onCall() {
  //   if (this.phone) {
  //     const phoneNumber = this.phone;
  //     const callNumber = window["call"];
  //     if (callNumber) {
  //       callNumber
  //         .callNumber(phoneNumber, true)
  //         .then((res) => console.log("Launched dialer!", res))
  //         .catch((err) => console.log("Error launching dialer", err));
  //     } else {
  //       const a = document.createElement("a");
  //       a.href = `tel:${phoneNumber}`;
  //       a.click();
  //     }
  //   }
  // }

  private async checkCabinsAndPolicy(fs: FlightSegmentEntity) {
    try {
      if (!fs.Cabins || !fs.Cabins.length) {
        await this.flightGpService.initFlightSegmentCabins(fs);
      }
      if (fs.Cabins && fs.Cabins.length) {
        const p = await this.flightGpService.initFlightSegmentCabinsPolicy();
        return p && p.length > 0;
      }
    } catch (e) {
      console.error(e);
      AppHelper.alert(e);
    }
    return fs && fs.Cabins && fs.Cabins.length > 0;
  }
  async goToFlightCabinsDetails(fs: FlightSegmentEntity) {
    try {
      await this.checkCabinsAndPolicy(fs);
      this.isCanLeave = true;
      await this.flightGpService.addOneBookInfoToSelfBookType();
      this.flightGpService.currentViewtFlightSegment = fs;
      this.router.navigate([AppHelper.getRoutePath("flight-gp-item-cabins")]);
    } catch (e) {
      console.error(e);
    }
  }
  onShowSelectedInfos() {
    this.isCanLeave = true;
    // this.flightService.showSelectedBookInfosPage();
  }

  async onSelectCity(isFrom: boolean) {
    if (this.flightGpService.getSearchFlightModel().isLocked) {
      return;
    }
    this.isCanLeave = true;
    // this.flightService.onSelectCity(isFrom);
    const rs = await this.flightGpService.onSelectCity({
      isShowPage: true,
      isFrom,
    });
    if (rs) {
      const s = this.searchFlightModel;
      if (rs.isDomestic) {
        const fromCity = isFrom ? rs.city : s.fromCity;
        const toCity = isFrom ? s.toCity : rs.city;
        this.flightGpService.setSearchFlightModelSource({
          ...s,
          fromCity,
          toCity,
          FromCode: fromCity.Code,
          ToCode: toCity.Code,
          FromAsAirport: s.ToAsAirport,
          ToAsAirport: s.FromAsAirport,
        });
        if (this.checkIfCityChanged()) {
          this.doRefresh(true, false);
        }
      } else {
      }
    }
  }
  private async initSearchModelParams() {
    this.subscriptions.push(
      this.flightGpService.getSearchFlightModelSource().subscribe((m) => {
        this.searchFlightModel = m;
      })
    );
  }
  async ngOnInit() {
    this.subscriptions.push(
      this.flightGpService
        .getPassengerBookInfoSource()
        .pipe(
          map((infos) => infos.find((it) => it.isFilterPolicy)),
          delay(0)
        )
        .subscribe((r) => {
          this.filteredPolicyPassenger = r;
        })
    );
    this.activeTab = "filter";
    this.initSearchModelParams();
    const filterConditionSubscription = this.flightGpService
      .getFilterConditionSource()
      .subscribe((filterCondition) => {
        this.filterCondition = { ...filterCondition };
      });
    this.subscriptions.push(filterConditionSubscription);
  }
  private isStillOnCurrentPage() {
    return this.router.routerState.snapshot.url.includes("flight-gp-list");
  }
  ngOnDestroy() {
    console.log("ngOnDestroy");
    this.vmFlights = [];
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.flyDayService.setSelectedDaysSource([
        this.flyDayService.generateDayModelByDate(this.searchFlightModel.Date),
      ]);
    }, 10);
    this.liEles.changes.subscribe((_) => {
      // console.timeEnd("renderFlightList");
    });
  }
  private initFilterConditionInfo() {
    if (!this.filterCondition) {
      this.filterCondition = FilterConditionModel.init();
    }
    this.filterCondition.fromCity = this.searchFlightModel.fromCity;
    this.filterCondition.toCity = this.searchFlightModel.toCity;
    if (this.flightResult) {
      this.filterCondition.airCompanies = [];
      this.filterCondition.fromAirports = [];
      this.filterCondition.toAirports = [];
      this.filterCondition.airTypes = [];
      this.filterCondition.cabins = [];
      this.flightResult.FlightSegments.forEach((s) => {
        if (s.Cabins) {
          s.Cabins.forEach((c) => {
            if (
              !this.filterCondition.cabins.find((a) => a.label == c.TypeName)
            ) {
              this.filterCondition.cabins.push({
                id: c.Type,
                label: c.TypeName,
                isChecked: false,
              });
            }
          });
        }
        if (!this.filterCondition.airTypes.find((a) => a.id === s.PlaneType)) {
          this.filterCondition.airTypes.push({
            id: s.PlaneType,
            label: s.PlaneTypeDescribe,
            isChecked: false,
          });
        }
        if (
          !this.filterCondition.airCompanies.find((c) => c.id === s.Airline)
        ) {
          this.filterCondition.airCompanies.push({
            id: s.Airline,
            label: s.AirlineName,
            isChecked: false,
            icon: s.AirlineSrc,
          });
        }
        if (
          !this.filterCondition.fromAirports.find((a) => a.id === s.FromAirport)
        ) {
          this.filterCondition.fromAirports.push({
            label: s.FromAirportName,
            id: s.FromAirport,
            isChecked: false,
          });
        }
        if (
          !this.filterCondition.toAirports.find((a) => a.id === s.ToAirport)
        ) {
          this.filterCondition.toAirports.push({
            label: s.ToAirportName,
            id: s.ToAirport,
            isChecked: false,
          });
        }
      });
      this.filterCondition.cabins = this.filterCondition.cabins.filter((c) =>
        [
          FlightCabinType.Y,
          FlightCabinType.SeniorY,
          FlightCabinType.C,
          FlightCabinType.F,
        ].some((it) => +it == +c.id)
      );
    }
    console.log("initFilterConditionInfo", this.filterCondition);
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
      component: FlyFilterComponent,
      cssClass: "offset-top-40 top-radius-8",
      showBackdrop: false,
      swipeToClose: true,
      componentProps: {
        filterCondition: this.filterCondition,
      },
    });
    m.present();
    this.isOpenFilter = true;
    m.onWillDismiss().then(() => {
      this.isOpenFilter = false;
    });
    const res = await m.onDidDismiss();
    if (res && res.data) {
      const {
        confirm,
        filterCondition,
      }: { confirm: boolean; filterCondition: FilterConditionModel } = res.data;
      console.log("onFilter filtercondition", filterCondition);
      if (confirm) {
        this.flightGpService.setFilterConditionSource(filterCondition);
        this.doRefresh(false, true);
      }
    }
  }
  async onTimeOrder() {
    // console.time("time");
    this.isLoading = true;
    this.activeTab = "time";
    this.timeOrdM2N = !this.timeOrdM2N;
    this.sortFlights("time");
    this.isLoading = false;
    // console.timeEnd("time");
  }
  async onPriceOrder() {
    // console.time("price");
    this.isLoading = true;
    this.activeTab = "price";
    this.priceOrderL2H = !this.priceOrderL2H;
    this.sortFlights("price");
    this.isLoading = false;
    // console.timeEnd("price");
  }
  private sortFlights(key: "price" | "time") {
    if (!this.filterCondition) {
      this.filterCondition = FilterConditionModel.init();
    }
    this.st = Date.now();
    if (key === "price") {
      this.filterCondition.priceFromL2H = this.priceOrderL2H
        ? "low2Height"
        : "height2Low";
      this.filterCondition.timeFromM2N = "initial";
      const segments = this.flightGpService.sortByPrice(
        this.vmFlights,
        this.priceOrderL2H
      );
      this.renderFlightList(segments);
    }
    if (key === "time") {
      this.filterCondition.timeFromM2N = this.timeOrdM2N ? "am2pm" : "pm2am";
      this.filterCondition.priceFromL2H = "initial";
      const segments = this.flightGpService.sortByTime(
        this.vmFlights,
        this.timeOrdM2N
      );
      this.renderFlightList(segments);
    }
    this.scrollToTop();
  }
  private calcLowestPrice(fs: FlightSegmentEntity[]) {
    const data = fs;
    let lowestPrice = Infinity;
    data.forEach((s) => {
      let lowestFare = +s.LowestFare;
      if (s.Cabins && s.Cabins.length) {
        const cbs = s.Cabins.slice(0);
        cbs.sort((a, b) => +a.SalesPrice - +b.SalesPrice);
        lowestFare = +cbs[0].SalesPrice;
      }
      s.LowestFare = `${lowestFare}`;
      lowestPrice = Math.min(lowestPrice, +s.LowestFare);
    });
    this.initLowestPriceSegments(
      data.map((it) => {
        it.isLowestPrice = +it.LowestFare == lowestPrice;
        return it;
      })
    );
    return fs.map((s) => {
      s.isLowestPrice = +s.LowestFare == lowestPrice;
      return s;
    });
  }
  private initLowestPriceSegments(totalFlySegments: FlightSegmentEntity[]) {
    this.lowestPriceSegments =
      this.filterConditionIsFiltered || this.activeTab != "none"
        ? []
        : totalFlySegments.filter((it) => it.isLowestPrice);
    return this.lowestPriceSegments;
  }
  private renderFlightList(fs: FlightSegmentEntity[] = []) {
    this.vmFlights = this.calcLowestPrice(fs);
    return;
  }
  private filterFlightSegments(segs: FlightSegmentEntity[]) {
    let result = segs;
    // 根据筛选条件过滤航班信息：
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
    if (!this.filterCondition || !this.filterConditionIsFiltered) {
      return result;
    }
    result = this.flightGpService.filterByFromAirports(result);
    result = this.flightGpService.filterByToAirports(result);
    result = this.flightGpService.filterByAirportCompanies(result);
    result = this.flightGpService.filterByAirTypes(result);
    result = this.flightGpService.filterByCabins(result);
    result = this.flightGpService.filterByTakeOffTimeSpan(result);
    result = this.flightGpService.filterByFlightDirect(result);
    result = this.flightGpService.filterByIsAgreement(result);
    return result;
  }
  canDeactivate() {
    if (this.flightGpService.isShowingPage) {
      this.flightGpService.onSelectCity({ isShowPage: false, isFrom: false });
      return false;
    }
    const s = this.flightGpService.getSearchFlightModel();
    if (s.isExchange) {
      if (this.isCanLeave) {
        return true;
      }
      return AppHelper.alert("是否放弃改签？", true, "是", "否");
    }
    return true;
  }
}
