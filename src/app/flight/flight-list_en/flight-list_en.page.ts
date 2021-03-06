import { CabintypePipe } from "./../pipes/cabintype.pipe";
import { LangService } from "../../services/lang.service";
import { SelectFlightPassengerComponent } from "./../components/select-flight-passenger/select-flight-passenger.component";
import { IFlightSegmentInfo } from "./../models/PassengerFlightInfo";
import {
  PassengerBookInfo,
  FlightHotelTrainType,
  TmcService,
} from "./../../tmc/tmc.service";
import { environment } from "src/environments/environment";
import { ApiService } from "src/app/services/api/api.service";
import { FlyFilterComponent } from "./../components/fly-filter/fly-filter.component";
import { SearchFlightModel } from "./../flight.service";
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
  EventEmitter,
} from "@angular/core";
import { delay, map } from "rxjs/operators";
import * as moment from "moment";
import { CalendarService } from "../../tmc/calendar.service";
import { DayModel } from "../../tmc/models/DayModel";
import { FlightService } from "../flight.service";
import { FlightSegmentEntity } from "../models/flight/FlightSegmentEntity";
import { FlightJourneyEntity } from "../models/flight/FlightJourneyEntity";
import { FlightCabinType } from "../models/flight/FlightCabinType";
import { LanguageHelper } from "src/app/languageHelper";
import { FilterConditionModel } from "../models/flight/advanced-search-cond/FilterConditionModel";

import { TripType } from "src/app/tmc/models/TripType";
import { FilterPassengersPolicyComponent } from "../../tmc/components/filter-passengers-popover/filter-passengers-policy-popover.component";
import { CanComponentDeactivate } from "src/app/guards/candeactivate.guard";
import { FlightCityService } from "../flight-city.service";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { StorageService } from "src/app/services/storage-service.service";
@Component({
  selector: "app-flight-list",
  templateUrl: "./flight-list_en.page.html",
  styleUrls: ["./flight-list_en.page.scss"],
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
export class FlightListEnPage
  implements OnInit, AfterViewInit, OnDestroy, CanComponentDeactivate {
  private subscriptions: Subscription[] = [];
  private isRotatingIcon = false;
  private lastFetchTime = 0;
  private lastPassengerIds: string[] = [];
  private oldSearchCities: {
    fromCityCode: string;
    toCityCode: string;
  } = {} as any;
  langOpt = {
    meal: "Meal",
    isStop: "Stop over",
    directFly: "NON-Stop",
    agreementDesc: "'A' menans Corporate Fares",
    no: "No ",
    common: "Operated by ",
    agreement: "A",
    planeType: "Aircraft ",
    lowestPrice: "LowestPrice",
    lowestPriceRecommend: "LowestPriceRecommend",
  };
  lowestPriceSegments: FlightSegmentEntity[];
  searchFlightModel: SearchFlightModel;
  filterCondition: FilterConditionModel;
  showAddPassenger = false;
  isRotateIcon = false;
  isOpenFilter = false;
  @ViewChild("cnt", { static: true }) public cnt: IonContent;
  @ViewChildren("fli") public liEles: QueryList<ElementRef<HTMLElement>>;
  vmFlights: FlightSegmentEntity[]; // ??????????????????
  vmFlightJourneyList: FlightJourneyEntity[];
  get flightResult() {
    return this.flightService.flightGoTripResult;
  }
  totalFilteredSegments: FlightSegmentEntity[];
  priceOrderL2H: boolean; // ??????????????????
  timeOrdM2N: boolean; // ??????????????????
  isLoading = false;
  isSelfBookType = true;
  day: string;
  currentProcessStatus = "????????????????????????";
  st = 0;
  selectedPassengersNumbers: number;
  goAndBackFlightDateTime: {
    goArrivalDateTime: string;
    backTakeOffDateTime: string;
  };
  @ViewChild(IonRefresher) refresher: IonRefresher;
  activeTab: "filter" | "time" | "price" | "none"; // ???????????????tab
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
    private flightService: FlightService,
    private flyDayService: CalendarService,
    private staffService: HrService,
    private apiService: ApiService,
    private identityService: IdentityService,
    private modalCtrl: ModalController,
    private popoverController: PopoverController,
    private storage: StorageService,
    private tmcService: TmcService,
    private langService: LangService,
    private cabintypePipe: CabintypePipe
  ) {
    this.subscriptions.push(
      flightService
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
      flightService.getPassengerBookInfoSource().subscribe((infos) => {
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
      this.isCanLeave = !this.flightService.getSearchFlightModel().isExchange;
      this.isSelfBookType = await this.staffService.isSelfBookType();
      this.showAddPassenger = await this.canShowAddPassenger();
      const delta = Math.floor((Date.now() - this.lastFetchTime) / 1000);
      console.log("this.route.queryParamMap deltaTime=", delta);
      const isFetch =
        delta >= 60 * 2 ||
        this.checkIfCityChanged() ||
        this.checkIfSelectedPassengerChanged();
      if (
        (d && d.get("doRefresh") == "true") ||
        !this.vmFlights ||
        !this.vmFlights.length ||
        isFetch
      ) {
        this.lastFetchTime = Date.now();
        this.doRefresh(true, false);
      }
      const filteredBookInfo = this.flightService
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
  private checkIfSelectedPassengerChanged() {
    try {
      return (
        this.lastPassengerIds.join(",") !=
        this.flightService
          .getPassengerBookInfos()
          .map((it) => it.passenger && it.passenger.Id)
          .join(",")
      );
    } catch (e) {
      console.error(e);
    }
    return false;
  }
  private async checkHasLowerSegment() {
    return {
      ok: true,
    };
  }
  async onBookLowestSegment(evt: CustomEvent, s: FlightSegmentEntity) {
    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }
    if (s) {
      const ok = await this.checkCabinsAndPolicy(s);
      if (!ok) {
        if (!this.tmcService.isAgent) {
          AppHelper.alert("???????????????????????????");
          return;
        }
      }
      if (!s.Cabins || !s.Cabins.length) {
        return;
      }
      const cabins = s.Cabins.sort((c1, c2) => +c1.SalesPrice - +c2.SalesPrice);
      const cabin =
        (cabins && cabins.find((it) => it.SalesPrice == s.LowestFare)) ||
        cabins[0];
      if (cabin) {
        const bookInfos = this.flightService.getPassengerBookInfos();
        if (!bookInfos.length) {
          await this.flightService.initSelfBookTypeBookInfos();
        }
        if (bookInfos && bookInfos.length) {
          const r = await this.flightService.addOrReplaceSegmentInfo(cabin, s);
          const a = bookInfos.find(
            (it) => it.bookInfo && it.bookInfo.isDontAllowBook
          );
          if (a) {
            AppHelper.alert(
              `??????????????????,${
                a.bookInfo.flightPolicy &&
                a.bookInfo.flightPolicy.Rules.join(",")
              }`
            );
            const result = await this.checkHasLowerSegment();

            return;
          }
          if (r.isProcessOk) {
            this.onShowSelectedInfos();
          }
        } else {
          const isself = await this.staffService.isSelfBookType();
          if (!isself) {
            await AppHelper.alert("??????????????????", true);
            this.onSelectPassenger();
          }
        }
      } else {
        if (!this.tmcService.isAgent) {
          AppHelper.alert("??????????????????");
          s["disabled"] = true;
          this.goToFlightCabinsDetails(s);
        }
      }
    }
  }

  getNoMoreDataDesc() {
    const bookInfos = this.flightService.getPassengerBookInfos();
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
          return `${arrival.replace("T", " ")}??????????????????`;
        }
        return `???????????????`;
      }
    } else {
      return "????????????????????????????????????<br/>?????????????????????????????????";
    }
  }
  async canShowAddPassenger() {
    this.showAddPassenger =
      this.tmcService.isAgent ||
      (!(await this.staffService.isSelfBookType()) &&
        this.flightService
          .getPassengerBookInfos()
          .every((it) => !it.exchangeInfo));
    return this.showAddPassenger;
  }
  private async translateLang(segs: FlightSegmentEntity[]) {
    try {
      if (segs) {
        const airports = await this.flightService.getDomesticAirports();
        if (airports && airports.length) {
          segs.forEach((seg) => {
            const fap = airports.find(
              (it) =>
                it.Code == seg.FromAirport &&
                (this.searchFlightModel.FromAsAirport
                  ? it.Tag == "Airport"
                  : "AirportCity")
            );
            const tap = airports.find(
              (it) =>
                it.Code == seg.ToAirport &&
                (this.searchFlightModel.FromAsAirport
                  ? it.Tag == "Airport"
                  : "AirportCity")
            );
            if (fap) {
              seg.FromAirportName = fap.EnglishName.replace("International", "")
                .replace("Airport", "")
                .trim();
            }
            if (tap) {
              seg.ToAirportName = tap.EnglishName.replace("International", "")
                .replace("Airport", "")
                .trim();
            }
          });
        }
      }
    } catch (e) {}
    return segs;
  }
  async onCalenderClick() {
    const d = await this.flightService.openCalendar(false);
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
    const s = this.flightService.getSearchFlightModel();
    if (s.isRoundTrip) {
      if (s.tripType == TripType.departureTrip) {
        if (identity) {
          await this.storage.set(
            `last_selected_flight_goDate_${identity.Id}`,
            day.date
          );
        }
      }
    } else {
      if (identity) {
        await this.storage.set(
          `last_selected_flight_goDate_${identity.Id}`,
          day.date
        );
      }
    }
    if (this.filterCondition) {
      this.filterCondition.priceFromL2H = "initial";
      this.filterCondition.timeFromM2N = "initial";
    }
    this.activeTab = this.filterConditionIsFiltered ? "filter" : "none";
    this.searchFlightModel.Date = day.date;
    this.flightService.setSearchFlightModelSource(this.searchFlightModel);
    this.doRefresh(true, true);
  }
  onSwapCity() {
    const s = this.flightService.getSearchFlightModel();
    if (s.isLocked || this.isRotatingIcon) {
      return;
    }
    this.isRotatingIcon = true;
    this.flightService.onSwapCity();
    this.isRotateIcon = !this.isRotateIcon; // ??????????????????
    this.doRefresh(true, false);
  }
  onRotateIconDone() {
    this.isRotatingIcon = false;
    console.log("onRotateIconDone");
  }
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
      const isSelf = await this.staffService.isSelfBookType();
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
        this.flightService.setFilterConditionSource(this.filterCondition);
        setTimeout(() => {
          this.activeTab = "none";
        }, 0);
      }
      this.vmFlights = [];
      this.isLoading = true;
      this.currentProcessStatus = "????????????????????????";
      this.apiService.showLoadingView({ msg: this.currentProcessStatus });
      this.oldSearchCities.fromCityCode =
        this.searchFlightModel &&
        this.searchFlightModel.fromCity &&
        this.searchFlightModel.fromCity.Code;
      this.oldSearchCities.toCityCode = this.searchFlightModel.toCity.Code;
      const flightJourneyList = await this.flightService.getFlightJourneyDetailListAsync(
        loadDataFromServer
      );
      // if (loadDataFromServer) {
      //   let segments = this.flightService.getTotalFlySegments();
      //   if (isSelf) {
      //     segments = this.filterSegmentsByGoArrivalTime(segments);
      //   }
      //   this.vmFlights = await this.translateLang(segments);
      //   this.currentProcessStatus = "??????????????????";
      //   await this.flightService.loadPolicyedFlightsAsync(flightJourneyList);
      // }
      this.hasDataSource.next(false);
      let segments = this.filterFlightSegments(
        this.flightService.getTotalFlySegments()
      );
      if (isSelf && this.searchFlightModel.tripType == TripType.returnTrip) {
        segments = this.filterSegmentsByGoArrivalTime(segments);
      }
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
  private filterSegmentsByGoArrivalTime(segments: FlightSegmentEntity[]) {
    let result = segments;
    const goInfo = this.flightService
      .getPassengerBookInfos()
      .find(
        (it) => it.bookInfo && it.bookInfo.tripType == TripType.departureTrip
      );
    const goFlight = goInfo && goInfo.bookInfo && goInfo.bookInfo.flightSegment;
    if (goFlight) {
      const arrivalTime = moment(goFlight.ArrivalTime).add(1, "hours");
      result = segments.filter(
        (it) => AppHelper.getDate(it.TakeoffTime).getTime() >= +arrivalTime
      );
    }
    return result;
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

  async onSelectPassenger() {
    const removeitem = new EventEmitter<
      PassengerBookInfo<IFlightSegmentInfo>
    >();
    const sub = removeitem.subscribe(async (info) => {
      const ok = await AppHelper.alert(
        LanguageHelper.getConfirmDeleteTip(),
        true,
        LanguageHelper.getConfirmTip(),
        LanguageHelper.getCancelTip()
      );
      if (ok) {
        this.flightService.removePassengerBookInfo(info, true);
      }
    });
    const m = await this.modalCtrl.create({
      component: SelectFlightPassengerComponent,
      componentProps: {
        isOpenPageAsModal: true,
        removeitem,
        forType: FlightHotelTrainType.Flight,
        bookInfos$: this.flightService.getPassengerBookInfoSource(),
      },
    });
    const oldBookInfos = this.flightService
      .getPassengerBookInfos()
      .map((it) => it.id);
    await m.present();
    await m.onDidDismiss();
    if (sub) {
      sub.unsubscribe();
    }
    const newBookInfos = this.flightService
      .getPassengerBookInfos()
      .map((it) => it.id);
    console.log(
      "old ",
      oldBookInfos.map((it) => it),
      "new ",
      newBookInfos.map((it) => it)
    );
    const isChange =
      oldBookInfos.length !== newBookInfos.length ||
      oldBookInfos.some((it) => !newBookInfos.find((n) => n == it)) ||
      newBookInfos.some((n) => !oldBookInfos.find((it) => it == n));
    if (isChange) {
      this.doRefresh(true, false);
    }
  }
  private async checkCabinsAndPolicy(fs: FlightSegmentEntity) {
    try {
      if (!fs.Cabins || !fs.Cabins.length) {
        await this.flightService.initFlightSegmentCabins(fs);
      }
      if (fs.Cabins && fs.Cabins.length) {
        if (
          this.flightService.getPassengerBookInfos().map((it) => it.passenger)
            .length
        ) {
          const p = await this.flightService.initFlightSegmentCabinsPolicy();
          return p && p.length > 0;
        }
      }
    } catch (e) {
      console.error(e);
      AppHelper.alert(e);
    }
    return fs && fs.Cabins && fs.Cabins.length > 0;
  }
  async goToFlightCabinsDetails(fs: FlightSegmentEntity) {
    try {
      const ok = await this.checkCabinsAndPolicy(fs);
      if (!ok) {
        if (!this.tmcService.isAgent) {
          AppHelper.alert("???????????????????????????");
          return;
        }
      }
      this.isCanLeave = true;
      await this.flightService.addOneBookInfoToSelfBookType();
      this.flightService.currentViewtFlightSegment = fs;
      this.lastPassengerIds = this.flightService
      .getPassengerBookInfos()
      .map((it) => it.passenger && it.passenger.Id);
      this.router.navigate([AppHelper.getRoutePath("flight-item-cabins")]);
    } catch (e) {
      console.error(e);
    }
  }
  onShowSelectedInfos() {
    this.isCanLeave = true;
    this.flightService.showSelectedBookInfosPage();
  }

  async selectFilterPolicyPasseger() {
    const popover = await this.popoverController.create({
      component: FilterPassengersPolicyComponent,
      componentProps: {
        bookInfos$: this.flightService.getPassengerBookInfoSource(),
      },
      translucent: true,
    });
    await popover.present();
    const d = await popover.onDidDismiss();
    const data = d.data as
      | PassengerBookInfo<IFlightSegmentInfo>
      | "isUnFilterPolicy";
    if (!data) {
      return;
    }
    this.flightService.setPassengerBookInfosSource(
      this.flightService.getPassengerBookInfos().map((it) => {
        it.isFilterPolicy =
          data != "isUnFilterPolicy"
            ? data.id == it.id && data.isFilterPolicy
            : false;
        return it;
      })
    );
    this.doRefresh(false, true);
  }
  async onSelectCity(isFrom: boolean) {
    if (this.flightService.getSearchFlightModel().isLocked) {
      return;
    }
    this.isCanLeave = true;
    const rs = await this.flightService.onSelectCity({isShowPage:false,isFrom:false});
    if (rs) {
      const s = this.searchFlightModel;
      if (rs.isDomestic) {
        const fromCity = isFrom ? rs.city : s.fromCity;
        const toCity = isFrom ? s.toCity : rs.city;
        this.flightService.setSearchFlightModelSource({
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
      this.flightService.getSearchFlightModelSource().subscribe((m) => {
        this.searchFlightModel = m;
      })
    );
  }
  async ngOnInit() {
    this.subscriptions.push(
      this.flightService
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
    const filterConditionSubscription = this.flightService
      .getFilterConditionSource()
      .subscribe((filterCondition) => {
        this.filterCondition = { ...filterCondition };
      });
    this.subscriptions.push(filterConditionSubscription);
  }
  private isStillOnCurrentPage() {
    return this.router.routerState.snapshot.url.includes("flight-list");
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
            const cbn = (this.cabintypePipe.transform(c.TypeName) || "")
              .replace("class", "")
              .trim();
            if (!this.filterCondition.cabins.find((a) => a.label == cbn)) {
              this.filterCondition.cabins.push({
                id: c.Type,
                label: cbn,
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
            label: this.langService.isEn ? s.Airline : s.AirlineName,
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
        langOpt: {
          NonStopOnly: "NonStop only",
          TakeTime: "Take off Time",
          Airlines: "Airlines",
          Departure: "Departure Airport",
          Arrival: "Arrival Airport",
          Aircraft: "Aircraft",
          Cabins: "Cabins",
          any: "All",
          all: "All",
          takeoff: "Take off",
          land: "Landing",
          morning: "A.M.",
          afternoon: "P.M.",
          Reset: "Reset",
          Determine: "Confirm",
        },
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
        this.flightService.setFilterConditionSource(filterCondition);
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
      const segments = this.flightService.sortByPrice(
        this.vmFlights,
        this.priceOrderL2H
      );
      this.renderFlightList(segments);
    }
    if (key === "time") {
      this.filterCondition.timeFromM2N = this.timeOrdM2N ? "am2pm" : "pm2am";
      this.filterCondition.priceFromL2H = "initial";
      const segments = this.flightService.sortByTime(
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
    // ???????????????????????????????????????
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
    result = this.flightService.filterByFromAirports(result);
    result = this.flightService.filterByToAirports(result);
    result = this.flightService.filterByAirportCompanies(result);
    result = this.flightService.filterByAirTypes(result);
    result = this.flightService.filterByCabins(result);
    result = this.flightService.filterByTakeOffTimeSpan(result);
    result = this.flightService.filterByFlightDirect(result);
    result = this.flightService.filterByIsAgreement(result);
    return result;
  }
  canDeactivate() {
    if (this.flightService.isShowingPage) {
      this.flightService.onSelectCity({isShowPage:false,isFrom:false});
      return false;
    }
    const s = this.flightService.getSearchFlightModel();
    if (s.isExchange) {
      if (this.isCanLeave) {
        return true;
      }
      return AppHelper.alert("?????????????????????", true, "???", "???");
    }
    return true;
  }
}
