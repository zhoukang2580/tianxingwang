import { FlightPolicy } from "./../flight.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import { IdentityEntity } from "./../../services/identity/identity.entity";
import { StaffBookType } from "./../../tmc/models/StaffBookType";
import { HrService, StaffEntity } from "./../../hr/hr.service";
import { AppHelper } from "src/app/appHelper";
import { animate } from "@angular/animations";
import { trigger, state, style, transition } from "@angular/animations";
import { IonContent, IonRefresher, IonInfiniteScroll } from "@ionic/angular";
import {
  Observable,
  Subscription,
  of,
  fromEvent,
  Subject,
  BehaviorSubject,
  interval
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
import { FlydayService } from "../select-fly-days/flyday.service";
import { SearchFlightModel } from "../models/flight/SearchFlightModel";
import { AdvSearchCondModel } from "../models/flight/advanced-search-cond/AdvSearchCondModel";
import { DayModel } from "../models/DayModel";
import { FlightService, Trafficline } from "../flight.service";
import { FlightSegmentEntity } from "../models/flight/FlightSegmentEntity";
import { FlightJourneyEntity } from "../models/flight/FlightJourneyEntity";
import { FlightCabinType } from "../models/flight/FlightCabinType";
import { FlightCabinEntity } from "../models/flight/FlightCabinEntity";
import { LanguageHelper } from "src/app/languageHelper";
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
  sortCondition: SearchFlightModel;
  @ViewChild("cnt") cnt: IonContent;
  flights: FlightJourneyEntity[]; // 保持和后台返回的数据一致
  vmFlights: FlightSegmentEntity[]; // 用于视图展示
  vmToCity: Trafficline;
  vmFromCity: Trafficline;
  advSCondSub = Subscription.EMPTY;
  selectedFlyDaysSub = Subscription.EMPTY;
  vmFlightJourneys: FlightJourneyEntity[];
  totalFilteredSegments: FlightSegmentEntity[];
  priceOrdL2H: boolean; // 价格从低到高
  timeOrdM2N: boolean; // 时间从早到晚
  isRoundTrip: boolean; // 是否是往返
  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  activeTab: "filter" | "time" | "price" | "none"; // 当前激活的tab
  isMoving$: Observable<boolean>;
  hasDataSj: Subject<boolean>;
  showAdvSearchPage$: Observable<boolean>;
  showSelectFlyDayPage$: Observable<boolean>;
  private autoRefreshSources: Subject<boolean>;
  private staff: StaffEntity;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private flightService: FlightService,
    private ngZone: NgZone,
    private flyDayService: FlydayService,
    private hrService: HrService,
    private identityService: IdentityService
  ) {
    this.hasDataSj = new BehaviorSubject(false);
    this.autoRefreshSources = new BehaviorSubject(false);
    this.vmFlights = [];
    this.flights = [];
    this.sortCondition = new SearchFlightModel();
    this.route.queryParamMap.subscribe(async d => {
      this.staff = await this.hrService.getStaff();
      console.log("staff ", this.staff);
      console.log("路由参数：", d);
      if (d.get("searchFlightModel")) {
        this.sortCondition = JSON.parse(d.get("searchFlightModel"));
        this.sortCondition.curPage = 1;
        this.sortCondition.pageSize = 5;
        this.isRoundTrip = this.sortCondition.isRoundTrip;
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
    this.showAdvSearchPage$ = this.flightService.getShowAdvSearchConditions();
  }
  async isStaffTypeSelf() {
    const s = await this.hrService.getStaff();
    return (
      s.BookType != StaffBookType.All && s.BookType != StaffBookType.Secretary
    );
  }
  onCalenderClick() {}
  bookFlight() {
    this.router.navigate([AppHelper.getRoutePath("book-flight")]);
  }
  onChangedDay(day: DayModel) {
    if (!day || this.sortCondition.Date == day.date) {
      return;
    }
    this.sortCondition.PriceFromL2H = void 0;
    this.sortCondition.TimeFromM2N = void 0;
    this.activeTab =
      this.sortCondition.AdvSCon &&
      Object.keys(this.sortCondition.AdvSCon).some(
        key =>
          this.sortCondition.AdvSCon[key] ||
          (this.sortCondition.AdvSCon[key] instanceof Array &&
            this.sortCondition.AdvSCon[key].length)
      )
        ? "filter"
        : "none";
    // console.log("active tab", this.activeTab);
    this.sortCondition.Date = day.date;
    this.vmFlights = [];
    setTimeout(() => {
      this.doRefresh(true);
    }, 500);
  }
  async onBookTicket(evt: {
    cabin: FlightCabinEntity;
    flightSegment: FlightSegmentEntity;
  }) {
    this.staff = await this.hrService.getStaff();
    if (!this.isStaffTypeSelf()) {
      if (this.flightService.getSelectedPassengers.length === 0) {
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
  async doRefresh(keepSearchCondition?: boolean) {
    // console.log(evt);
    this.flightService.setResetAdvCond(!keepSearchCondition);
    this.sortCondition = {
      ...this.sortCondition,
      AdvSCon: keepSearchCondition
        ? this.sortCondition.AdvSCon
        : new AdvSearchCondModel()
    };
    this.sortCondition.curPage = 1;
    this.sortCondition.pageSize = 10;
    this.vmFlights = [];
    if (this.scroller) {
      this.scroller.disabled = false;
    }
    if (!keepSearchCondition) {
      setTimeout(() => {
        this.activeTab = "none";
      }, 0);
    }
    this.searchFlys();
  }

  loadMore() {
    const loop = () => {
      const slice = this.totalFilteredSegments.slice(
        (this.sortCondition.curPage - 1) * this.sortCondition.pageSize,
        this.sortCondition.curPage * this.sortCondition.pageSize
      );
      slice.forEach(item => {
        this.vmFlights.push(item);
      });
      if (this.vmFlights.length < this.totalFilteredSegments.length) {
        this.sortCondition.curPage++;
        window.requestAnimationFrame(loop);
      }
    };
    loop();
    if (this.scroller) {
      setTimeout(() => {
        this.scroller.complete();
      }, 300);
      this.scroller.disabled = true;
    }
  }
  private async searchPolicy() {
    const flys = await this.flightService.searchFlightJourneyDetailList(
      this.sortCondition
    );
    if (this.isStaffTypeSelf()) {
      const identity = await this.identityService.getIdentityPromise();
      const policyFlights = await this.flightService.policyflights(flys, [
        identity.Id
      ]);
    }
    return flys;
  }
  private async searchFlys() {
    console.log("高阶查询", this.sortCondition.AdvSCon);
    const flys = await this.searchPolicy();
    this.vmFlightJourneys = flys.map(f => {
      f.FlightRoutes = f.FlightRoutes.map(r => {
        return r;
      });
      return f;
    });
    if (this.scroller) {
      this.scroller.complete();
    }
    if (this.refresher) {
      this.refresher.complete();
    }
    this.flights = JSON.parse(JSON.stringify(flys)); // 深拷贝对象，数组
    const vmFlights = this.advSearch(flys, this.sortCondition);
    this.totalFilteredSegments = this.flightService.getTotalFlySegments(
      vmFlights
    );
    vmFlights.forEach(vf => {
      this.hasDataSj.next(
        vf.FlightRoutes.some(r => r.FlightSegments.length > 0)
      );
    });

    setTimeout(() => {
      if (this.cnt) {
        this.cnt.scrollToTop(300);
      }
    }, 300);
    if (this.refresher) {
      this.refresher.complete();
    }
    this.loadMore();
  }

  onItemClick(f: FlightSegmentEntity) {
    // console.log(f);
    this.router.navigate([
      AppHelper.getRoutePath("flight-detail"),
      { flightSegment: JSON.stringify(f) }
    ]);
  }
  private advSearch(flys: FlightJourneyEntity[], data: SearchFlightModel) {
    let result = flys;
    if (!data.AdvSCon) {
      return result;
    }
    if (data.AdvSCon.airCompanies && data.AdvSCon.airCompanies.length > 0) {
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s =>
            data.AdvSCon.airCompanies.some(a => a.id === s.Airline)
          );
          return r;
        });
        return fly;
      });
    }
    if (data.AdvSCon.airports && data.AdvSCon.airports.length > 0) {
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s =>
            data.AdvSCon.airports.some(a => a.id === s.ToAirport)
          );
          return r;
        });
        return fly;
      });
    }
    if (data.AdvSCon.airTypes && data.AdvSCon.airTypes.length > 0) {
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s =>
            data.AdvSCon.airTypes.some(a => a.id === s.PlaneType)
          );
          return r;
        });
        return fly;
      });
    }
    if (data.AdvSCon.cabins && data.AdvSCon.cabins.length > 0) {
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s =>
            data.AdvSCon.cabins.some(
              a => FlightCabinType[a.id] === s.LowestCabinType
            )
          );
          return r;
        });
        return fly;
      });
    }
    if (data.AdvSCon.takeOffTimeSpan) {
      console.log(data.AdvSCon.takeOffTimeSpan);
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s => {
            // console.log(moment(s.TakeoffTime).hour());
            return (
              data.AdvSCon.takeOffTimeSpan.lower <=
                moment(s.TakeoffTime, "YYYY-MM-DDTHH:mm:ss").hour() &&
              (moment(s.TakeoffTime, "YYYY-MM-DDTHH:mm:ss").hour() <
                data.AdvSCon.takeOffTimeSpan.upper ||
                (moment(s.TakeoffTime, "YYYY-MM-DDTHH:mm:ss").hour() ==
                  data.AdvSCon.takeOffTimeSpan.upper &&
                  moment(s.TakeoffTime, "YYYY-MM-DDTHH:mm:ss").minutes() == 0))
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
  ngOnInit() {
    this.activeTab = "filter";
    this.advSCondSub = this.flightService
      .getAdvSConditions()
      .subscribe(advScond => {
        this.sortCondition.AdvSCon = advScond || new AdvSearchCondModel();
        if (this.sortCondition.AdvSCon) {
          console.log("高阶查询", this.sortCondition.AdvSCon);
          this.sortCondition.curPage = 1;
          this.sortCondition.pageSize = 5;
          this.vmFlights = [];
          if (this.scroller) {
            this.scroller.disabled = false;
          }
          this.searchFlys();
        }
      });
    this.selectedFlyDaysSub = this.flyDayService
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
          this.sortCondition.Date = day.date;
          this.vmFlights = [];
          this.doRefresh(null);
        }
      });
  }
  ngOnDestroy() {
    this.selectedFlyDaysSub.unsubscribe();
    this.advSCondSub.unsubscribe();
  }

  ngAfterViewInit() {
    // console.dir(this.cnt);
    this.doRefresh(null);
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
                  this.ngZone.run(() => {
                    this.isMoving$ = of(false);
                  });
                })
              )
            )
          )
        )
      )
      .subscribe(() => {
        this.ngZone.run(() => {
          this.isMoving$ = of(true);
          console.log("正在滚动");
        });
      });
  }
  onFilter() {
    this.activeTab = "filter";
    this.flightService.setShowAdvSearchConditions(true);
  }
  onTimeOrder() {
    this.activeTab = "time";
    this.timeOrdM2N = !this.timeOrdM2N;
    this.sortFlights("time");
  }
  onPriceOrder() {
    this.activeTab = "price";
    this.priceOrdL2H = !this.priceOrdL2H;
    this.sortFlights("price");
  }
  sortFlights(key: "price" | "time") {
    this.sortCondition.curPage = 1;
    this.sortCondition.pageSize = 5;
    this.vmFlights = [];
    if (this.scroller) {
      this.scroller.disabled = false;
    }
    if (key === "price") {
      this.sortCondition.PriceFromL2H = this.priceOrdL2H;
      this.sortCondition.TimeFromM2N = void 0;
    }
    if (key === "time") {
      this.sortCondition.TimeFromM2N = this.timeOrdM2N;
      this.sortCondition.PriceFromL2H = void 0;
    }
    const vmFlights = this.advSearch(this.flights, this.sortCondition);
    this.vmFlightJourneys = this.flightService.sortedFlightJourneys(
      vmFlights,
      this.sortCondition
    );
    this.loadMore();
    setTimeout(() => {
      if (this.cnt) {
        this.cnt.scrollToTop(300);
      }
    }, 300);
  }
}
