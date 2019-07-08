import { ApiService } from "src/app/services/api/api.service";
import { FlyFilterComponent } from "./../components/fly-filter/fly-filter.component";
import { FlightPolicy, Passenger } from "./../flight.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import { IdentityEntity } from "./../../services/identity/identity.entity";
import { StaffBookType } from "./../../tmc/models/StaffBookType";
import { HrService, StaffEntity } from "./../../hr/hr.service";
import { AppHelper } from "src/app/appHelper";
import { animate } from "@angular/animations";
import { trigger, state, style, transition } from "@angular/animations";
import {
  IonContent,
  IonRefresher,
  IonInfiniteScroll,
  DomController
} from "@ionic/angular";
import {
  Observable,
  Subscription,
  of,
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
  NgZone
} from "@angular/core";
import { tap, takeUntil, switchMap, delay } from "rxjs/operators";
import * as moment from "moment";
import { FlydayService } from "../flyday.service";
import { SearchFlightModel } from "../models/flight/SearchFlightModel";
import { DayModel } from "../models/DayModel";
import { FlightService, Trafficline } from "../flight.service";
import { FlightSegmentEntity } from "../models/flight/FlightSegmentEntity";
import { FlightJourneyEntity } from "../models/flight/FlightJourneyEntity";
import { FlightCabinType } from "../models/flight/FlightCabinType";
import { FlightCabinEntity } from "../models/flight/FlightCabinEntity";
import { LanguageHelper } from "src/app/languageHelper";
import { FilterConditionModel } from "../models/flight/advanced-search-cond/FilterConditionModel";
import { FlyDaysCalendarComponent } from "../components/fly-days-calendar/fly-days-calendar.component";
import { SelectDateService } from "../select-date/select-date.service";
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
  searchFlightCondition: SearchFlightModel;
  filterCondition: FilterConditionModel;
  @ViewChild("cnt") cnt: IonContent;
  flightJourneyList: FlightJourneyEntity[]; // 保持和后台返回的数据一致
  vmFlights: FlightSegmentEntity[]; // 用于视图展示
  vmToCity: Trafficline;
  vmFromCity: Trafficline;
  filterConditionSubscription = Subscription.EMPTY;
  selectDaySubscription = Subscription.EMPTY;
  vmFlightJourneyList: FlightJourneyEntity[];
  totalFilteredSegments: FlightSegmentEntity[];
  priceOrdL2H: boolean; // 价格从低到高
  timeOrdM2N: boolean; // 时间从早到晚
  isRoundTrip: boolean; // 是否是往返
  private isRenderingView: boolean;
  loading = true;
  isFiltered = false;
  @ViewChild(FlyFilterComponent) filterComp: FlyFilterComponent;
  @ViewChild(FlyDaysCalendarComponent)
  flyDaysCalendarComp: FlyDaysCalendarComponent;
  @ViewChild(IonRefresher) refresher: IonRefresher;
  activeTab: "filter" | "time" | "price" | "none"; // 当前激活的tab
  hasDataSource: Subject<boolean>;
  showAdvSearchPage$: Observable<boolean>;
  showSelectFlyDayPage$: Observable<boolean>;

  private staff: StaffEntity;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private flightService: FlightService,
    private ngZone: NgZone,
    private flyDayService: FlydayService,
    private hrService: HrService,
    private apiService: ApiService,
    private identityService: IdentityService,
    private domCtrl: DomController
  ) {
    this.hasDataSource = new BehaviorSubject(false);
    this.vmFlights = [];
    this.flightJourneyList = [];
    this.searchFlightCondition = new SearchFlightModel();
    this.route.queryParamMap.subscribe(async d => {
      this.staff = await this.hrService.getStaff();
      if (
        !this.isStaffTypeSelf() &&
        this.flightService.getPassengerFlightSegments().length === 0
      ) {
        // 必须先选择一个客户
        this.router.navigate([AppHelper.getRoutePath("select-passengers")]);
        return;
      }
      console.log("staff ", this.staff);
      console.log("路由参数：", d);
      if (d.get("searchFlightModel")) {
        this.searchFlightCondition = JSON.parse(d.get("searchFlightModel"));
        this.isRoundTrip = this.searchFlightCondition.IsRoundTrip;
      }
      if (d.get("fromCity")) {
        // console.log("路由参数：",d.data);
        this.vmFromCity = JSON.parse(d.get("fromCity"));
      }
      if (d.get("toCity")) {
        // console.log("路由参数：",d.data);
        this.vmToCity = JSON.parse(d.get("toCity"));
      }
      // console.log(this.s);
    });
    this.showAdvSearchPage$ = this.flightService.getFilterPanelShow();
  }
  async isStaffTypeSelf() {
    const s = await this.hrService.getStaff();
    return s.BookType == StaffBookType.Self;
  }
  onCalenderClick() {
    this.flyDayService.setFlyDayMulti(false);
    this.flyDayService.showFlyDayPage(true);
  }
  bookFlight() {
    this.router.navigate([AppHelper.getRoutePath("book-flight")]);
  }
  onChangedDay(day: DayModel) {
    if (!day || this.searchFlightCondition.Date == day.date || this.loading) {
      return;
    }
    this.filterCondition.priceFromL2H = "initial";
    this.filterCondition.timeFromM2N = "initial";
    this.activeTab =
      this.filterComp &&
      Object.keys(this.filterComp.userOps).some(k => this.filterComp.userOps[k])
        ? "filter"
        : "none";
    this.searchFlightCondition.Date = day.date;
    this.doRefresh(true, true);
  }
  async onBookTicket(evt: {
    cabin: FlightCabinEntity;
    flightSegment: FlightSegmentEntity;
  }) {
    this.staff = await this.hrService.getStaff();
    if (!this.isStaffTypeSelf()) {
      if (this.flightService.getPassengerFlightSegments.length === 0) {
        const ok = await AppHelper.alert(
          LanguageHelper.getSelectPassengersTip(),
          true,
          LanguageHelper.getConfirmTip()
        );
        if (ok) {
          this.goToSelectPassengerPage();
        }
      } else {
        const ok = await AppHelper.alert(
          LanguageHelper.getSelectPassengersTip(),
          true,
          LanguageHelper.getConfirmTip(),
          LanguageHelper.getCancelTip()
        );
        if (ok) {
          this.goToSelectPassengerPage();
        }
      }
    } else {
    }
  }
  goToSelectPassengerPage() {
    this.router.navigate([AppHelper.getRoutePath("select-passenger")]);
  }
  async doRefresh(loadDataFromServer: boolean, keepSearchCondition: boolean) {
    this.apiService.showLoadingView();
    // 如果不是个人，则必须先选择一个客户
    if (
      !this.isStaffTypeSelf() &&
      this.flightService.getPassengerFlightSegments().length === 0
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
    let data = this.flightJourneyList;
    this.hasDataSource.next(false);
    if (loadDataFromServer) {
      // 强制从服务器端返回新数据
      data = await this.loadPolicyedFlights();
    }
    // 根据筛选条件过滤航班信息：
    const filteredFlightJourenyList = this.filterFlightJourneyList(
      JSON.parse(JSON.stringify(data))
    );
    this.isFiltered =
      this.filterComp &&
      Object.keys(this.filterComp.userOps).some(
        k => this.filterComp.userOps[k]
      );
    await this.renderView(
      this.flightService.getTotalFlySegments(filteredFlightJourenyList)
    );
    this.loading = false;
    this.hasDataSource.next(!!this.vmFlights.length && !this.loading);
    if (this.refresher) {
      this.refresher.complete();
    }
    this.apiService.hideLoadingView();
  }
  private scrollToTop() {
    setTimeout(() => {
      if (this.cnt) {
        this.cnt.scrollToTop(300);
      }
    }, 300);
  }
  private async loadPolicyedFlights() {
    // 先获取最新的数据
    this.flightJourneyList = await this.flightService.getFlightJourneyDetailList(
      this.searchFlightCondition
    );
    console.log(
      `${this.searchFlightCondition.Date} 共 ${
        this.flightService.getTotalFlySegments(this.flightJourneyList).length
      }个航班`
    );
    // 配置差标
    if (this.isStaffTypeSelf()) {
      // 个人差标
      if (this.flightJourneyList.length) {
        const identity = await this.identityService.getIdentityPromise();
        const flights = await this.flightService.policyflights(
          this.flightJourneyList,
          [identity.Id]
        );
        if (flights.length) {
          this.flightJourneyList = await this.replaceCabinInfo(
            flights[0].FlightPolicies,
            this.flightJourneyList
          );
        }
      }
    } else {
      // 角色： 代理和秘书、特殊
      const passengerFlightSegments = this.flightService.getPassengerFlightSegments();
      if (passengerFlightSegments.length) {
        const unSelectFlightSegmentPassengers = passengerFlightSegments
          .filter(pf => pf.flightSegments.length === 0)
          .map(pf => pf.passenger);
        if (unSelectFlightSegmentPassengers.length) {
          const flights = await this.flightService.policyflights(
            this.flightJourneyList,
            unSelectFlightSegmentPassengers.map(p => p.AccountId)
          );
          if (flights.length) {
            this.flightJourneyList = await this.replaceCabinInfo(
              flights[0].FlightPolicies,
              this.flightJourneyList
            );
          }
        } else {
          // 重新获取全部人员的差标信息
          const flights = await this.flightService.policyflights(
            this.flightJourneyList,
            passengerFlightSegments
              .map(item => item.passenger)
              .map(p => p.AccountId)
          );
          if (flights.length) {
            this.flightJourneyList = await this.replaceCabinInfo(
              flights[0].FlightPolicies,
              this.flightJourneyList
            );
          }
        }
      } else {
        this.goToSelectPassengerPage();
      }
    }
    return this.flightJourneyList;
  }
  goToFlightCabinsDetails(fs: FlightSegmentEntity) {
    this.router.navigate([AppHelper.getRoutePath("flight-item-cabins")], {
      queryParams: { flightSegment: JSON.stringify(fs) }
    });
  }
  private async renderView(totalFilteredSegments: FlightSegmentEntity[]) {
    if (this.isRenderingView) {
      return Promise.resolve(false);
    }
    this.vmFlights = [];
    this.isRenderingView = true;
    return new Promise(s => {
      const st = Date.now();
      const pageSize = 3;
      console.log(
        `totalFilteredSegments.length=${totalFilteredSegments.length}`
      );
      const loop = () => {
        const slice = totalFilteredSegments.splice(0, pageSize);
        this.vmFlights = [...this.vmFlights, ...slice];
        console.log(
          `looping , ${Date.now() - st} ms `,
          this.vmFlights.length,
          totalFilteredSegments.length
        );
        if (totalFilteredSegments.length) {
          this.apiService.showLoadingView();
          window.requestAnimationFrame(loop);
        } else {
          console.log(`loopEnd ,总耗时： ${Date.now() - st} ms `);
          setTimeout(() => {
            this.isRenderingView = false;
            s(true);
          }, 1000);
        }
      };
      loop();
    });
  }
  private async replaceCabinInfo(
    flightPolicies: FlightPolicy[],
    flights: FlightJourneyEntity[]
  ) {
    if (flightPolicies && flightPolicies.length && flights && flights.length) {
      flights.forEach(f => {
        f.FlightRoutes.forEach(r => {
          r.FlightSegments.forEach(s => {
            const cabins = flightPolicies.filter(fp => fp.FlightNo == s.Number);
            if (cabins.length) {
              cabins.forEach(c => {
                s.Cabins.forEach(sc => {
                  if (sc.Code == c.CabinCode) {
                    // console.log("替换cabin ", sc, c);
                    c.Cabin = sc;
                  }
                });
              });
            }
            s.PoliciedCabins = cabins;
          });
        });
      });
    }
    return flights;
  }
  onItemClick(f: FlightSegmentEntity) {
    // console.log(f);
    this.router.navigate([
      AppHelper.getRoutePath("flight-detail"),
      { flightSegment: JSON.stringify(f) }
    ]);
  }

  ngOnInit() {
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
      .subscribe(days => {
        if (days && days.length) {
          console.log("选择的日期", days);
          if (this.isRoundTrip) {
          }
          const day = days[0];
          if (!day) {
            return;
          }
          if (this.searchFlightCondition.Date != day.date) {
            this.searchFlightCondition.Date = day.date;
            if (this.flyDaysCalendarComp) {
              this.flyDaysCalendarComp.onDaySelected(day);
            }
          }
          this.searchFlightCondition.Date = day.date;
          this.doRefresh(true, false);
        }
      });
  }
  ngOnDestroy() {
    this.vmFlights = [];
    this.selectDaySubscription.unsubscribe();
    this.filterConditionSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    this.apiService.showLoadingView();
    if (this.searchFlightCondition && this.searchFlightCondition.Date) {
      if (this.flyDaysCalendarComp) {
        const day = this.flyDayService.generateDayModelByDate(
          this.searchFlightCondition.Date
        );
        setTimeout(() => {
          this.flyDaysCalendarComp.onDaySelected(day);
        }, 1200);
      }
      setTimeout(() => {
        this.doRefresh(true, false);
      }, 1000);
    }
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
    this.activeTab = "time";
    this.timeOrdM2N = !this.timeOrdM2N;
    await this.sortFlights("time");
  }
  async onPriceOrder() {
    this.loading = true;
    this.activeTab = "price";
    this.priceOrdL2H = !this.priceOrdL2H;
    await this.sortFlights("price");
    this.loading = false;
  }
  private async sortFlights(key: "price" | "time") {
    if (key === "price") {
      this.filterCondition.priceFromL2H = this.priceOrdL2H
        ? "low2Height"
        : "height2Low";
      this.filterCondition.timeFromM2N = "initial";
    }
    if (key === "time") {
      this.filterCondition.timeFromM2N = this.timeOrdM2N ? "am2pm" : "pm2am";
      this.filterCondition.priceFromL2H = "initial";
    }
    this.domCtrl.write(() => {
      this.vmFlights = [
        ...this.getSortedFlightSegments(this.vmFlights, this.filterCondition)
      ];
      this.scrollToTop();
    });
  }
  private getSortedFlightSegments(
    flysegs: FlightSegmentEntity[],
    data: FilterConditionModel
  ) {
    if (data.priceFromL2H !== "initial") {
      // 按照价格排序
      return this.sortByPrice(flysegs, data.priceFromL2H == "low2Height");
    }
    if (data.timeFromM2N !== "initial") {
      // 按照时间排序
      return this.sortByTime(flysegs, data.timeFromM2N == "am2pm");
    }
    return flysegs;
  }
  private sortByPrice(arr: FlightSegmentEntity[], l2h: boolean) {
    return arr.sort((s1, s2) => {
      let sub = +s1.LowestFare - +s2.LowestFare;
      sub = sub === 0 ? 0 : sub > 0 ? 1 : -1;
      return l2h ? sub : -sub;
    });
  }
  private sortByTime(arr: FlightSegmentEntity[], l2h: boolean) {
    return arr.sort((s1, s2) => {
      let sub = +moment(s1.TakeoffTime) - +moment(s2.TakeoffTime);
      sub = sub === 0 ? 0 : sub > 0 ? 1 : -1;
      // console.log("时间排序，l2h",sub);
      return l2h ? sub : -sub;
    });
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
    if (this.filterCondition.onlyDirect) {
      result = result.map(f => {
        f.FlightRoutes = f.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s => !s.IsStop);
          return r;
        });
        return f;
      });
    }
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
    if (
      this.filterCondition.airports &&
      this.filterCondition.airports.length > 0
    ) {
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s =>
            this.filterCondition.airports.some(a => a.id === s.ToAirport)
          );
          return r;
        });
        return fly;
      });
    }
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
    if (this.filterCondition.takeOffTimeSpan) {
      // console.log(this.filterCondition.takeOffTimeSpan);
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s => {
            // console.log(moment(s.TakeoffTime).hour());
            return (
              this.filterCondition.takeOffTimeSpan.lower <=
                moment(s.TakeoffTime).hour() &&
              (moment(s.TakeoffTime).hour() <
                this.filterCondition.takeOffTimeSpan.upper ||
                (moment(s.TakeoffTime).hour() ==
                  this.filterCondition.takeOffTimeSpan.upper &&
                  moment(s.TakeoffTime).minutes() == 0))
            );
          });
          return r;
        });
        return fly;
      });
    }
    // console.log(result);
    return result;
  }
}
