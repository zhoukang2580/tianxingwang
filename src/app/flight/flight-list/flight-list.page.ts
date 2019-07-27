import { environment } from "src/environments/environment";
import { ApiService } from "src/app/services/api/api.service";
import { FlyFilterComponent } from "./../components/fly-filter/fly-filter.component";
import {
  FlightPolicy,
  SearchFlightModel,
  TripType,
  PassengerPolicyFlights
} from "./../flight.service";
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
  DomController
} from "@ionic/angular";
import {
  Observable,
  Subscription,
  fromEvent,
  Subject,
  BehaviorSubject,
  from,
  combineLatest
} from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  NgZone,
  ElementRef
} from "@angular/core";
import { tap, takeUntil, switchMap, delay, map, filter } from "rxjs/operators";
import * as moment from "moment";
import { FlydayService } from "../flyday.service";
import { DayModel } from "../../tmc/models/DayModel";
import { FlightService, Trafficline } from "../flight.service";
import { FlightSegmentEntity } from "../models/flight/FlightSegmentEntity";
import { FlightJourneyEntity } from "../models/flight/FlightJourneyEntity";
import { FlightCabinType } from "../models/flight/FlightCabinType";
import { LanguageHelper } from "src/app/languageHelper";
import { FilterConditionModel } from "../models/flight/advanced-search-cond/FilterConditionModel";
import { FlyDaysCalendarComponent } from "../components/fly-days-calendar/fly-days-calendar.component";
import { Storage } from "@ionic/storage";
import { SelectedFlightsegmentInfoComponent } from "../components/selected-flightsegment-info/selected-flightsegment-info.component";
import { SelectedPassengersPopoverComponent } from "../components/selected-passengers-popover/selected-passengers-popover.component";
import { NOT_WHITE_LIST } from "../select-passenger/select-passenger.page";
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
    trigger("showSelectFlyDayPage", [
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
  vmToCity: Trafficline;
  vmFromCity: Trafficline;
  filterConditionSubscription = Subscription.EMPTY;
  searchConditionSubscription = Subscription.EMPTY;
  selectPassengerSubscription = Subscription.EMPTY;
  selectDaySubscription = Subscription.EMPTY;
  vmFlightJourneyList: FlightJourneyEntity[];
  totalFilteredSegments: FlightSegmentEntity[];
  policyflights: PassengerPolicyFlights[];
  priceOrderL2H: boolean; // 价格从低到高
  timeOrdM2N: boolean; // 时间从早到晚
  loading = false;
  isFiltered = false;
  isLeavePage = false;
  st = 0;
  selectedPassengersNumbers$: Observable<number>;
  goAndBackFlightDateTime$: Observable<{
    goArrivalDateTime: string;
    backTakeOffDateTime: string;
  }>;
  @ViewChild(FlyFilterComponent) filterComp: FlyFilterComponent;
  @ViewChild(FlyDaysCalendarComponent)
  flyDaysCalendarComp: FlyDaysCalendarComponent;
  @ViewChild(IonRefresher) refresher: IonRefresher;
  activeTab: "filter" | "time" | "price" | "none"; // 当前激活的tab
  hasDataSource: Subject<boolean>;
  showAdvSearchPage$: Observable<boolean>;
  showSelectFlyDayPage$: Observable<boolean>;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private flightService: FlightService,
    private ngZone: NgZone,
    private flyDayService: FlydayService,
    private staffService: StaffService,
    private apiService: ApiService,
    private identityService: IdentityService,
    private domCtrl: DomController,
    private modalCtrl: ModalController,
    private popoverController: PopoverController
  ) {
    this.selectedPassengersNumbers$ = flightService
      .getPassengerBookInfoSource()
      .pipe(map(item => item.length));
    this.selectPassengerSubscription = this.flightService
      .getPassengerBookInfoSource()
      .subscribe(p => {
        if (p.length == 0) {
          if (this.isLeavePage) {
            return;
          }
          this.goToSelectPassengerPage();
        }
      });
    this.hasDataSource = new BehaviorSubject(false);
    this.vmFlights = [];
    this.flightJourneyList = [];
    this.searchFlightModel = new SearchFlightModel();
    this.goAndBackFlightDateTime$ = combineLatest([
      flightService.getPassengerBookInfoSource(),
      from(staffService.getStaff()),
      from(staffService.isStaffTypeSelf())
    ]).pipe(
      filter(([_, staff, isSelfBookType]) => isSelfBookType),
      map(([arr1, staff]) =>
        arr1.find(item => item.passenger.AccountId == staff.AccountId)
      ),
      filter(
        item =>
          !!item &&
          !!item.flightSegmentInfo &&
          !!item.flightSegmentInfo.flightSegment
      ),
      map(res => {
        return {
          goArrivalDateTime:
            res.flightSegmentInfo.tripType == TripType.departureTrip
              ? moment(res.flightSegmentInfo.flightSegment.TakeoffTime).format(
                  "YYYY-MM-DD HH:mm"
                )
              : "",
          backTakeOffDateTime:
            res.flightSegmentInfo.tripType == TripType.returnTrip
              ? moment(res.flightSegmentInfo.flightSegment.TakeoffTime).format(
                  "YYYY-MM-DD HH:mm"
                )
              : ""
        };
      })
    );
    this.route.queryParamMap.subscribe(async () => {
      const identity = await this.identityService.getIdentityAsync();
      this.showAddPassenger =
        (identity && identity.Numbers && identity.Numbers.AgentId) ||
        (await this.staffService.getStaff()).BookType != StaffBookType.Self;
      if (this.searchConditionSubscription) {
        this.searchConditionSubscription.unsubscribe();
      }
      this.searchConditionSubscription = this.flightService
        .getSearchFlightModelSource()
        .subscribe(s => {
          console.log("flight-list page getSearchFlightModelSource", s);
          this.searchFlightModel = s;
          if (this.searchFlightModel) {
            // this.isRoundTrip = this.searchFlightModel.IsRoundTrip;
            this.vmFromCity = this.searchFlightModel.fromCity;
            this.vmToCity = this.searchFlightModel.toCity;
            this.moveDayToSearchDate(
              this.flyDayService.generateDayModelByDate(
                this.searchFlightModel.Date
              )
            );
          }
        });
      this.isLeavePage = false;
      this.flightService.setFilterPanelShow(false);
      console.log("this.route.queryParamMap", this.searchFlightModel);
      if (this.searchFlightModel && this.searchFlightModel.Date) {
        this.doRefresh(true, true);
      }
    });
    this.showAdvSearchPage$ = this.flightService.getFilterPanelShow();
  }
  async isStaffTypeSelf() {
    return await this.staffService.isStaffTypeSelf();
  }
  onCalenderClick() {
    this.flyDayService.setFlyDayMulti(false);
    this.flyDayService.showSelectFlyDatePage(true);
  }

  back() {
    this.isLeavePage = true;
  }
  async onChangedDay(day: DayModel, byUser: boolean) {
    if (
      byUser &&
      !this.isLeavePage &&
      (!day || this.searchFlightModel.Date == day.date || this.loading)
    ) {
      return;
    }
    if (this.searchFlightModel.tripType == TripType.returnTrip) {
      const bookInfos = this.flightService.getPassengerBookInfos();
      const info = bookInfos.find(
        item =>
          item &&
          item.flightSegmentInfo &&
          item.flightSegmentInfo.tripType == TripType.departureTrip
      );
      const goFlight = info && info.flightSegmentInfo.flightSegment;
      if (goFlight) {
        let goDay = moment(goFlight.ArrivalTime);
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
      if (this.searchFlightModel.IsRoundTrip) {
        if (+moment(day.date) > +moment(this.searchFlightModel.BackDate)) {
          this.searchFlightModel.BackDate = moment(day.date)
            .add(1, "days")
            .format("YYYY-MM-DD");
        }
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
  goToSelectPassengerPage() {
    this.router.navigate([AppHelper.getRoutePath("select-passenger")]);
  }
  async doRefresh(
    loadDataFromServer: boolean,
    keepSearchCondition: boolean,
    passengerId?: string,
    filterPolicy?: boolean
  ) {
    try {
      if (this.isLeavePage || this.loading) {
        return;
      }
      this.moveDayToSearchDate();
      this.apiService.showLoadingView();
      // 如果不是个人，则必须先选择一个客户
      if (
        !this.isStaffTypeSelf() &&
        this.flightService.getPassengerBookInfos().length === 0
      ) {
        this.goToSelectPassengerPage();
        return;
      }
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
      this.loading = true;
      let data = JSON.parse(JSON.stringify(this.flightJourneyList));
      this.hasDataSource.next(false);
      if (loadDataFromServer) {
        // 强制从服务器端返回新数据
        data = await this.loadPolicyedFlightsAsync(passengerId);
      }
      // 根据筛选条件过滤航班信息：
      const filteredFlightJourenyList = this.filterFlightJourneyList(data);
      this.isFiltered =
        this.filterComp &&
        Object.keys(this.filterComp.userOps).some(
          k => this.filterComp.userOps[k]
        );
      let segments = this.flightService.getTotalFlySegments(
        filteredFlightJourenyList
      );
      if (filterPolicy) {
        segments = segments.filter(s =>
          s.PoliciedCabins.some(pc => pc.Rules.length == 0)
        );
        if (segments.length == 0) {
          if (`${passengerId}`.toLowerCase().includes(NOT_WHITE_LIST)) {
            // 非白名单的是可以选择所有的航班
            segments = this.flightService.getTotalFlySegments(
              filteredFlightJourenyList
            );
          }
        }
      }
      this.st = Date.now();
      this.vmFlights = segments;
      await this.renderFlightList2(segments);
      this.hasDataSource.next(!!this.vmFlights.length && !this.loading);
      if (this.refresher) {
        this.refresher.complete();
      }
      this.apiService.hideLoadingView();
      this.loading = false;
    } catch (e) {
      if (!environment.production) {
        console.error(e);
      }
      this.loading = false;
    }
  }
  private scrollToTop() {
    setTimeout(() => {
      if (this.cnt) {
        this.cnt.scrollToTop(100);
      }
    }, 100);
  }
  private async loadPolicyedFlightsAsync(
    passengerId?: string
  ): Promise<FlightJourneyEntity[]> {
    // 先获取最新的数据
    let flightJourneyList = await this.flightService.getFlightJourneyDetailListAsync(
      this.searchFlightModel
    );
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
      .find(item => item.isReselect);
    if (hasreselect) {
      if (
        !passengers.find(p => p.AccountId == hasreselect.passenger.AccountId)
      ) {
        passengers.push(hasreselect.passenger);
      }
    }
    const hasNotWhitelist = passengers.find(p => p.isNotWhiteList);
    if (hasNotWhitelist) {
      let policyflights = [];
      const ps = passengers.filter(p => !p.isNotWhiteList);
      if (ps.length > 0) {
        policyflights = await this.flightService.getPolicyflightsAsync(
          flightJourneyList,
          passengerId ? [passengerId] : passengers.map(p => p.AccountId)
        );
      }
      const notWhitelistPolicyflights = this.getNotWhitelistCabins(
        flightJourneyList
      );
      this.policyflights = policyflights.concat(notWhitelistPolicyflights);
      console.log(this.policyflights);
    } else {
      this.policyflights = await this.flightService.getPolicyflightsAsync(
        flightJourneyList,
        passengerId ? [passengerId] : passengers.map(p => p.AccountId)
      );
    }
    if (this.policyflights.length === 0) {
      flightJourneyList = [];
      this.policyflights = [];
      return [];
    }
    if (passengerId || (await this.isStaffTypeSelf())) {
      flightJourneyList = this.replaceCabinInfo(
        this.policyflights,
        flightJourneyList
      );
    }
    return (this.flightJourneyList = flightJourneyList);
  }
  private getNotWhitelistCabins(
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
      PassengerKey: "0",
      FlightPolicies
    };
  }
  onSelectPassenger() {
    this.router.navigate([AppHelper.getRoutePath("select-passenger")]);
  }
  private getUnSelectFlightSegmentPassengers() {
    return this.flightService
      .getPassengerBookInfos()
      .filter(
        item =>
          !item.flightSegmentInfo ||
          !item.flightSegmentInfo.flightSegment ||
          !item.flightSegmentInfo.flightPolicy
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
    this.isLeavePage = true;
  }
  async showSelectedInfos() {
    const modal = await this.modalCtrl.create({
      component: SelectedFlightsegmentInfoComponent
    });
    await modal.present();
    await modal.onDidDismiss();
    return "ok";
  }
  private replaceCabinInfo(
    passengerPolicyflights: {
      PassengerKey: string;
      FlightPolicies: FlightPolicy[];
    }[],
    flights: FlightJourneyEntity[]
  ) {
    console.time("replaceCabinInfo");
    if (passengerPolicyflights && flights) {
      const passengerKeyFlightNoCabins = passengerPolicyflights.map(pf => {
        return {
          PassengerKey: pf.PassengerKey,
          FlightPolicy: pf.FlightPolicies.reduce(
            (obj, item) => {
              if (!obj[item.FlightNo]) {
                obj[item.FlightNo] = [item];
              } else {
                obj[item.FlightNo].push(item);
              }
              return obj;
            },
            {} as { [key: string]: FlightPolicy[] }
          )
        };
      });
      flights.forEach(f => {
        f.FlightRoutes.forEach(r => {
          r.FlightSegments.forEach(s => {
            passengerKeyFlightNoCabins.forEach(item => {
              s.PassengerKeys = s.PassengerKeys || [];
              if (!s.PassengerKeys.find(k => k == item.PassengerKey)) {
                s.PassengerKeys.push(item.PassengerKey);
              }
              if (item.FlightPolicy[s.Number]) {
                s.PoliciedCabins = item.FlightPolicy[s.Number];
                s.PoliciedCabins.forEach(pc => {
                  const sc = s.Cabins.find(
                    scabin => scabin.Code == pc.CabinCode
                  );
                  if (sc) {
                    pc.Cabin = sc;
                  }
                });
              }
            });
          });
        });
      });
      console.timeEnd("replaceCabinInfo");
    }
    return flights;
  }
  async filterPolicyFlights() {
    const popover = await this.popoverController.create({
      component: SelectedPassengersPopoverComponent,
      translucent: true
      // backdropDismiss: false
    });
    await popover.present();
    const d = await popover.onDidDismiss();
    if (d && d.data) {
      this.doRefresh(true, false, d.data, true);
    } else {
      this.doRefresh(true, false);
    }
  }
  async ngOnInit() {
    // this.goToSelectPassengerPage();
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
    this.selectDaySubscription = this.flyDayService
      .getSelectedFlyDays()
      .subscribe(async days => {
        if (days && days.length == 1) {
          console.log("选择的日期", days);
          const day = days[0];
          if (!day) {
            return;
          }
          if (this.searchFlightModel.Date != day.date) {
            this.searchFlightModel.Date = day.date;
            this.moveDayToSearchDate();
          }
          this.searchFlightModel.Date = day.date;
          if (this.loading && this.isLeavePage) {
            return;
          }
          console.log(
            `isLeavePage,${this.isLeavePage},cur route url = ${
              this.router.routerState.snapshot.url
            }`
          );
          if (
            this.isLeavePage ||
            !this.router.routerState.snapshot.url.includes("flight-list")
          ) {
            console.log("当前路由不在航班列表页面");
            return;
          }
          this.doRefresh(true, false);
        }
      });
  }
  ngOnDestroy() {
    this.vmFlights = [];
    this.selectDaySubscription.unsubscribe();
    this.filterConditionSubscription.unsubscribe();
    this.selectPassengerSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    this.apiService.showLoadingView();
    if (this.searchFlightModel && this.searchFlightModel.Date) {
      this.moveDayToSearchDate();
    }
    // console.dir(this.cnt);

    // this.controlFooterShowHide();
  }
  private moveDayToSearchDate(d?: DayModel) {
    this.domCtrl.write(_ => {
      if (this.flyDaysCalendarComp) {
        const day =
          d ||
          this.flyDayService.generateDayModelByDate(
            this.searchFlightModel.Date
          );
        setTimeout(() => {
          if (this.flyDaysCalendarComp) {
            this.flyDaysCalendarComp.onDaySelected(day);
          }
        }, 1000);
      }
    });
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
                  this.ngZone.run(() => {});
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
    this.loading = true;
    this.activeTab = "time";
    this.timeOrdM2N = !this.timeOrdM2N;
    await this.sortFlights("time");
    this.loading = false;
    console.timeEnd("time");
  }
  async onPriceOrder() {
    console.time("price");
    this.loading = true;
    this.activeTab = "price";
    this.priceOrderL2H = !this.priceOrderL2H;
    await this.sortFlights("price");
    this.loading = false;
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
      const segments = await this.flightService.sortByPrice(
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
        this.renderFlightList2(segments);
      }
      // this.renderFlightList2(segments);
      this.scrollToTop();
    }
    if (key === "time") {
      this.filterCondition.timeFromM2N = this.timeOrdM2N ? "am2pm" : "pm2am";
      this.filterCondition.priceFromL2H = "initial";
      const segments = await this.flightService.sortByTime(
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
        this.renderFlightList2(segments);
      }
      this.scrollToTop();
    }
  }

  private async renderFlightList2(fs: FlightSegmentEntity[]) {
    console.time("renderFlightList2");
    this.loading = true;
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
                  ? `|<span class='code-share-number'>共享${
                      s.CodeShareNumber
                    }</span>`
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
