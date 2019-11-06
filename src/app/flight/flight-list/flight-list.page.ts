import { SelectFlightPassengerComponent } from "./../components/select-flight-passenger/select-flight-passenger.component";
import { IFlightSegmentInfo } from "./../models/PassengerFlightInfo";
import { PassengerBookInfo } from "./../../tmc/tmc.service";
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
  ViewChildren
} from "@angular/core";
import {
  tap,
  takeUntil,
  switchMap,
  delay,
  map,
  filter,
  reduce
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
    ])
  ]
})
export class FlightListPage implements OnInit, AfterViewInit, OnDestroy {
  private refMap = new WeakMap<FlightSegmentEntity, any>();
  searchFlightModel: SearchFlightModel;
  filterCondition: FilterConditionModel;
  showAddPassenger = false;
  @ViewChild("cnt") cnt: IonContent;
  @ViewChild("list") list: ElementRef<HTMLElement>;
  flightJourneyList: FlightJourneyEntity[]; // 保持和后台返回的数据一致
  vmFlights: FlightSegmentEntity[]; // 用于视图展示
  vmToCity: TrafficlineEntity;
  vmFromCity: TrafficlineEntity;
  filterConditionSubscription = Subscription.EMPTY;
  searchConditionSubscription = Subscription.EMPTY;
  selectPassengerSubscription = Subscription.EMPTY;
  selectDaySubscription = Subscription.EMPTY;
  vmFlightJourneyList: FlightJourneyEntity[];
  totalFilteredSegments: FlightSegmentEntity[];
  policyflights: PassengerPolicyFlights[];
  priceOrderL2H: boolean; // 价格从低到高
  timeOrdM2N: boolean; // 时间从早到晚
  isLoading = false;
  isFiltered = false;
  isSelfBookType = true;
  currentProcessStatus = "正在获取航班列表";
  st = 0;
  timeoutid: any;
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
    this.flightJourneyList = [];
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
    this.route.queryParamMap.subscribe(async () => {
      this.showAddPassenger = await this.canShowAddPassenger();
      this.flightService.setFilterPanelShow(false);
      await this.initSearchModelParams();
      console.log("this.route.queryParamMap", this.searchFlightModel);
    });
    this.showAdvSearchPage$ = this.flightService.getFilterPanelShow();
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
  async isStaffTypeSelf() {
    return await this.staffService.isSelfBookType();
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
    const staff = await this.staffService.getStaff();
    const s = this.flightService.getSearchFlightModel();
    if (s.isRoundTrip) {
      if (s.tripType == TripType.departureTrip) {
        await this.storage.set(`last_selected_flight_goDate_${staff && staff.AccountId}`, day.date);
      } else {
        await this.storage.set(`last_selected_flight_backDate_${staff && staff.AccountId}`, day.date);
      }
    } else {
      await this.storage.set(`last_selected_flight_goDate_${staff && staff.AccountId}`, day.date);
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
  async doRefresh(loadDataFromServer: boolean, keepSearchCondition: boolean) {
    if (this.timeoutid) {
      clearTimeout(this.timeoutid);
    }
    this.timeoutid = setTimeout(async () => {
      try {
        if (this.isLoading) {
          return;
        }
        this.isLoading = true;
        this.flyDayService.setSelectedDaysSource([this.flyDayService.generateDayModelByDate(this.searchFlightModel.Date)]);
        // this.moveDayToSearchDate();

        if (this.list) {
          this.list.nativeElement.innerHTML = "";
        }
        if (this.refresher) {
          this.refresher.complete();
          this.refresher.disabled = true;
          setTimeout(() => {
            this.refresher.disabled = false;
          }, 100);
        }
        this.apiService.showLoadingView();
        if (!keepSearchCondition) {
          if (this.filterComp) {
            this.filterComp.onReset();
          }
          this.filterCondition = FilterConditionModel.init();
          setTimeout(() => {
            this.activeTab = "none";
          }, 0);
        }
        this.vmFlights = [];
        this.isLoading = true;
        if (
          !this.flightJourneyList ||
          !this.flightJourneyList.length ||
          loadDataFromServer
        ) {
          this.currentProcessStatus = "正在获取航班列表";
          this.flightJourneyList = await this.flightService.getFlightJourneyDetailListAsync();
          if (this.flightJourneyList && this.flightJourneyList.length) {
            await this.renderFlightList(
              this.flightService.getTotalFlySegments(this.flightJourneyList)
            );
          }
        }
        let data = JSON.parse(JSON.stringify(this.flightJourneyList));
        this.hasDataSource.next(false);
        if (loadDataFromServer) {
          // 强制从服务器端返回新数据
          data = await this.loadPolicyedFlightsAsync(this.flightJourneyList);
        }
        // 根据筛选条件过滤航班信息：
        const filteredFlightJourenyList = this.filterFlightJourneyList(data);
        this.isFiltered =
          this.filterComp &&
          Object.keys(this.filterComp.userOps).some(
            k => this.filterComp.userOps[k]
          );
        const segments = this.flightService.filterPassengerPolicyFlights(
          null,
          filteredFlightJourenyList,
          this.policyflights
        );
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
    }, 0);
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
  private async loadPolicyedFlightsAsync(
    flightJourneyList: FlightJourneyEntity[]
  ): Promise<FlightJourneyEntity[]> {
    this.currentProcessStatus = "正在计算差标";
    this.policyflights = [];
    if (flightJourneyList.length == 0) {
      return [];
    }
    let passengers = this.getUnSelectFlightSegmentPassengers();
    if (passengers.length == 0) {
      passengers = this.flightService
        .getPassengerBookInfos()
        .map(info => info.passenger);
    }
    const hasreselect = this.flightService
      .getPassengerBookInfos()
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
      let policyflights = [];
      // 白名单的乘客
      const ps = passengers.filter(p => !p.isNotWhiteList);
      if (ps.length > 0) {
        policyflights = await this.flightService.getPolicyflightsAsync(
          flightJourneyList,
          ps.map(p => p.AccountId)
        );
      }
      // 非白名单可以预订所有的仓位

      const notWhitelistPolicyflights = this.getNotWhitelistCabins(
        hasNotWhitelist.AccountId,
        flightJourneyList
      );
      this.policyflights = policyflights.concat(notWhitelistPolicyflights);
      console.log(this.policyflights);
    } else {
      if (whitelist.length) {
        this.policyflights = await this.flightService.getPolicyflightsAsync(
          flightJourneyList,
          whitelist
        );
      }
    }
    if (
      this.policyflights &&
      this.policyflights.length === 0 &&
      whitelist.length
    ) {
      flightJourneyList = [];
      this.policyflights = [];
      return [];
    }
    // const arr = passengers.map(it => {
    //   const plicies = this.policyflights.find(
    //     item => item.PassengerKey == it.AccountId
    //   );
    //   return {
    //     PassengerKey: it.AccountId,
    //     FlightPolicies: (plicies && plicies.FlightPolicies) || []
    //   };
    // });
    // this.replaceCabinInfo(arr, flightJourneyList);
    return (this.flightJourneyList = flightJourneyList);
  }
  private getNotWhitelistCabins(
    passengerKey: string,
    flightJ: FlightJourneyEntity[]
  ): {
    PassengerKey: string;
    FlightPolicies: FlightPolicy[];
  } {
    const FlightPolicies: FlightPolicy[] = [];
    flightJ.forEach(item => {
      item.FlightRoutes.forEach(r => {
        r.FlightSegments.forEach(s => {
          s.Cabins.forEach(c => {
            FlightPolicies.push({
              Cabin: c,
              Id: c.Id,
              FlightNo: c.FlightNumber,
              CabinCode: c.Code,
              IsAllowBook: true, // 非白名单全部可预订
              Discount: c.Discount,
              LowerSegment: null,
              Rules: []
            });
          });
        });
      });
    });
    return {
      PassengerKey: passengerKey, // 非白名单的账号id 统一为一个，tmc的accountid
      FlightPolicies
    };
  }
  async onSelectPassenger() {
    const m = await this.modalCtrl.create({
      component: SelectFlightPassengerComponent,
      componentProps: {
        isOpenPageAsModal: true
      }
    });
    const oldBookInfos = this.flightService
      .getPassengerBookInfos()
      .map(it => it.id);
    await m.present();
    await m.onDidDismiss();
    const newBookInfos = this.flightService
      .getPassengerBookInfos()
      .map(it => it.id);
    console.log(oldBookInfos.map(it => it), "new ", newBookInfos.map(it => it));
    const isChange =
      oldBookInfos.length !== newBookInfos.length ||
      oldBookInfos.some(it => !newBookInfos.find(n => n == it)) ||
      newBookInfos.some(n => !oldBookInfos.find(it => it == n));
    if (isChange) {
      this.doRefresh(true, false);
    }
  }
  private getUnSelectFlightSegmentPassengers() {
    return this.flightService
      .getPassengerBookInfos()
      .filter(
        item =>
          !item.bookInfo ||
          !item.bookInfo.flightSegment ||
          !item.bookInfo.flightPolicy
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
    this.flightService.setCurrentViewtFlightSegment(
      fs,
      this.flightService.getTotalFlySegments(this.flightJourneyList),
      this.policyflights
    );
    this.router.navigate([AppHelper.getRoutePath("flight-item-cabins")]);

    this.searchConditionSubscription.unsubscribe();
  }
  private async showSelectedInfos() {
    const modal = await this.modalCtrl.create({
      component: SelectedFlightsegmentInfoComponent
    });
    await this.flightService.dismissAllTopOverlays();
    await modal.present();
    await modal.onDidDismiss();
    return "ok";
  }
  // private replaceCabinInfo(
  //   passengerPolicyflights: {
  //     PassengerKey: string;
  //     FlightPolicies: FlightPolicy[];
  //   }[],
  //   flights: FlightJourneyEntity[]
  // ) {
  //   console.time("replaceCabinInfo");
  //   if (passengerPolicyflights && flights) {
  //     const passengerKeyFlightNoCabins = passengerPolicyflights.map(pf => {
  //       return {
  //         PassengerKey: pf.PassengerKey,
  //         FlightPolicy: pf.FlightPolicies.reduce(
  //           (obj, item) => {
  //             if (!obj[item.FlightNo]) {
  //               obj[item.FlightNo] = [item];
  //             } else {
  //               obj[item.FlightNo].push(item);
  //             }
  //             return obj;
  //           },
  //           {} as { [FlightNo: string]: FlightPolicy[] }
  //         )
  //       };
  //     });
  //     debugger;
  //     flights.forEach(f => {
  //       f.FlightRoutes.forEach(r => {
  //         r.FlightSegments.forEach(flightSegment => {
  //           passengerKeyFlightNoCabins.forEach(item => {
  //             flightSegment.PassengerKeys = flightSegment.PassengerKeys || [];
  //             if (!flightSegment.PassengerKeys.find(k => k == item.PassengerKey)) {
  //               flightSegment.PassengerKeys.push(item.PassengerKey);
  //             }
  //             if (item.FlightPolicy[flightSegment.Number]) {
  //               flightSegment.PoliciedCabins = item.FlightPolicy[flightSegment.Number];
  //               flightSegment.PoliciedCabins.forEach(pc => {
  //                 const sc = flightSegment.Cabins.find(
  //                   scabin => scabin.Id == (pc.Cabin && pc.Cabin.Id) && pc.FlightNo == flightSegment.Number
  //                 );
  //                 console.log(`flightSegment.Cabins`,flightSegment.Cabins,'sc', sc, 'pccabin', pc);
  //                 if (sc) {
  //                   pc.Cabin = sc;
  //                 }
  //               });
  //             }
  //           });
  //         });
  //       });
  //     });
  //     console.timeEnd("replaceCabinInfo");
  //   }
  //   return flights;
  // }
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
    this.filterPassengerPolicyFlights(data);
  }
  private async filterPassengerPolicyFlights(
    bookInfo: PassengerBookInfo<IFlightSegmentInfo>
  ) {
    this.st = Date.now();
    this.vmFlights = this.flightService.filterPassengerPolicyFlights(
      bookInfo,
      this.flightJourneyList,
      this.policyflights
    );
    await this.renderFlightList(this.vmFlights);
    this.hasDataSource.next(!!this.vmFlights.length && !this.isLoading);
    this.apiService.hideLoadingView();
    this.isLoading = false;
  }
  private async initSearchModelParams() {
    this.searchFlightModel = this.flightService.getSearchFlightModel();
    this.isSelfBookType = await this.staffService.isSelfBookType();
    if (this.searchFlightModel) {
      // this.isRoundTrip = this.searchFlightModel.IsRoundTrip;
      this.vmFromCity = this.searchFlightModel.fromCity;
      this.vmToCity = this.searchFlightModel.toCity;
      if (this.searchFlightModel.isRefreshData) {
        this.flightService.setSearchFlightModel({
          ...this.searchFlightModel,
          isRefreshData: false
        });
        this.doRefresh(true, false);
      }
    }
  }
  async ngOnInit() {
    this.filteredPolicyPassenger$ = this.flightService
      .getPassengerBookInfoSource()
      .pipe(map(infos => infos.find(it => it.isFilteredPolicy)));
    this.activeTab = "filter";
    this.filterConditionSubscription = this.flightService
      .getFilterCondition()
      .subscribe(filterCondition => {
        console.log("高阶查询", filterCondition);
        this.filterCondition = filterCondition;
        if (this.filterCondition) {
          // this.filterFlightJourneyList();
          this.doRefresh(false, true);
        }
      });
    // this.selectDaySubscription = this.flyDayService
    //   .getSelectedDays()
    //   .subscribe(async days => {
    //     if (days && days.length == 1) {
    //       console.log("选择的日期", days);
    //       const day = days[0];
    //       if (!day) {
    //         return;
    //       }
    //       if (this.searchFlightModel.Date != day.date) {
    //         this.searchFlightModel.Date = day.date;
    //         // this.moveDayToSearchDate();
    //       }
    //       this.searchFlightModel.Date = day.date;
    //       if (this.notCurrentPage()) {
    //         console.log("当前路由不在航班列表页面");
    //         return;
    //       }
    //       this.doRefresh(true, false);
    //     }
    //   });
    await this.initSearchModelParams();
    this.doRefresh(true, true);
  }
  private notCurrentPage() {
    return !this.router.routerState.snapshot.url.includes("flight-list");
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
  }

  ngAfterViewInit() {
    // if (this.searchFlightModel && this.searchFlightModel.Date) {
    //   this.moveDayToSearchDate();
    // }
    // console.dir(this.cnt);

    // this.controlFooterShowHide();
  }
  controlFooterShowHide() {
    const cnt = document.querySelector("ion-content");
    fromEvent(cnt, "touchmove")
      .pipe(
        switchMap(() =>
          this.cnt.ionScroll.pipe(
            delay(0),
            takeUntil(
              this.cnt.ionScrollEnd.pipe(
                tap(() => {
                  console.log("滚动停止");
                  this.ngZone.run(() => { });
                })
              )
            )
          )
        )
      )
      .subscribe(() => {
        this.ngZone.run(() => {
          console.log("正在滚动");
        });
      });
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
      this.scrollToTop();
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
      this.scrollToTop();
    }
  }

  private async renderFlightList(fs: FlightSegmentEntity[]) {
    console.time("renderFlightList2");
    this.isLoading = true;
    const segments = fs.map(s => {
      const template = `<div class='left'>
          <h4 class="time">
    <strong>${s.TakeoffShortTime}</strong>
              <span class="line">-----&nbsp;${
        s.IsStop ? `经停` : `直飞`
        }&nbsp;-----</span>
              <strong>${s.ArrivalShortTime}
                ${
        s.AddOneDayTip
          ? `<span class='addoneday'>${s.AddOneDayTip}</span>`
          : ``
        }
              </strong>
          </h4>
          <div class="airports">
              <span>${s.FromAirportName}${
        s.FromTerminal ? `(${s.FromTerminal})` : ``
        }</span>
              <span>${s.ToAirportName}${
        s.ToTerminal ? `(${s.ToTerminal})` : ``
        }</span>
          </div>
          <div class="desc">
              <img src="${s.AirlineSrc}" class="airlinesrc">
              <label>${s.AirlineName}</label>
              <label>|${s.Number}</label>
              <label>|${s.PlaneType}</label>
              ${
        s.CodeShareNumber
          ? `|<span class='code-share-number'>共享${s.CodeShareNumber}</span>`
          : ``
        }
          </div>
      </div>
      <div class="price">
          ￥${s.LowestFare}
      </div>`;
      return {
        item: s,
        templateHtmlString: template
      };
    });
    //  segments = await this.flightService.getHtmlTemplate(fs, "");
    // console.log("getHtmlTemplate", segments);
    if (this.list) {
      this.list.nativeElement.innerHTML = "";
    }
    this.refMap = new WeakMap<FlightSegmentEntity, any>();
    segments.forEach(s => {
      const li = document.createElement("li");
      li.onclick = () => {
        this.goToFlightCabinsDetails(s.item);
      };
      li.classList.add("list-item");
      li.innerHTML = s.templateHtmlString;
      this.refMap.set(s.item, li);
      if (this.list) {
        this.list.nativeElement.appendChild(li);
      }
    });
    this.scrollToTop();
    console.timeEnd("renderFlightList2");
  }
  private filterFlightJourneyList(flys: FlightJourneyEntity[]) {
    console.log(
      "filterFlightJourneyList",
      this.filterCondition,
      "flights",
      flys
    );
    let result = flys;
    if (!this.filterCondition) {
      return result;
    }
    result = this.filterByFlightDirect(result);
    result = this.filterByFromAirports(result);
    result = this.filterByToAirports(result);
    result = this.filterByAirportCompanies(result);
    result = this.filterByAirTypes(result);
    result = this.filterByCabins(result);
    result = this.filterByTakeOffTimeSpan(result);
    return result;
  }
  private filterByFlightDirect(flys: FlightJourneyEntity[]) {
    let result = flys;
    if (this.filterCondition.onlyDirect) {
      result = result.map(f => {
        f.FlightRoutes = f.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s => !s.IsStop);
          return r;
        });
        return f;
      });
    }
    return result;
  }
  private filterByFromAirports(
    flys: FlightJourneyEntity[]
  ): FlightJourneyEntity[] {
    let result = flys;
    if (
      this.filterCondition.fromAirports &&
      this.filterCondition.fromAirports.length
    ) {
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s =>
            this.filterCondition.fromAirports.some(a => a.id === s.FromAirport)
          );
          return r;
        });
        return fly;
      });
    }
    return result;
  }
  private filterByToAirports(
    flys: FlightJourneyEntity[]
  ): FlightJourneyEntity[] {
    let result = flys;
    if (
      this.filterCondition.toAirports &&
      this.filterCondition.toAirports.length
    ) {
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s =>
            this.filterCondition.toAirports.some(a => a.id === s.ToAirport)
          );
          return r;
        });
        return fly;
      });
    }
    return result;
  }
  private filterByAirportCompanies(
    flys: FlightJourneyEntity[]
  ): FlightJourneyEntity[] {
    let result = flys;
    if (
      this.filterCondition.airCompanies &&
      this.filterCondition.airCompanies.length > 0
    ) {
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s =>
            this.filterCondition.airCompanies.some(a => a.id === s.Airline)
          );
          return r;
        });
        return fly;
      });
    }
    return result;
  }
  private filterByAirTypes(flys: FlightJourneyEntity[]): FlightJourneyEntity[] {
    let result = flys;
    if (
      this.filterCondition.airTypes &&
      this.filterCondition.airTypes.length > 0
    ) {
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s =>
            this.filterCondition.airTypes.some(a => a.id === s.PlaneType)
          );
          return r;
        });
        return fly;
      });
    }
    return result;
  }
  private filterByCabins(flys: FlightJourneyEntity[]): FlightJourneyEntity[] {
    let result = flys;
    if (this.filterCondition.cabins && this.filterCondition.cabins.length > 0) {
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s =>
            this.filterCondition.cabins.some(
              a => FlightCabinType[a.id] === s.LowestCabinType
            )
          );
          return r;
        });
        return fly;
      });
    }
    return result;
  }
  private filterByTakeOffTimeSpan(
    flys: FlightJourneyEntity[]
  ): FlightJourneyEntity[] {
    let result = flys;
    if (this.filterCondition.takeOffTimeSpan) {
      // console.log(this.filterCondition.takeOffTimeSpan);
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s => {
            // console.log(moment(s.TakeoffTime).hour());
            return (
              this.filterCondition.takeOffTimeSpan.lower <=
              moment(s.TakeoffTime, "YYYY-MM-DDTHH:mm:ss").hour() &&
              (moment(s.TakeoffTime, "YYYY-MM-DDTHH:mm:ss").hour() <
                this.filterCondition.takeOffTimeSpan.upper ||
                (moment(s.TakeoffTime, "YYYY-MM-DDTHH:mm:ss").hour() ==
                  this.filterCondition.takeOffTimeSpan.upper &&
                  moment(s.TakeoffTime, "YYYY-MM-DDTHH:mm:ss").minutes() == 0))
            );
          });
          return r;
        });
        return fly;
      });
    }
    return result;
  }
}
